import { NextResponse } from 'next/server';
import { verifyCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import {
  sendSaleSuccessTelegramAlert,
  sendAbandonedOrPendingTelegramAlert,
} from '@/lib/telegram';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

async function resolveDriveLinkForProduct(item: { id?: string; title?: string }): Promise<string> {
  const cleanId = String(item.id || '').trim();
  const cleanTitle = String(item.title || '').trim().toLowerCase();

  // 1. Check Firestore products collection directly
  if (db && cleanId) {
    try {
      const snap = await getDoc(doc(db, 'products', cleanId));
      if (snap.exists()) {
        const data = snap.data();
        const link =
          data.google_drive_link ||
          data.googleDriveLink ||
          data.files?.[0]?.file_url;
        if (link && typeof link === 'string' && link.startsWith('http')) {
          return link;
        }
      }
    } catch (e) {
      console.warn('Error reading product doc for drive link:', e);
    }
  }

  // 2. Search Firestore products collection by title or slug
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      for (const d of snap.docs) {
        const data = d.data();
        const matchesName = data.name && data.name.toLowerCase() === cleanTitle;
        const matchesSlug = data.slug && (data.slug === cleanId || cleanTitle.includes(data.slug));
        if (matchesName || matchesSlug) {
          const link =
            data.google_drive_link ||
            data.googleDriveLink ||
            data.files?.[0]?.file_url;
          if (link && typeof link === 'string' && link.startsWith('http')) {
            return link;
          }
        }
      }
    } catch (e) {
      console.warn('Error scanning Firestore products for drive link:', e);
    }
  }

  // 3. Fallback to internal catalog
  const matched = BUNDLE_PRODUCTS.find(
    (b) =>
      b.id === cleanId ||
      b.slug === cleanId ||
      b.title.toLowerCase() === cleanTitle ||
      (cleanTitle && cleanTitle.includes(b.slug))
  );

  if (matched?.googleDriveLink && matched.googleDriveLink.startsWith('http')) {
    return matched.googleDriveLink;
  }

  return 'https://drive.google.com/drive/folders/vaultzet-master-access';
}

async function handleVerify(orderId: string) {
  const verification = await verifyCashfreePgOrder(orderId);

  let storedOrder: any = null;
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        storedOrder = snap.data();
      }
    } catch {}
  }

  const alertPayload = {
    orderNumber: orderId,
    customer: {
      fullName: storedOrder?.customer?.fullName || 'Customer',
      email: storedOrder?.customer?.email || '',
      phone: storedOrder?.customer?.phone || '',
    },
    items: storedOrder?.items || [],
    orderBump: storedOrder?.orderBump || null,
    totalAmount: Number(storedOrder?.totalAmount || verification.order_amount || 0),
    paymentStatus: verification.order_status || (verification.paid ? 'PAID' : 'INCOMPLETE'),
    paymentMethod: 'Cashfree UPI / Card',
  };

  if (verification.paid) {
    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'completed',
        });
      } catch (err) {
        console.warn('Error updating Firestore order status:', err);
      }
    }
    if (storedOrder?.status !== 'completed') {
      await sendSaleSuccessTelegramAlert(alertPayload);
    }

    // Resolve secure download links exclusively for paid orders
    const rawItems = storedOrder?.items && storedOrder.items.length > 0
      ? storedOrder.items
      : [{ id: 'bundle', title: 'Viral Reels Bundle', license: 'personal' }];

    const verifiedItems = await Promise.all(
      rawItems.map(async (it: any) => {
        const link = await resolveDriveLinkForProduct(it);
        return {
          id: it.id,
          title: it.title,
          license: it.license || 'personal',
          googleDriveLink: link,
        };
      })
    );

    return {
      ...verification,
      orderNumber: orderId,
      customer: storedOrder?.customer || { fullName: 'Customer', email: '' },
      items: verifiedItems,
      hasBump: Boolean(storedOrder?.orderBump),
    };
  } else {
    await sendAbandonedOrPendingTelegramAlert(alertPayload, 'payment_abandoned');
    return {
      ...verification,
      orderNumber: orderId,
      customer: storedOrder?.customer || { fullName: 'Customer', email: '' },
      items: [],
      hasBump: false,
    };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'order_id parameter is required' },
        { status: 400 }
      );
    }

    const verification: any = await handleVerify(orderId);

    if (verification.paid) {
      return NextResponse.json({
        success: true,
        paid: true,
        order_status: verification.order_status,
        order_amount: verification.order_amount,
        orderNumber: verification.orderNumber,
        customer: verification.customer,
        items: verification.items,
        hasBump: verification.hasBump,
      });
    }

    return NextResponse.json({
      success: false,
      paid: false,
      order_status: verification.order_status || 'PENDING',
      order_amount: verification.order_amount,
      orderNumber: orderId,
      error: 'Payment incomplete or pending confirmation',
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Cashfree order',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId || body.order_id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const verification: any = await handleVerify(orderId);

    if (verification.paid) {
      return NextResponse.json({
        success: true,
        paid: true,
        order_status: verification.order_status,
        order_amount: verification.order_amount,
        orderNumber: verification.orderNumber,
        customer: verification.customer,
        items: verification.items,
        hasBump: verification.hasBump,
      });
    }

    return NextResponse.json({
      success: false,
      paid: false,
      order_status: verification.order_status || 'PENDING',
      order_amount: verification.order_amount,
      orderNumber: orderId,
      error: 'Payment incomplete or pending confirmation',
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Cashfree order',
      },
      { status: 500 }
    );
  }
}
