// Whatajong - Telegram Mini App Integration SDK
// Created by Snuff (https://snuffdied.xyz)

export interface TMAUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Parse Telegram user directly from URL hash or query params immediately on frame 0
export function parseTelegramUserFromUrl(): TMAUser | null {
  if (typeof window === "undefined") return null;
  try {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
    const search = window.location.search.startsWith("?") ? window.location.search.substring(1) : window.location.search;
    
    // Check hash for tgWebAppData
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);
    const initDataRaw = hashParams.get("tgWebAppData") || searchParams.get("tgWebAppData") || hash || search;

    if (initDataRaw) {
      const dataParams = new URLSearchParams(initDataRaw);
      const userJson = dataParams.get("user");
      if (userJson) {
        const parsed = JSON.parse(userJson);
        if (parsed && (parsed.id || parsed.first_name)) {
          return parsed as TMAUser;
        }
      }
    }
  } catch (_) {}
  return null;
}

export class TelegramService {
  private hapticsEnabled: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedHaptics = localStorage.getItem("whatajong_haptics");
      if (savedHaptics !== null) {
        this.hapticsEnabled = savedHaptics === "true";
      }
      this.tryInitialize();
    }
  }

  // Always access window.Telegram.WebApp dynamically
  public get tg(): any {
    if (typeof window !== "undefined") {
      return (window as any).Telegram?.WebApp || null;
    }
    return null;
  }

  public tryInitialize() {
    const webApp = this.tg;
    if (!webApp || this.isInitialized) return;

    try {
      webApp.ready();
      webApp.expand();

      if (webApp.setHeaderColor) webApp.setHeaderColor("#fefcf6");
      if (webApp.setBackgroundColor) webApp.setBackgroundColor("#fefcf6");

      if (typeof webApp.requestFullscreen === "function") {
        try { webApp.requestFullscreen(); } catch (_) {}
      }

      if (webApp.enableClosingConfirmation) {
        webApp.enableClosingConfirmation();
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn("TMA init warning:", e);
    }
  }

  public isAvailable(): boolean {
    const webApp = this.tg;
    return !!(webApp && (webApp.initData || webApp.initDataUnsafe?.user));
  }

  public getRawInitData(): string {
    const webApp = this.tg;
    if (webApp?.initData) return webApp.initData;

    if (typeof window !== "undefined") {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
      const search = window.location.search.startsWith("?") ? window.location.search.substring(1) : window.location.search;
      const hashParams = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(search);
      return hashParams.get("tgWebAppData") || searchParams.get("tgWebAppData") || "";
    }
    return "";
  }

  public getUser(): TMAUser {
    this.tryInitialize();
    const webApp = this.tg;

    // 1. Check native Telegram SDK
    if (webApp?.initDataUnsafe?.user?.first_name) {
      const u = webApp.initDataUnsafe.user;
      this.cacheUser(u);
      return u;
    }

    // 2. Check URL parameters directly (available instantly on load)
    const urlUser = parseTelegramUserFromUrl();
    if (urlUser) {
      this.cacheUser(urlUser);
      return urlUser;
    }

    // 3. Check cached user from previous session
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("whatajong_user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.first_name) return parsed;
        } catch (_) {}
      }
    }

    // 4. Fallback for standalone browser testing outside Telegram
    return {
      id: 10001,
      first_name: "Player",
      username: "player",
      language_code: "en",
      is_premium: false,
      photo_url: "",
    };
  }

  private cacheUser(user: TMAUser) {
    if (typeof window !== "undefined" && user?.id) {
      try {
        localStorage.setItem("whatajong_user", JSON.stringify(user));
      } catch (_) {}
    }
  }

  public getStartParam(): string | null {
    const webApp = this.tg;
    if (webApp?.initDataUnsafe?.start_param) {
      return webApp.initDataUnsafe.start_param;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("tgWebAppStartParam") || params.get("startapp") || null;
    }
    return null;
  }

  // --- HAPTICS ---
  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("whatajong_haptics", String(enabled));
    }
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public impact(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") {
    if (!this.hapticsEnabled) return;
    const webApp = this.tg;
    try {
      webApp?.HapticFeedback?.impactOccurred(style);
    } catch (_) {}
  }

  public notification(type: "error" | "success" | "warning" = "success") {
    if (!this.hapticsEnabled) return;
    const webApp = this.tg;
    try {
      webApp?.HapticFeedback?.notificationOccurred(type);
    } catch (_) {}
  }

  public selectionChanged() {
    if (!this.hapticsEnabled) return;
    const webApp = this.tg;
    try {
      webApp?.HapticFeedback?.selectionChanged();
    } catch (_) {}
  }

  // --- SAFE AREA ---
  public getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    const webApp = this.tg;
    if (webApp?.safeAreaInset) {
      return {
        top: webApp.safeAreaInset.top || 0,
        bottom: webApp.safeAreaInset.bottom || 0,
        left: webApp.safeAreaInset.left || 0,
        right: webApp.safeAreaInset.right || 0,
      };
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // --- TELEGRAM SHARING & DEEP LINKS ---
  public shareGameResult(score: number, roundNum: number) {
    const user = this.getUser();
    const botUser = "WhatajongBot";
    const shareUrl = `https://t.me/${botUser}/app?startapp=ref_${user.id}`;
    const text = `🀄 I just scored ${score.toLocaleString()} on Round ${roundNum} in Whatajong!\n\nCan you beat my tiles? 🔥`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

    const webApp = this.tg;
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(telegramShareUrl);
    } else {
      window.open(telegramShareUrl, "_blank");
    }
  }

  public shareReferralLink() {
    const user = this.getUser();
    const botUser = "WhatajongBot";
    const shareUrl = `https://t.me/${botUser}/app?startapp=ref_${user.id}`;
    const text = `Join me in Whatajong 🀄 - The Ultimate Mahjong Solitaire Roguelite on Telegram!\n\nTap below to claim starter bonus coins & powerups:`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

    const webApp = this.tg;
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(telegramShareUrl);
    } else {
      window.open(telegramShareUrl, "_blank");
    }
  }

  // --- TELEGRAM STARS INVOICE ---
  public openInvoice(invoiceLink: string): Promise<"paid" | "cancelled" | "failed"> {
    return new Promise((resolve) => {
      const webApp = this.tg;

      // Real Telegram Stars invoice link starts with https://t.me/$
      if (webApp?.openInvoice && invoiceLink && invoiceLink.startsWith("https://t.me/$")) {
        try {
          webApp.openInvoice(invoiceLink, (status: string) => {
            if (status === "paid") {
              resolve("paid");
            } else if (status === "cancelled") {
              resolve("cancelled");
            } else {
              resolve("failed");
            }
          });
          return;
        } catch (e) {
          console.warn("Telegram.WebApp.openInvoice error:", e);
        }
      }

      // If outside Telegram or simulated link
      if (invoiceLink && !invoiceLink.startsWith("https://t.me/$")) {
        console.log("Simulated or non-standard invoice link:", invoiceLink);
        resolve("paid"); // Test fulfillment
        return;
      }

      resolve("failed");
    });
  }
}

export const tma = new TelegramService();
