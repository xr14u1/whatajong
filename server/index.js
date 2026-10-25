// Whatajong — Telegram Mini App Server (Node.js / Express)
// Created by Snuff (https://snuffdied.xyz)

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------
// Load Environment Variables (.env / config.json)
// ----------------------------------------------------
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

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Config file helper
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
let config = {
  bot_token: process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
  app_url: process.env.APP_URL || 'https://snuffdied.xyz',
  port: parseInt(process.env.PORT || '3002', 10),
  creator_name: 'Snuff',
  creator_url: 'https://snuffdied.xyz',
  bot_username: 'WhatajongBot',
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
  } catch (_) {}
}

const PORT = config.port || 3002;
const BOT_TOKEN = process.env.BOT_TOKEN && process.env.BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE'
  ? process.env.BOT_TOKEN
  : config.bot_token;

// ----------------------------------------------------
// File-based Database Persistence
// ----------------------------------------------------
function readJson(filename, fallback) {
  const p = path.join(DATA_DIR, filename);
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_) {}
  }
  return fallback;
}

function writeJson(filename, data) {
  const p = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving ${filename}:`, err);
  }
}

let shopItems = readJson('shop_items.json', []);
let leaderboard = readJson('leaderboard.json', []);
let users = readJson('users.json', {});
let payments = readJson('payments.json', []);

// ----------------------------------------------------
// Telegram WebApp HMAC-SHA256 Validation
// ----------------------------------------------------
function validateTelegramInitData(initDataRaw, botToken) {
  if (!initDataRaw || !botToken || botToken === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return null;

  try {
    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    const keys = [];
    urlParams.forEach((_, key) => {
      if (key !== 'hash') keys.push(key);
    });
    keys.sort();

    const dataCheckString = keys
      .map((key) => `${key}=${urlParams.get(key)}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      return null;
    }

    const userJson = urlParams.get('user');
    if (!userJson) return null;

    return {
      user: JSON.parse(userJson),
      authDate: parseInt(urlParams.get('auth_date') || '0', 10),
    };
  } catch (err) {
    return null;
  }
}

function extractUserFromReq(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawInitData = authHeader.substring(7);
    const validated = validateTelegramInitData(rawInitData, BOT_TOKEN);
    if (validated && validated.user) {
      return validated.user;
    }
    // Also parse user directly from initData params for local dev / unconfigured token
    try {
      const urlParams = new URLSearchParams(rawInitData);
      const userJson = urlParams.get('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
    } catch (_) {}
  }

  if (req.body?.user) {
    return req.body.user;
  }

  return {
    id: 8829104,
    first_name: 'Mahjong Adventurer',
    username: 'snuff_player',
    photo_url: '',
  };
}

// ----------------------------------------------------
// Express App & Routes
// ----------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// 1. App Info & Creator Config
app.get('/api/config', (req, res) => {
  res.json({
    creator_name: config.creator_name || 'Snuff',
    creator_url: config.creator_url || 'https://snuffdied.xyz',
    app_url: config.app_url,
    bot_username: config.bot_username,
  });
});

// 2. Shop Catalog (Editable via server/data/shop_items.json)
app.get('/api/shop/items', (req, res) => {
  shopItems = readJson('shop_items.json', shopItems);
  res.json({ items: shopItems });
});

// 3. User Authentication & Profile
app.post('/api/user/auth', (req, res) => {
  const user = extractUserFromReq(req);
  const userId = String(user.id);
  users = readJson('users.json', users);

  if (!users[userId]) {
    users[userId] = {
      id: userId,
      telegramId: userId,
      username: user.username || `player_${userId}`,
      firstName: user.first_name || 'Mahjong Adventurer',
      photoUrl: user.photo_url || '',
      level: 1,
      xp: 0,
      coins: 300,
      stars: 0,
      starPoints: 50,
      hints: 5,       // 5 Free starter hints!
      shuffles: 3,    // 3 Free starter shuffles!
      streak: { current: 1, longest: 1, lastClaimDate: '' },
      stats: { gamesPlayed: 0, gamesWon: 0, bestScore: 0 },
      inventory: [],
    };
    writeJson('users.json', users);
  } else {
    // Keep username, first name and photo fresh from Telegram
    let updated = false;
    if (user.username && users[userId].username !== user.username) {
      users[userId].username = user.username;
      updated = true;
    }
    if (user.first_name && users[userId].firstName !== user.first_name) {
      users[userId].firstName = user.first_name;
      updated = true;
    }
    if (user.photo_url && users[userId].photoUrl !== user.photo_url) {
      users[userId].photoUrl = user.photo_url;
      updated = true;
    }
    if (updated) {
      writeJson('users.json', users);
    }
  }

  res.json({
    success: true,
    profile: users[userId],
  });
});

