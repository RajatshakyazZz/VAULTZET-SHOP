/**
 * Automated Customer Order Delivery Email Service for VaultZet.
 * Dispatches an ultra-premium, responsive email with direct Google Drive
 * download buttons and a secure Order Success Page receipt link
 * immediately upon verified payment.
 */

import { generateOrderToken } from '@/lib/orderToken';

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
  orderSuccessUrl?: string;
  forceResend?: boolean;
}

export interface EmailDeliveryResult {
  success: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Builds an ultra-sleek, creator-grade HTML email with buttons for both
 * Google Drive download and the live Order Success receipt page.
 */
export function generateOrderEmailHtml(params: OrderEmailDeliveryParams): string {
  const { orderId, customerName, customerEmail, totalAmount, items } = params;
  const firstName = customerName?.trim().split(/\s+/)[0] || 'Creator';
  const formattedAmount = `₹${Number(totalAmount || 0).toFixed(2)}`;

  // Construct secure order success URL with token
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');
  const orderToken = generateOrderToken(orderId);
  const orderSuccessUrl =
    params.orderSuccessUrl ||
    `${siteUrl}/order-success?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderToken)}`;

  // Determine top primary drive link
  const primaryDriveUrl =
    items[0]?.googleDriveLink ||
    items[0]?.files?.[0]?.file_url ||
    'https://drive.google.com';

  const itemsHtml = items
    .map((item, idx) => {
      const driveUrl = item.googleDriveLink || item.files?.[0]?.file_url || primaryDriveUrl;
      const filesList = Array.isArray(item.files) && item.files.length > 0 ? item.files : [];

      let bonusHtml = '';
      if (filesList.length > 1) {
        bonusHtml = `
          <div style="margin-top: 16px; padding: 14px 16px; background-color: #0b1120; border: 1px dashed #334155; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
              🎁 Included Bonuses & Sub-Folders (${filesList.length} Folders):
            </p>
            ${filesList
              .map(
                (f, fIdx) => `
              <div style="margin-bottom: 8px; padding-bottom: 6px; ${fIdx < filesList.length - 1 ? 'border-bottom: 1px solid #1e293b;' : ''}">
                <a href="${f.file_url}" target="_blank" style="color: #f1f5f9; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
                  📁 ${f.name} &rarr;
                </a>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                  <a href="${f.file_url}" target="_blank" style="color: #38bdf8; text-decoration: underline;">Open Drive Link</a>
                </div>
              </div>`
              )
              .join('')}
          </div>`;
      }

      return `
        <!-- Product Item Card ${idx + 1} -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #131c31; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 20px; overflow: hidden;">
          <tr>
            <td style="padding: 22px 20px;">
              <div style="display: inline-block; background-color: #1e293b; color: #f43f5e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; margin-bottom: 10px;">
                BUNDLE #${idx + 1}
              </div>
              <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                ${item.title}
              </h3>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <span style="color: #10b981; font-weight: 600;">✓ Full HD 1080p</span> &bull; 
                <span style="color: #38bdf8; font-weight: 600;">✓ No Watermark</span> &bull; 
                <span style="color: #fbbf24; font-weight: 600;">✓ Lifetime Access</span> &bull; 
                <span style="color: #cbd5e1;">Personal & Commercial Rights</span>
              </p>

              <!-- Two Action Buttons for This Bundle -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 14px;">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <!-- Primary Button: Google Drive -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
                          <a href="${driveUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 13px 20px; border-radius: 8px; text-align: center;">
                            ⚡ Open Google Drive Folder &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- Secondary Button: Order Success Page -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #0f172a; border: 1px solid #38bdf8;">
                          <a href="${orderSuccessUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; font-size: 13px; font-weight: 600; color: #38bdf8; text-decoration: none; padding: 11px 20px; border-radius: 8px; text-align: center;">
                            🌐 View on VaultZet Success Page &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL -->
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b; word-break: break-all; text-align: center;">
                Direct Drive URL: <a href="${driveUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">${driveUrl}</a>
              </p>

              ${bonusHtml}
            </td>
          </tr>
        </table>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your VaultZet Order #${orderId} - Downloads & Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #060913; padding: 25px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0c1222; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.65);">
          
          <!-- Top Cyber Brand Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid #1e293b; position: relative;">
              <div style="display: inline-block; background-color: rgba(225, 29, 72, 0.15); border: 1px solid rgba(225, 29, 72, 0.4); padding: 5px 14px; border-radius: 999px; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 800; color: #fb7185; letter-spacing: 1px;">
                  ⚡ VAULTZET STORE
                </span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Payment Confirmed! 🎉
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8; font-weight: 500;">
                Your lifetime Google Drive download links and receipt are ready.
              </p>
            </td>
          </tr>

          <!-- Main Body Padding -->
          <tr>
            <td style="padding: 28px 22px;">

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #f8fafc;">
                Hi ${firstName},
              </p>
              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Thank you for your purchase from <strong>VaultZet</strong>! Your transaction was completed successfully via Cashfree. You now have unlimited lifetime access to all reels and bonus files in your order.
              </p>

              <!-- Order Summary & Live Status Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(145deg, #131c31 0%, #0f172a 100%); border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Order ID</span>
                          <div style="font-size: 15px; font-weight: 800; color: #ffffff; font-family: monospace; margin-top: 2px;">
                            #${orderId}
                          </div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #052e16; border: 1px solid #15803d; color: #4ade80; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
                            PAID (${formattedAmount}) ✅
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 12px; margin-top: 12px; border-top: 1px solid #1e293b;">
                          <div style="font-size: 12px; color: #94a3b8;">
                            Customer: <strong style="color: #cbd5e1;">${customerName}</strong> (${customerEmail})
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- MASTER QUICK ACCESS BUTTONS (Top of Email) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111a2e; border: 1px solid #223554; border-radius: 14px; padding: 18px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                      ⚡ Quick 1-Click Access Buttons:
                    </p>

                    <!-- Button 1: Google Drive Master Link -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                      <tr>
                        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); box-shadow: 0 6px 18px rgba(225, 29, 72, 0.45);">
                          <a href="${primaryDriveUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; font-size: 15px; font-weight: 800; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 10px; text-align: center; letter-spacing: 0.2px;">
                            ⚡ ACCESS GOOGLE DRIVE DOWNLOADS &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Button 2: Order Success Page Link -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid #38bdf8;">
                          <a href="${orderSuccessUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; font-size: 14px; font-weight: 700; color: #38bdf8; text-decoration: none; padding: 12px 22px; border-radius: 10px; text-align: center;">
                            🌐 VIEW ORDER SUCCESS PAGE & RECEIPT &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b; text-align: center;">
                      Keep this email bookmarked for lifetime re-downloads anytime.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Purchased Bundles Section -->
              <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                📦 Your Purchased Bundles (${items.length}):
              </h2>
              ${itemsHtml}

              <!-- 4-Step Quick Start Instructions -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; border: 1px solid #1e3a8a; border-radius: 12px; margin-top: 10px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.5px;">
                      💡 Quick Start Guide for Creators:
                    </h4>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">1. Open the Drive Folder:</strong> Click the <em>"Open Google Drive Folder"</em> button above.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">2. Save Shortcut:</strong> In Google Drive, click the 3 dots &bull;&bull;&bull; and select <em>"Add shortcut to Drive"</em> so you never lose the files.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">3. Edit & Customize:</strong> Import into CapCut, Premiere Pro, InShot, or VN Editor. Add your own captions, logo, or voiceover if desired.
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">4. Post & Grow:</strong> Upload directly to Instagram Reels, YouTube Shorts, and Facebook Reels for viral reach!
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Support & Guarantee Section -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1e293b; padding-top: 24px; text-align: center;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #f1f5f9;">
                      Need any assistance with your bundle?
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                      Our team is here 24/7 to ensure you get full value from your purchase.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                      <tr>
                        <td style="background-color: #1e293b; border-radius: 8px; padding: 8px 16px;">
                          <a href="mailto:support@vaultzet.shop" style="color: #38bdf8; text-decoration: none; font-size: 13px; font-weight: 600;">
                            ✉️ support@vaultzet.shop
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #070b14; padding: 22px 20px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} VaultZet Store (<a href="${siteUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">vaultzet.shop</a>). All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                🔒 256-Bit SSL Encrypted & Verified Digital Delivery &bull; Authorized License
              </p>
            </td>
          </tr>

        </table>
        <!-- /Main Container -->
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
  const subject = `🎉 Order #${params.orderId} Confirmed: Your Download Links & Receipt - VaultZet`;

  // 1. Try Resend API (Recommended - fast, high inbox deliverability)
  const resendApiKey = (
    process.env.RESEND_API_KEY ||
    process.env.EMAIL_API_KEY ||
    ''
  ).trim();
  let lastResendError = '';

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
        lastResendError =
          data?.message ||
          data?.error?.message ||
          data?.error ||
          `Resend API returned HTTP ${res.status}`;
        console.warn(`[Order Email] Resend API error for order ${params.orderId}:`, data);
      }
    } catch (err: any) {
      lastResendError = err?.message || 'Resend request exception';
      console.error(`[Order Email] Resend dispatch exception for order ${params.orderId}:`, err);
    }
  } else if (params.forceResend) {
    return {
      success: false,
      skipped: true,
      error: 'RESEND_API_KEY is not configured in server environment variables',
    };
  }

  if (params.forceResend) {
    return {
      success: false,
      error: lastResendError || 'Resend delivery failed',
    };
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
    skipped: !lastResendError,
    error:
      lastResendError ||
      'No active email provider configured (Set RESEND_API_KEY or BREVO_API_KEY in environment variables)',
  };
}
