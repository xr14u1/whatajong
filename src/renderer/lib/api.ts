// Whatajong — Telegram Mini App API Service
// Created by Snuff (https://snuffdied.xyz)

import { tma } from "./tma";

export interface StoredProfile {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  photoUrl?: string;
  level: number;
  xp: number;
  coins: number;
  stars: number;
  hints: number;
  shuffles: number;
  starPoints: number;
  streak: {
    current: number;
    longest: number;
    lastClaimDate: string;
  };
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    bestScore: number;
  };
  inventory: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  firstName: string;
  score: number;
  level: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'hint' | 'shuffle' | 'star_points' | 'coins' | 'bundle';
  quantity: number;
  price_stars: number;
  icon: string;
  badge?: string;
}

function apiUrl(path: string): string {
  if (typeof window !== "undefined" && (window as any).__WHATAJONG_API_URL__) {
    const base = (window as any).__WHATAJONG_API_URL__.replace(/\/$/, "");
    return `${base}${path}`;
  }
  return path;
}

export function getFallbackProfile(): StoredProfile {
  const u = tma.getUser();
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("whatajong_profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        return {
          ...p,
          id: String(u.id),
          telegramId: String(u.id),
          username: u.username || p.username || `player_${u.id}`,
          firstName: u.first_name || p.firstName || "Player",
          photoUrl: u.photo_url || p.photoUrl || "",
        };
      } catch (_) {}
    }
  }
  return {
    id: String(u.id),
    telegramId: String(u.id),
    username: u.username || `player_${u.id}`,
    firstName: u.first_name || "Player",
    photoUrl: u.photo_url || "",
    level: 1,
    xp: 100,
    coins: 300,
    stars: 0,
    hints: 5,
    shuffles: 3,
    starPoints: 50,
    streak: { current: 1, longest: 1, lastClaimDate: "" },
    stats: { gamesPlayed: 0, gamesWon: 0, bestScore: 0 },
    inventory: [],
  };
}

export const api = {
  async auth(): Promise<StoredProfile> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch(apiUrl("/api/user/auth"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({
          user: tma.getUser(),
          startParam: tma.getStartParam(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          if (typeof window !== "undefined") {
            localStorage.setItem("whatajong_profile", JSON.stringify(data.profile));
          }
          return data.profile;
        }
      }
    } catch (_) {}

    return getFallbackProfile();
  },

  async useHint(): Promise<{ success: boolean; hintsLeft: number }> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch(apiUrl("/api/user/use-hint"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({ user: tma.getUser() }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return { success: false, hintsLeft: 0 };
  },

  async useShuffle(): Promise<{ success: boolean; shufflesLeft: number }> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch(apiUrl("/api/user/use-shuffle"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({ user: tma.getUser() }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return { success: false, shufflesLeft: 0 };
  },

  async getShopItems(): Promise<ShopItem[]> {
    try {
      const res = await fetch(apiUrl("/api/shop/items"));
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (_) {}
    return [];
  },

  async claimStreak(): Promise<{ success: boolean; currentStreak: number; reward: any; profile: StoredProfile }> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch(apiUrl("/api/user/streak"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({ userId: tma.getUser().id }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

    const current = getFallbackProfile();
    return {
      success: true,
      currentStreak: 2,
      reward: { coins: 100, hints: 1 },
      profile: {
        ...current,
        coins: current.coins + 100,
        hints: current.hints + 1,
      },
    };
  },

  async getLeaderboard(tab: "global" | "friends" | "weekly" = "global"): Promise<{
    entries: LeaderboardEntry[];
    userRank: LeaderboardEntry;
  }> {
    try {
      const res = await fetch(apiUrl(`/api/leaderboard?tab=${tab}`));
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

    const tgUser = tma.getUser();
    const mockEntries: LeaderboardEntry[] = [
      { rank: 1, userId: "u_snuff", username: "snuff", firstName: "Snuff 👑", score: 452000, level: 99 },
      { rank: 2, userId: "u_1", username: "pao_ramen", firstName: "Pao Ramon 🀄", score: 384500, level: 75 },
      { rank: 3, userId: "u_2", username: "dragon_slayer", firstName: "Dragon Slayer", score: 298400, level: 62 },
      { rank: 4, userId: "u_3", username: "zen_master", firstName: "Zen Master", score: 215100, level: 51 },
      { rank: 5, userId: "u_4", username: "solitaire_king", firstName: "Solitaire King", score: 165000, level: 38 },
      { rank: 6, userId: "u_5", username: "tony_t", firstName: "Tony T", score: 128000, level: 32 },
    ];

    const userRank: LeaderboardEntry = {
      rank: 7,
      userId: String(tgUser.id || "current"),
      username: tgUser.username || "player",
      firstName: tgUser.first_name || "Mahjong Adventurer",
      score: 84500,
      level: 16,
      isCurrentUser: true,
    };

    return { entries: mockEntries, userRank };
  },

  async createStarsInvoice(packId: string): Promise<{ invoiceLink: string; title: string; priceStars: number; simulated?: boolean }> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch(apiUrl("/api/shop/stars-invoice"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({ packId }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

    // Fallback simulation mode
    return {
      invoiceLink: "",
      title: packId,
      priceStars: 15,
      simulated: true,
    };
  },

  async fulfillStars(packId: string): Promise<StoredProfile> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch(apiUrl("/api/shop/fulfill-stars"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({ packId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          if (typeof window !== "undefined") {
            localStorage.setItem("whatajong_profile", JSON.stringify(data.profile));
          }
          return data.profile;
        }
      }
    } catch (_) {}

    // Offline / direct local fulfillment
    const current = getFallbackProfile();
    if (packId.startsWith("hints_")) {
      const qty = parseInt(packId.replace("hints_", ""), 10) || 5;
      current.hints = (current.hints || 0) + qty;
    } else if (packId.startsWith("shuffle_")) {
      const qty = parseInt(packId.replace("shuffle_", ""), 10) || 5;
      current.shuffles = (current.shuffles || 0) + qty;
    } else if (packId.startsWith("star_points_")) {
      const qty = parseInt(packId.replace("star_points_", ""), 10) || 100;
      current.starPoints = (current.starPoints || 0) + qty;
    } else if (packId.startsWith("coins_")) {
      const qty = parseInt(packId.replace("coins_", ""), 10) || 1000;
      current.coins = (current.coins || 0) + qty;
    } else if (packId.includes("bundle")) {
      current.hints += 30;
      current.shuffles += 10;
      current.starPoints += 300;
      current.coins += 3000;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("whatajong_profile", JSON.stringify(current));
    }
    return current;
  },

  async recordGameWin(score: number, roundNum: number) {
    const rawInitData = tma.getRawInitData();
    try {
      await fetch(apiUrl("/api/game/verify-and-complete"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawInitData}`,
        },
        body: JSON.stringify({
          mode: "adventure",
          level: roundNum,
          score,
          elapsedSeconds: 60,
          movesCount: 20,
          isVictory: true,
        }),
      });
    } catch (_) {}
  },
};
