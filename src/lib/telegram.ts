// Telegram Instant Alert Bot for Vaultzet Store
// Locked exclusively to Owner Chat ID: 5950203511

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '8995964034:AAHo5Sy8ziH00VzNvY8G33oAAc2m9ZT77jQ';
const OWNER_CHAT_ID = '5950203511';

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getIstTimestamp(): string {
  try {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return new Date().toISOString();
  }
}

export function buildWhatsAppFollowUpUrl(phone: string, message: string): string {
  let digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = `91${digits.slice(1)}`;
  }
  if (!digits || digits.length < 10) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

async function sendTelegramMessage(
  htmlText: string,
  inlineButtons?: Array<Array<{ text: string; url: string }>>
): Promise<boolean> {
  try {
    const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload: Record<string, any> = {
      chat_id: OWNER_CHAT_ID,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineButtons,
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Telegram API non-200 response:', errText);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Failed to dispatch Telegram alert:', err);
    return false;
  }
}

export interface OrderAlertData {
  orderNumber: string;
  customer: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    id?: string;
    title: string;
    license?: string;
    price: number;
    googleDriveLink?: string;
  }>;
  orderBump?: {
    title: string;
    price: number;
  } | null;
  totalAmount: number;
  paymentStatus?: string;
  paymentMethod?: string;
}

/**
 * 1. Alert for Checkout Initiated OR Payment Abandoned / Incomplete
 */
export async function sendAbandonedOrPendingTelegramAlert(
  data: OrderAlertData,
  mode: 'checkout_initiated' | 'payment_abandoned' = 'payment_abandoned'
): Promise<boolean> {
  const customerName = data.customer?.fullName?.trim() || 'Valued Customer';
  const customerEmail = data.customer?.email?.trim() || 'N/A';
  const customerPhone = data.customer?.phone?.trim() || 'N/A';
  const items = data.items || [];

  const productNamesList =
    items.map((i) => i.title).join(', ') +
    (data.orderBump ? ` + ${data.orderBump.title}` : '');

  const itemsFormatted =
    items.length > 0
      ? items
          .map(
            (it, idx) =>
              `   ${idx + 1}. <b>${escapeHtml(it.title)}</b> (${escapeHtml(
                it.license || 'personal'
              )}) — ₹${it.price}`
          )
          .join('\n')
      : '   • Digital Reels Bundle';

  const bumpLine = data.orderBump
    ? `\n🎁 <b>Bonus Bump:</b> ${escapeHtml(data.orderBump.title)} (+₹${data.orderBump.price})`
    : '';

  const header =
    mode === 'payment_abandoned'
      ? `⚠️🚨 <b>PAYMENT ABANDONED / INCOMPLETE!</b> 🚨⚠️\n━━━━━━━━━━━━━━━━━━━━━━`
      : `🛒🔔 <b>NEW CHECKOUT STARTED (PENDING)!</b> 🔔🛒\n━━━━━━━━━━━━━━━━━━━━━━`;

  const statusBadge =
    mode === 'payment_abandoned'
      ? `❌ <b>ABANDONED / NOT PAID (${escapeHtml(data.paymentStatus || 'INCOMPLETE')})</b>`
      : `⏳ <b>AWAITING PAYMENT (Checkout Opened)</b>`;

  const text = `${header}

🆔 <b>Order ID:</b> <code>${escapeHtml(data.orderNumber)}</code>
📌 <b>Status:</b> ${statusBadge}
💰 <b>Cart Value:</b> <b>₹${data.totalAmount}.00</b>

👤 <b>Customer Details:</b>
   • <b>Name:</b> ${escapeHtml(customerName)}
   • <b>Phone / WhatsApp:</b> <code>${escapeHtml(customerPhone)}</code>
   • <b>Email:</b> <code>${escapeHtml(customerEmail)}</code>

📦 <b>Selected Products:</b>
${itemsFormatted}${bumpLine}

🕒 <b>Time (IST):</b> ${escapeHtml(getIstTimestamp())}
━━━━━━━━━━━━━━━━━━━━━━
👇 <i>Tap the button below to instantly follow up with the customer on WhatsApp with pre-filled product details!</i>`;

  const followUpMsg = `Hi ${customerName}! 👋\n\nWe noticed you were checking out on *Vaultzet Store* (Order #${data.orderNumber}), but your payment of *₹${data.totalAmount}* was not completed.\n\n📦 *Your Selected Bundle(s):*\n• ${productNamesList || 'Viral Reels Bundle'}\n\n✨ Complete your order now to get *100% Instant Google Drive Download Access*:\n👉 https://vaultzet.shop/checkout\n\nReply here if you need any help with UPI or payment! 🚀`;

  const waUrl = buildWhatsAppFollowUpUrl(customerPhone, followUpMsg);

  return sendTelegramMessage(text, [
    [{ text: `💬 WhatsApp Follow-Up (${customerPhone})`, url: waUrl }],
    [{ text: '🌐 Open Vaultzet Store', url: 'https://vaultzet.shop' }],
  ]);
}

