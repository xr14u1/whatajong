# Whatajong 🀄 — Telegram Mini App Edition
> **Created by Snuff** • [snuffdied.xyz](https://snuffdied.xyz)

![whatajong](https://github.com/masylum/whatajong/blob/main/img.png?raw=true)

101% exact clone of [Whatajong](https://github.com/masylum/whatajong) with colors, gameplay, sounds, backgrounds, animations, and roguelite Mahjong Solitaire mechanics, enhanced with Telegram Mini App (TMA) features adapted from [Meowdoku](https://github.com/nasirul786/meowdoku).

---

## 🌟 Snuff Edition Highlights

* **"Created by Snuff" Home Button & Branding**:
  - Beautiful, theme-matched button featuring the golden Phoenix tile on the Home screen linking directly to [https://snuffdied.xyz](https://snuffdied.xyz).
  - Subtitle and footer links showcasing Snuff's creator identity.
* **In-Game Assists Bar**:
  - **💡 Hint**: Automatically highlights and animates the highest-priority playable matching pair, selects the first tile, and consumes 1 Hint.
  - **🔀 Shuffle**: Rearranges remaining alive tiles to guarantee fresh matching pairs and breaks stuck boards.
  - **⭐ Stars Shop**: Directly accessible from inside the game or when assists run out!
* **Telegram Stars (XTR) Shop**:
  - Purchase Hints packs (5, 15, 50), Shuffles (5), Star Points (100, 500), Gold Coins (1,000), and the Mythic Snuff Archon Bundle with real Telegram Stars.
* **Real Persistent Leaderboard**:
  - Real database records stored in `server/data/leaderboard.json`, featuring Snuff as #1 Grand Champion, live player scores, and personal rank tracking.
* **Customizable Data Folder**:
  - All bot tokens, shop items, prices, user profiles, and leaderboards are organized in plain editable JSON files under `server/data/` and `server/.env`.

---

## 🎮 Whatajong Gameplay & Features

* **Original Aesthetics**: Authentic traditional tile illustrations, textures, backgrounds, shaders, and animations (`shake`, `jump`, `deleted`, `fall`).
* **Complete Soundscape**: All 40+ original audio sound effects (`alarm1-3`, `amazing`, `awesome`, `clack`, `coin`, `dice`, `dragon`, `earthquake`, `freeze`, `frog`, `gong`, `joker`, `lotus`, `phoenix`, `sparrow`, `thunder`, `won`, `lost`) + music sprite.
* **Mahjong Solitaire Roguelite Flow**:
  - Run Intro
  - Run Game (Timer, Combos, Urgency Alarms, Floating Numbers)
  - Run Reward (Card Drafting)
  - Run Shop (Item purchases)
  - Run Game Over & Victory End
* **Roguelite Mechanics**:
  - Special dragon combos, phoenix runs, mutations, Taijitu multiplier pairs, gem activations, joker wildcards, wind directions.
  - Solvable board reverse-pairing generator.

---

## 📱 Telegram Mini App (TMA) Enhancements

1. **Telegram WebApp SDK Integration**:
   - `Telegram.WebApp.ready()`, `expand()`, `requestFullscreen()`
   - Telegram theme synchronization & mobile safe-area insets (`env(safe-area-inset-top/bottom)`)
   - Telegram user detection (`initData`, `initDataUnsafe`)
2. **Telegram Haptic Feedback**:
   - Tile selection: `tma.impact("light")`
   - Tile match: `tma.impact("medium")`
   - Tile mismatch: `tma.impact("rigid")`
   - Round victory / reward: `tma.notification("success")`
   - Settings toggle for Haptics ON/OFF
3. **Daily Login Streak**:
   - 7-Day streak rewards with coins & powerups
4. **Telegram Leaderboard**:
   - Global, Friends, Weekly ranking tabs with pinned player rank
5. **Telegram Stars Shop (XTR)**:
   - Digital packs for Telegram Stars (`provider_token: ""`) with starter bundles, gemstones, and powerups
6. **Telegram Social Sharing**:
   - One-tap invite friend link with referral tracking: `https://t.me/WhatajongBot/app?startapp=ref_USER_ID`
7. **Authoritative Backend**:
   - Node.js Express server on port 3002 with anti-cheat speed validation, session tokens, and persistent database.

---

## 📁 Editable Data & Configuration Files

All bot settings and game data can be directly edited in `server/data/`:

| File | Description |
|---|---|
| `server/.env` | Put your Telegram Bot token from @BotFather (`BOT_TOKEN=...`) |
| `server/data/config.json` | Bot token, creator name, creator URL (`https://snuffdied.xyz`), server port |
| `server/data/shop_items.json` | Catalog of items, Star prices (XTR), badges, descriptions, quantities |
| `server/data/leaderboard.json` | Live leaderboard entries with scores, levels, avatars (Snuff #1) |
| `server/data/users.json` | Player profiles, saved hints, shuffles, coins, star points, streak status |
| `server/data/payments.json` | Completed Telegram Stars transaction logs |

---

## 🚀 Quick Start (Localhost)

### One-Click Launch (Windows)
Double-click `server.bat`:
```bat
server.bat
```
This automatically:
1. Validates Node.js environment
2. Checks dependencies
3. Starts the Backend API on `http://localhost:3002`
4. Starts the Vite Game Server on `http://localhost:5173`
5. Automatically opens your browser to the game!

### Manual CLI Launch
```bash
# Install dependencies
npm install

# Start Backend & Frontend concurrently
npm start
```

---

## 🤖 Telegram Bot & Mini App Setup Guide

1. **Create Bot**: Talk to [@BotFather](https://t.me/botfather) and send `/newbot`. Note the API Token.
2. **Set Token**: Paste the token into `server/.env` or `server/data/config.json`:
   ```env
   BOT_TOKEN=your_bot_token_here
   ```
3. **Create Mini App**: In @BotFather, send `/newapp`, select your bot, set title **Whatajong**, and set the Web App URL to your deployed domain (or ngrok/tunnel during development).
4. **Enable Telegram Stars**:
   Telegram Stars (XTR) are built-in! The server generates invoices with `currency: "XTR"` and empty `provider_token`, allowing users to pay with Stars on any Telegram client.

---

## 📜 Licenses & Attributions
- **Whatajong** (MIT License): Copyright (c) 2025 Pao Ramon <pao.ramen@proton.me>
- **Meowdoku** (MIT License): Copyright (c) 2025 Nasirul Islam
- See `ATTRIBUTIONS.md` for full license notices.
