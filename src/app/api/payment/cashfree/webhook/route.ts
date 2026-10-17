import { NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendSaleSuccessTelegramAlert } from '@/lib/telegram';
import { sendMetaCapiPurchase } from '@/lib/metaCapi';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';
    const timestamp = request.headers.get('x-webhook-timestamp') || '';

    // Verify Cashfree cryptographic signature
    const isValid = await verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      console.warn('[Cashfree Webhook] Invalid webhook signature detected.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.type || payload.event || '';
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const orderId = String(orderData.order_id || payload.data?.order_id || '').trim();
    const paymentStatus = String(
      paymentData.payment_status || orderData.order_status || ''
    ).toUpperCase();
    const cfPaymentId = String(paymentData.cf_payment_id || '').trim();

    if (!orderId) {
      return NextResponse.json({ success: true, message: 'No order ID in event' });
    }

    // Process successful payment
    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
      let storedOrder: any = null;
      let orderRef = null;

      if (db) {
        orderRef = doc(db, 'orders', orderId);
        try {
          const snap = await getDoc(orderRef);
          if (snap.exists()) {
            storedOrder = snap.data();
          }
        } catch (e) {
          console.warn('[Cashfree Webhook] Error reading order:', e);
        }
      }

      const isAlreadyCompleted = storedOrder?.status === 'completed';
      const isCapiDelivered = storedOrder?.purchase_event_status === 'delivered';

      let capiStatus = storedOrder?.purchase_event_status || 'pending';
      let capiSentAt = storedOrder?.purchase_event_sent_at || null;

      // 1. Dispatch CAPI if not already delivered
      if (!isCapiDelivered) {
        try {
          const capiResult = await sendMetaCapiPurchase({
            orderId,
            totalAmount: Number(storedOrder?.totalAmount || orderData.order_amount || paymentData.payment_amount || 0),
            currency: 'INR',
            items: storedOrder?.items || [],
            customer: storedOrder?.customer,
          });

          if (capiResult.success) {
            capiStatus = 'delivered';
            capiSentAt = new Date().toISOString();
          } else if (!capiResult.skipped) {
            capiStatus = 'failed';
          }
        } catch (err) {
          console.error('[Cashfree Webhook] CAPI dispatch error:', err);
        }
      }

      // 2. Atomically update Firestore
      if (orderRef) {
        try {
          const updatePayload: Record<string, any> = {
            status: 'completed',
            purchase_event_id: `purchase_${orderId}`,
            purchase_event_status: capiStatus,
          };
          if (cfPaymentId) {
            updatePayload.cf_payment_id = cfPaymentId;
          }
          if (capiSentAt) {
            updatePayload.purchase_event_sent_at = capiSentAt;
          }
          await updateDoc(orderRef, updatePayload);
        } catch (err) {
          console.warn('[Cashfree Webhook] Firestore update error:', err);
        }
      }

      // 3. Dispatch Telegram alert if not already notified
      if (!isAlreadyCompleted) {
        await sendSaleSuccessTelegramAlert({
          orderNumber: orderId,
          customer: {
            fullName: storedOrder?.customer?.fullName || 'Customer',
            email: storedOrder?.customer?.email || '',
            phone: storedOrder?.customer?.phone || '',
          },
          items: storedOrder?.items || [],
          orderBump: storedOrder?.orderBump || null,
          totalAmount: Number(storedOrder?.totalAmount || orderData.order_amount || 0),
          paymentStatus: 'PAID (Webhook Verified)',
          paymentMethod: 'Cashfree Webhook',
        });
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (err: any) {
    console.error('[Cashfree Webhook Error]', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