/**
 * 2. Alert for Confirmed Sale / Successful Payment
 */
export async function sendSaleSuccessTelegramAlert(data: OrderAlertData): Promise<boolean> {
  const customerName = data.customer?.fullName?.trim() || 'Customer';
  const customerEmail = data.customer?.email?.trim() || 'N/A';
  const customerPhone = data.customer?.phone?.trim() || 'N/A';
  const items = data.items || [];

  const productNamesList =
    items.map((i) => i.title).join(', ') +
    (data.orderBump ? ` + ${data.orderBump.title}` : '');

  const itemsFormatted =
    items.length > 0
      ? items
          .map(
            (it, idx) =>
              `   ${idx + 1}. <b>${escapeHtml(it.title)}</b> [${escapeHtml(
                (it.license || 'personal').toUpperCase()
              )}] — ₹${it.price}`
          )
          .join('\n')
      : '   • Digital Reels Bundle';

  const bumpLine = data.orderBump
    ? `\n🎁 <b>Order Bump Included:</b> ${escapeHtml(data.orderBump.title)} (+₹${data.orderBump.price})`
    : '';

  const text = `🎉💰 <b>NEW SALE CONFIRMED — VAULTZET!</b> 🚀🔥
━━━━━━━━━━━━━━━━━━━━━━

🆔 <b>Order ID:</b> <code>${escapeHtml(data.orderNumber)}</code>
✅ <b>Payment Status:</b> <b>PAID & VERIFIED</b>
💵 <b>Total Paid:</b> <b>₹${data.totalAmount}.00</b>
💳 <b>Gateway:</b> ${escapeHtml(data.paymentMethod || 'Cashfree UPI / Card')}

👤 <b>Buyer Information:</b>
   • <b>Name:</b> ${escapeHtml(customerName)}
   • <b>Phone / WhatsApp:</b> <code>${escapeHtml(customerPhone)}</code>
   • <b>Email:</b> <code>${escapeHtml(customerEmail)}</code>

📦 <b>Purchased Bundles:</b>
${itemsFormatted}${bumpLine}

🕒 <b>Time (IST):</b> ${escapeHtml(getIstTimestamp())}
━━━━━━━━━━━━━━━━━━━━━━`;

  const thankYouMsg = `Hi ${customerName}! 🎉\n\nThank you for your purchase on *Vaultzet Store*!\n\n✅ *Order ID:* ${data.orderNumber}\n📦 *Product:* ${productNamesList || 'Viral Reels Bundle'}\n💰 *Amount Paid:* ₹${data.totalAmount}.00\n\n📂 *Download Your Reels Bundle Here:*\n👉 https://vaultzet.shop/my-order\n(Enter your email: ${customerEmail})\n\nHave questions? Just reply to this message! 🚀`;

  const waUrl = buildWhatsAppFollowUpUrl(customerPhone, thankYouMsg);

  return sendTelegramMessage(text, [
    [{ text: `📲 Send Order & Drive Link on WhatsApp (${customerPhone})`, url: waUrl }],
    [{ text: '🌐 Open Storefront', url: 'https://vaultzet.shop' }],
  ]);
}

/**
 * 3. Alert for New Product Added
 */
export async function sendProductAddedTelegramAlert(product: {
  id?: string;
  name: string;
  slug?: string;
  price: number;
  regular_price?: number;
  categories?: string[];
  reel_count?: number;
  resolution?: string;
  googleDriveLink?: string;
}): Promise<boolean> {
  const slug = product.slug || '';
  const productUrl = slug ? `https://vaultzet.shop/product/${slug}` : 'https://vaultzet.shop/shop';
  const categoryStr = (product.categories || ['Viral Reels']).join(', ');

  const text = `🚀📦 <b>NEW PRODUCT UPLOADED TO STORE!</b> ✨🔥
━━━━━━━━━━━━━━━━━━━━━━

🏷️ <b>Bundle Name:</b> <b>${escapeHtml(product.name)}</b>
📂 <b>Category:</b> ${escapeHtml(categoryStr)}
💰 <b>Sale Price:</b> <b>₹${product.price}.00</b> (MRP: ₹${product.regular_price || product.price * 5}.00)
🎬 <b>Reels Count:</b> ${product.reel_count || 1000}+ Reels (${escapeHtml(product.resolution || '1080P HD')})
☁️ <b>Google Drive Delivery:</b> ${product.googleDriveLink ? '✅ Configured & Active' : '✅ Ready'}

🕒 <b>Uploaded At (IST):</b> ${escapeHtml(getIstTimestamp())}
━━━━━━━━━━━━━━━━━━━━━━`;

  return sendTelegramMessage(text, [
    [{ text: '🔗 View New Bundle on Vaultzet Store', url: productUrl }],
  ]);
}
