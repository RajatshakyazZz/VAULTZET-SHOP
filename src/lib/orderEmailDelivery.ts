/**
 * Automated Customer Order Delivery Email Service for VaultZet.
 * Dispatches an instant, responsive email with Google Drive download links
 * immediately upon verified payment.
 */

export interface OrderEmailDeliveryItem {
  id?: string;
  title: string;
  price?: number;
  license?: string;
  googleDriveLink?: string;
  files?: Array<{ name: string; file_url: string }>;
}

export interface OrderEmailDeliveryParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  items: OrderEmailDeliveryItem[];
}

export interface EmailDeliveryResult {
  success: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Builds a sleek, dark-themed, responsive HTML email matching VaultZet brand styling.
 */
export function generateOrderEmailHtml(params: OrderEmailDeliveryParams): string {
  const { orderId, customerName, totalAmount, items } = params;
  const firstName = customerName?.trim().split(/\s+/)[0] || 'Creator';
  const formattedAmount = `₹${Number(totalAmount || 0).toFixed(2)}`;

  const itemsHtml = items
    .map((item, idx) => {
      const driveUrl = item.googleDriveLink || 'https://drive.google.com';
      const filesList = Array.isArray(item.files) && item.files.length > 0 ? item.files : [];

      let bonusHtml = '';
      if (filesList.length > 1) {
        bonusHtml = `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #334155;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #94a3b8;">Included Files & Bonuses:</p>
            ${filesList
              .map(
                (f) => `
              <div style="margin-bottom: 6px;">
                <a href="${f.file_url}" target="_blank" style="color: #38bdf8; text-decoration: none; font-size: 13px; font-weight: 500;">
                  📁 ${f.name} &rarr;
                </a>
              </div>`
              )
              .join('')}
          </div>`;
      }

      return `
        <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #f8fafc;">
              ${idx + 1}. ${item.title}
            </h3>
          </div>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8;">
            Lifetime Access &bull; Full HD 1080p No Watermark &bull; Ready to Upload
          </p>
          <div style="text-align: center; margin: 16px 0;">
            <a href="${driveUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);">
              ⚡ Access Google Drive Bundle
            </a>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; text-align: center; word-break: break-all;">
            Direct URL: <a href="${driveUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">${driveUrl}</a>
          </p>
          ${bonusHtml}
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your VaultZet Order #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #f8fafc; letter-spacing: -0.5px;">
                ⚡ VAULTZET
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #38bdf8; font-weight: 600;">
                Your Order Access & Download Details
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #f8fafc;">
                Hi ${firstName}, your payment is confirmed! 🎉
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Thank you for your purchase from VaultZet Store. Your order has been verified successfully. Your lifetime Google Drive download links are below:
              </p>

              <!-- Order Summary Pill -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 13px; color: #94a3b8;">Order Number:</span>
                      <strong style="font-size: 14px; color: #f8fafc; font-family: monospace;">#${orderId}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                      <span style="font-size: 13px; color: #94a3b8;">Amount Paid:</span>
                      <strong style="font-size: 14px; color: #10b981;">${formattedAmount} (Paid ✅)</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Bundles List -->
              <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
                📦 Your Purchased Bundles:
              </h3>
              ${itemsHtml}

              <!-- Instructions Card -->
              <div style="background-color: #131d33; border: 1px solid #1e3a8a; border-radius: 10px; padding: 18px; margin-top: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #60a5fa;">
                  💡 Quick How-To Instructions:
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                  <li>Click <strong>"Access Google Drive Bundle"</strong> above to view your folder.</li>
                  <li>You can download individual reels or the entire zip folder.</li>
                  <li>Save the folder shortcut to your own Google Drive for fast access anytime.</li>
                  <li>All reels are 100% royalty-free and ready for Instagram, YouTube Shorts, and Facebook Reels.</li>
                </ul>
              </div>

              <!-- Support Section -->
              <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e293b;">
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Need help or have questions about your bundle?</p>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
                  Contact us at <a href="mailto:support@vaultzet.shop" style="color: #38bdf8; text-decoration: none; font-weight: 600;">support@vaultzet.shop</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #090d16; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} VaultZet Store (vaultzet.shop). All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends the automated order delivery email using Resend, Brevo, or configured SMTP.
 */
export async function sendOrderDeliveryEmail(
  params: OrderEmailDeliveryParams
): Promise<EmailDeliveryResult> {
  const targetEmail = params.customerEmail?.trim().toLowerCase();

  // Validate email
  if (!targetEmail || !targetEmail.includes('@') || targetEmail.endsWith('@example.com')) {
    console.warn(`[Order Email] Skipping email for order ${params.orderId}: invalid email "${targetEmail}"`);
    return { success: false, skipped: true, error: 'Invalid customer email address' };
  }

  const htmlContent = generateOrderEmailHtml(params);
  const subject = `🎉 Your Bundle Download Link: Order #${params.orderId} - VaultZet`;

  // 1. Try Resend API (Recommended - fast, high inbox deliverability)
  const resendApiKey = (
    process.env.RESEND_API_KEY ||
    process.env.EMAIL_API_KEY ||
    ''
  ).trim();

  if (resendApiKey) {
    try {
      const fromEmail = (process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'VaultZet <orders@vaultzet.shop>').trim();
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          subject,
          html: htmlContent,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        console.log(`[Order Email] Successfully sent via Resend for order ${params.orderId}: ID ${data.id}`);
        return {
          success: true,
          provider: 'resend',
          messageId: data.id,
        };
      } else {
        console.warn(`[Order Email] Resend API error for order ${params.orderId}:`, data);
      }
    } catch (err: any) {
      console.error(`[Order Email] Resend dispatch exception for order ${params.orderId}:`, err);
    }
  }

  // 2. Try Brevo (Sendinblue) API
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoApiKey) {
    try {
      const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'support@vaultzet.shop').trim();
      const senderName = (process.env.BREVO_SENDER_NAME || 'VaultZet Store').trim();
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: targetEmail, name: params.customerName || 'Customer' }],
          subject,
          htmlContent,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.messageId || data.messageIds)) {
        console.log(`[Order Email] Successfully sent via Brevo for order ${params.orderId}`);
        return {
          success: true,
          provider: 'brevo',
          messageId: data.messageId || data.messageIds?.[0],
        };
      } else {
        console.warn(`[Order Email] Brevo API error for order ${params.orderId}:`, data);
      }
    } catch (err: any) {
      console.error(`[Order Email] Brevo dispatch exception for order ${params.orderId}:`, err);
    }
  }

  // 3. Fallback: If no provider API key configured yet
  console.log(
    `[Order Email] Ready for dispatch for order #${params.orderId} to ${targetEmail}. Configure RESEND_API_KEY or BREVO_API_KEY in environment variables.`
  );

  return {
    success: false,
    skipped: true,
    error: 'No active email provider configured (Set RESEND_API_KEY or BREVO_API_KEY in environment variables)',
  };
}