// 4. In-Game Assist: Consume 1 Hint
app.post('/api/user/use-hint', (req, res) => {
  const user = extractUserFromReq(req);
  const userId = String(user.id);
  users = readJson('users.json', users);
  const profile = users[userId];

  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (profile.hints <= 0) {
    return res.status(400).json({ error: 'No hints remaining', hints: 0 });
  }

  profile.hints -= 1;
  writeJson('users.json', users);

  res.json({
    success: true,
    hintsLeft: profile.hints,
    profile,
  });
});

// 5. In-Game Assist: Consume 1 Shuffle
app.post('/api/user/use-shuffle', (req, res) => {
  const user = extractUserFromReq(req);
  const userId = String(user.id);
  users = readJson('users.json', users);
  const profile = users[userId];

  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (profile.shuffles <= 0) {
    return res.status(400).json({ error: 'No shuffles remaining', shuffles: 0 });
  }

  profile.shuffles -= 1;
  writeJson('users.json', users);

  res.json({
    success: true,
    shufflesLeft: profile.shuffles,
    profile,
  });
});

// 6. Daily Streak Claim
app.post('/api/user/streak', (req, res) => {
  const user = extractUserFromReq(req);
  const userId = String(user.id);
  users = readJson('users.json', users);
  const profile = users[userId];

  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (profile.streak.lastClaimDate === today) {
    return res.json({
      success: true,
      message: 'Already claimed today',
      currentStreak: profile.streak.current,
      profile,
    });
  }

  profile.streak.current += 1;
  profile.streak.longest = Math.max(profile.streak.longest, profile.streak.current);
  profile.streak.lastClaimDate = today;

  const rewardCoins = 100 + profile.streak.current * 25;
  const rewardHints = profile.streak.current % 3 === 0 ? 2 : 1;

  profile.coins += rewardCoins;
  profile.hints += rewardHints;
  profile.xp += 50;

  writeJson('users.json', users);

  res.json({
    success: true,
    currentStreak: profile.streak.current,
    reward: { coins: rewardCoins, hints: rewardHints, xp: 50 },
    profile,
  });
});

// 7. Real Leaderboard API (Editable via server/data/leaderboard.json)
app.get('/api/leaderboard', (req, res) => {
  leaderboard = readJson('leaderboard.json', leaderboard);
  const user = extractUserFromReq(req);
  const userId = String(user.id);

  // Find user's position
  let userRank = leaderboard.find((e) => e.userId === userId);
  if (!userRank) {
    const prof = users[userId];
    userRank = {
      rank: leaderboard.length + 1,
      userId,
      username: prof?.username || 'snuff_player',
      firstName: prof?.firstName || 'Mahjong Adventurer',
      score: prof?.stats?.bestScore || 45000,
      level: prof?.level || 1,
      isCurrentUser: true,
    };
  } else {
    userRank = { ...userRank, isCurrentUser: true };
  }

  res.json({
    entries: leaderboard.slice(0, 50),
    userRank,
  });
});

// 8. Game Result Verification & Leaderboard Update
app.post('/api/game/verify-and-complete', (req, res) => {
  const user = extractUserFromReq(req);
  const userId = String(user.id);
  users = readJson('users.json', users);
  leaderboard = readJson('leaderboard.json', leaderboard);
  const profile = users[userId];

  const {
    level = 1,
    score = 0,
    elapsedSeconds = 0,
    movesCount = 0,
    isVictory = false,
  } = req.body;

  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Anti-cheat speed check
  if (isVictory && movesCount > 6 && elapsedSeconds < movesCount * 0.3) {
    return res.status(400).json({ error: 'Suspicious completion rate rejected' });
  }

  const xpEarned = isVictory ? 150 : 25;
  const coinsEarned = isVictory ? 60 : 10;

  profile.xp += xpEarned;
  profile.coins += coinsEarned;
  profile.stats.gamesPlayed += 1;

  if (isVictory) {
    profile.stats.gamesWon += 1;
    profile.level = Math.max(profile.level, level + 1);
    profile.stats.bestScore = Math.max(profile.stats.bestScore, score);

    // Update real persistent leaderboard
    const existingIdx = leaderboard.findIndex((e) => e.userId === userId);
    if (existingIdx >= 0) {
      leaderboard[existingIdx].score = Math.max(leaderboard[existingIdx].score, profile.stats.bestScore);
      leaderboard[existingIdx].level = profile.level;
    } else {
      leaderboard.push({
        rank: leaderboard.length + 1,
        userId,
        username: profile.username,
        firstName: profile.firstName,
        score: profile.stats.bestScore,
        level: profile.level,
      });
    }

    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    writeJson('leaderboard.json', leaderboard);
  }

  writeJson('users.json', users);

  res.json({
    success: true,
    xpEarned,
    coinsEarned,
    profile,
  });
});

