import { NextResponse } from 'next/server';
import {
  TELEGRAM_BOT_TOKEN,
  OWNER_CHAT_ID,
  sendStoreCommandReport,
} from '@/lib/telegram';

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || 'Updating store report...',
      }),
    });
  } catch {}
}

/**
 * POST /api/telegram/webhook
 * Receives live commands (/today, /orders, /pending, /summary, /help) & button clicks from Telegram
 * Restricted strictly to Owner Chat ID: 5950203511
 */
export async function POST(request: Request) {
  try {
    const update = await request.json();

    // 1. Handle Inline Button Clicks (callback_query)
    if (update.callback_query) {
      const cb = update.callback_query;
      const fromId = String(cb.from?.id || '');
      const chatId = String(cb.message?.chat?.id || '');

      if (fromId !== OWNER_CHAT_ID && chatId !== OWNER_CHAT_ID) {
        await answerCallbackQuery(cb.id, '⛔ Unauthorized: Owner only.');
        return NextResponse.json({ ok: true });
      }

      const action = String(cb.data || '');
      await answerCallbackQuery(cb.id);

      if (action === 'cmd_today') {
        await sendStoreCommandReport('today');
      } else if (action === 'cmd_orders') {
        await sendStoreCommandReport('orders');
      } else if (action === 'cmd_pending') {
        await sendStoreCommandReport('pending');
      } else if (action === 'cmd_summary') {
        await sendStoreCommandReport('night_summary');
      } else {
        await sendStoreCommandReport('help');
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Commands (/today, /orders, /pending, /summary, /start, /help)
    const msg = update.message || update.edited_message;
    if (!msg) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(msg.chat?.id || '');
    const fromId = String(msg.from?.id || '');

    // Strict owner-only enforcement
    if (chatId !== OWNER_CHAT_ID && fromId !== OWNER_CHAT_ID) {
      return NextResponse.json({ ok: true });
    }

    const rawText = String(msg.text || '').trim().toLowerCase();
    const cmd = rawText.split(/\s+/)[0].split('@')[0];

    if (cmd === '/today' || cmd === 'today') {
      await sendStoreCommandReport('today');
    } else if (cmd === '/orders' || cmd === 'orders' || cmd === '/sales') {
      await sendStoreCommandReport('orders');
    } else if (cmd === '/pending' || cmd === 'pending' || cmd === '/abandoned') {
      await sendStoreCommandReport('pending');
    } else if (cmd === '/summary' || cmd === 'summary' || cmd === '/report') {
      await sendStoreCommandReport('night_summary');
    } else if (cmd === '/start' || cmd === '/help' || cmd === 'help' || cmd === 'menu') {
      await sendStoreCommandReport('help');
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}

/**
 * GET /api/telegram/webhook
 * Registers the Telegram Webhook & Bot Command Menu (/today, /orders, /pending, /summary, /help)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookUrl =
      searchParams.get('url') || 'https://www.vaultzet.shop/api/telegram/webhook';

    const commands = [
      { command: 'today', description: '📊 Today Sales, Revenue (₹), Pending & Top Bundle' },
      { command: 'orders', description: '✅ Last 5 Paid Orders + Send Drive Link on WhatsApp' },
      { command: 'pending', description: '⏳ Abandoned Checkouts + 20% Discount Recovery' },
      { command: 'summary', description: '🌙 Full Daily Night Summary & All-Time Report' },
      { command: 'help', description: '🤖 Show Vaultzet Store Command Center Menu' },
    ];

    const [webhookRes, cmdRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      }).then((r) => r.json()),
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands }),
      }).then((r) => r.json()),
    ]);

    return NextResponse.json({
      success: true,
      webhookUrl,
      webhookResponse: webhookRes,
      commandsResponse: cmdRes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook registration failed' },
      { status: 500 }
    );
  }
}
