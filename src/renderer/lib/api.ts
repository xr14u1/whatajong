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

const DEFAULT_PROFILE: StoredProfile = {
  id: "8829104",
  telegramId: "8829104",
  username: "snuff_player",
  firstName: "Mahjong Adventurer",
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

export const api = {
  async auth(): Promise<StoredProfile> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch("/api/user/auth", {
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
        return data.profile;
      }
    } catch (_) {}

    return DEFAULT_PROFILE;
  },

  async useHint(): Promise<{ success: boolean; hintsLeft: number }> {
    const rawInitData = tma.getRawInitData();
    try {
      const res = await fetch("/api/user/use-hint", {
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
      const res = await fetch("/api/user/use-shuffle", {
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
      const res = await fetch("/api/shop/items");
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
      const res = await fetch("/api/user/streak", {
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

    return {
      success: true,
      currentStreak: 2,
      reward: { coins: 100, hints: 1 },
      profile: {
        ...DEFAULT_PROFILE,
        coins: DEFAULT_PROFILE.coins + 100,
        hints: DEFAULT_PROFILE.hints + 1,
      },
    };
  },

  async getLeaderboard(tab: "global" | "friends" | "weekly" = "global"): Promise<{
    entries: LeaderboardEntry[];
    userRank: LeaderboardEntry;
  }> {
    try {
      const res = await fetch(`/api/leaderboard?tab=${tab}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

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
      userId: "current",
      username: "snuff_player",
      firstName: "Mahjong Adventurer",
      score: 84500,
      level: 16,
      isCurrentUser: true,
    };

    return { entries: mockEntries, userRank };
  },

  async createStarsInvoice(packId: string): Promise<{ invoiceLink: string; title: string; priceStars: number; simulated?: boolean }> {
    const rawInitData = tma.getRawInitData();
    const res = await fetch("/api/shop/stars-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rawInitData}`,
      },
      body: JSON.stringify({ packId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create Stars invoice");
    }

    return await res.json();
  },

  async fulfillStars(packId: string): Promise<StoredProfile> {
    const rawInitData = tma.getRawInitData();
    const res = await fetch("/api/shop/fulfill-stars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rawInitData}`,
      },
      body: JSON.stringify({ packId }),
    });
    const data = await res.json();
    return data.profile;
  },

  async recordGameWin(score: number, roundNum: number) {
    const rawInitData = tma.getRawInitData();
    try {
      await fetch("/api/game/verify-and-complete", {
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
