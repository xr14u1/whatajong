// Whatajong — Telegram Bot Polling & Stars Payment Listener
// Created by Snuff (https://snuffdied.xyz)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length > 0 && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const configPath = path.join(__dirname, 'data', 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (_) {}
}

const BOT_TOKEN = process.env.BOT_TOKEN && process.env.BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE'
  ? process.env.BOT_TOKEN
  : config.bot_token;

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.log('[Telegram Bot] No BOT_TOKEN set in server/.env or server/data/config.json. Running in sandbox test mode.');
  process.exit(0);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function callTelegram(method, body) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// 1. Answer Telegram Stars pre_checkout_query
async function handlePreCheckoutQuery(query) {
  console.log(`[Bot] Answering pre_checkout_query id: ${query.id} from user ${query.from?.id}`);
  try {
    const res = await callTelegram('answerPreCheckoutQuery', {
      pre_checkout_query_id: query.id,
      ok: true,
    });
    console.log('[Bot] answerPreCheckoutQuery response:', res);
  } catch (err) {
    console.error('[Bot] Failed to answer pre_checkout_query:', err);
  }
}

// 2. Handle successful_payment
async function handleSuccessfulPayment(msg) {
  const payment = msg.successful_payment;
  const fromUser = msg.from;
  const telegramId = String(fromUser.id);
  console.log(`[Bot] Successful payment received from ${telegramId}:`, payment);

  let payload = {};
  try {
    payload = JSON.parse(payment.invoice_payload || '{}');
  } catch (_) {}

  const { packId, type, quantity = 1 } = payload;
  const chargeId = payment.telegram_payment_charge_id;

  // Credit user in server/data/users.json
  const usersPath = path.join(__dirname, 'data', 'users.json');
  let users = {};
  if (fs.existsSync(usersPath)) {
    try {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (_) {}
  }

  if (!users[telegramId]) {
    users[telegramId] = {
      id: telegramId,
      telegramId,
      username: fromUser.username || `player_${telegramId}`,
      firstName: fromUser.first_name || 'Player',
      level: 1,
      xp: 0,
      coins: 300,
      hints: 5,
      shuffles: 3,
      starPoints: 50,
      streak: { current: 1, longest: 1, lastClaimDate: '' },
      stats: { gamesPlayed: 0, gamesWon: 0, bestScore: 0 },
    };
  }

  const prof = users[telegramId];
  if (type === 'hint') {
    prof.hints = (prof.hints || 0) + quantity;
  } else if (type === 'shuffle') {
    prof.shuffles = (prof.shuffles || 0) + quantity;
  } else if (type === 'star_points') {
    prof.starPoints = (prof.starPoints || 0) + quantity;
  } else if (type === 'coins') {
    prof.coins = (prof.coins || 0) + quantity;
  } else if (type === 'bundle') {
    prof.coins = (prof.coins || 0) + 3000;
    prof.hints = (prof.hints || 0) + 30;
    prof.shuffles = (prof.shuffles || 0) + 10;
    prof.starPoints = (prof.starPoints || 0) + 300;
  }

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');

  // Log payment
  const paymentsPath = path.join(__dirname, 'data', 'payments.json');
  let payments = [];
  if (fs.existsSync(paymentsPath)) {
    try {
      payments = JSON.parse(fs.readFileSync(paymentsPath, 'utf8'));
    } catch (_) {}
  }
  payments.push({
    chargeId,
    telegramId,
    packId,
    type,
    quantity,
    amountStars: payment.total_amount,
    date: new Date().toISOString(),
  });
  fs.writeFileSync(paymentsPath, JSON.stringify(payments, null, 2), 'utf8');

  // Send Telegram confirmation message
  if (msg.chat?.id) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: `🎉 *Payment Confirmed!*\n\nAdded items to your Whatajong account. Have fun playing! 🀄✨`,
      parse_mode: 'Markdown',
    }).catch(() => {});
  }
}

// 3. Start Command
async function handleMessage(msg) {
  if (msg.successful_payment) {
    await handleSuccessfulPayment(msg);
    return;
  }

  const text = msg.text || '';
  if (text.startsWith('/start')) {
    const appUrl = config.app_url || 'https://snuffdied.xyz';
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: `🀄 *Welcome to Whatajong!*\n\nCreated by *Snuff* (https://snuffdied.xyz)\n\nExperience the ultimate Mahjong Solitaire adventure on Telegram. Solve boards, collect rare dragons, and climb the global leaderboard! 🏆`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎮 Play Whatajong', web_app: { url: appUrl } }],
          [{ text: '🌐 Created by Snuff', url: 'https://snuffdied.xyz' }]
        ]
      }
    }).catch(() => {});
  }
}

let offset = 0;
let isRunning = true;
async function startPolling() {
  console.log('[Bot] Verifying bot token...');
  try {
    const me = await callTelegram('getMe', {});
    if (!me.ok) {
      console.warn('[Bot] getMe failed:', me);
      return;
    }
    console.log(`[Bot] Connected as @${me.result.username} (${me.result.first_name})`);
    await callTelegram('deleteWebhook', { drop_pending_updates: false });
    console.log('[Bot] Webhook cleared, starting polling...');
  } catch (err) {
    console.warn('[Bot] Init error:', err);
  }

  while (isRunning) {
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=20&allowed_updates=["message","pre_checkout_query"]`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          if (update.pre_checkout_query) {
            await handlePreCheckoutQuery(update.pre_checkout_query);
          } else if (update.message) {
            await handleMessage(update.message);
          }
        }
      }
    } catch (_) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

startPolling();