// 9. Telegram Stars Invoice Creation (Real XTR currency)
app.post('/api/shop/stars-invoice', async (req, res) => {
  const user = extractUserFromReq(req);
  const { packId } = req.body;
  shopItems = readJson('shop_items.json', shopItems);

  const item = shopItems.find((p) => p.id === packId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found in shop catalog' });
  }

  const title = item.name;
  const description = item.description || `Purchase ${item.name} for Whatajong`;
  const priceStars = item.price_stars;

  const payload = JSON.stringify({
    packId: item.id,
    type: item.type,
    quantity: item.quantity,
    userId: String(user.id),
    timestamp: Date.now(),
  });

  // Call Telegram Bot API createInvoiceLink if real bot token is provided
  if (BOT_TOKEN && !BOT_TOKEN.includes('YOUR_TELEGRAM_BOT_TOKEN')) {
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          payload,
          provider_token: '', // MUST be empty string for Telegram Stars (XTR)
          currency: 'XTR',
          prices: [{ label: title, amount: priceStars }],
        }),
      });

      const data = await tgRes.json();
      if (data.ok && data.result) {
        return res.json({
          success: true,
          invoiceLink: data.result,
          title,
          priceStars,
        });
      } else {
        console.warn('Telegram Bot API returned:', data);
      }
    } catch (err) {
      console.error('Telegram Stars API error:', err);
    }
  }

  // Fallback direct invoice link for testing
  res.json({
    success: true,
    invoiceLink: `https://t.me/${config.bot_username || 'WhatajongBot'}?start=stars_${item.id}`,
    title,
    priceStars,
    simulated: true,
  });
});

// 10. Fulfill Telegram Stars Purchase (Grants Hints, Shuffles, Coins, Star Points)
app.post('/api/shop/fulfill-stars', (req, res) => {
  const user = extractUserFromReq(req);
  const userId = String(user.id);
  const { packId, chargeId = `sim_${Date.now()}` } = req.body;

  shopItems = readJson('shop_items.json', shopItems);
  users = readJson('users.json', users);
  payments = readJson('payments.json', payments);

  const item = shopItems.find((p) => p.id === packId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const profile = users[userId];
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Grant rewards based on item type
  if (item.type === 'hint') {
    profile.hints = (profile.hints || 0) + item.quantity;
  } else if (item.type === 'shuffle') {
    profile.shuffles = (profile.shuffles || 0) + item.quantity;
  } else if (item.type === 'star_points') {
    profile.starPoints = (profile.starPoints || 0) + item.quantity;
  } else if (item.type === 'coins') {
    profile.coins = (profile.coins || 0) + item.quantity;
  } else if (item.type === 'bundle') {
    profile.coins = (profile.coins || 0) + 3000;
    profile.hints = (profile.hints || 0) + 30;
    profile.shuffles = (profile.shuffles || 0) + 10;
    profile.starPoints = (profile.starPoints || 0) + 300;
  }

  // Log transaction
  payments.push({
    chargeId,
    userId,
    packId: item.id,
    itemName: item.name,
    priceStars: item.price_stars,
    timestamp: Date.now(),
    date: new Date().toISOString(),
  });

  writeJson('users.json', users);
  writeJson('payments.json', payments);

  res.json({
    success: true,
    item,
    profile,
  });
});

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🀄 [Whatajong TMA Backend] by ${config.creator_name || 'Snuff'}`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Website:    ${config.creator_url || 'https://snuffdied.xyz'}`);
  console.log(`   Config:     server/data/config.json & server/.env`);
  console.log(`========================================================`);
});
