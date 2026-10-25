// Whatajong - Telegram Mini App Integration SDK

export interface TMAUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export class TelegramService {
  private tg: any = null;
  private hapticsEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.tg = (window as any).Telegram?.WebApp || null;

      const savedHaptics = localStorage.getItem("whatajong_haptics");
      if (savedHaptics !== null) {
        this.hapticsEnabled = savedHaptics === "true";
      }

      this.initialize();
    }
  }

  private initialize() {
    if (!this.tg) return;

    try {
      this.tg.ready();
      this.tg.expand();

      // Configure Header & Background
      if (this.tg.setHeaderColor) {
        this.tg.setHeaderColor("#fefcf6");
      }
      if (this.tg.setBackgroundColor) {
        this.tg.setBackgroundColor("#fefcf6");
      }

      // Request fullscreen if supported by client (Telegram 8.0+)
      if (typeof this.tg.requestFullscreen === "function") {
        try {
          this.tg.requestFullscreen();
        } catch (_) {}
      }

      if (this.tg.enableClosingConfirmation) {
        this.tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.warn("TMA init error:", e);
    }
  }

  public isAvailable(): boolean {
    return !!this.tg && !!this.tg.initData;
  }

  public getRawInitData(): string {
    return this.tg?.initData || "";
  }

  public getUser(): TMAUser {
    if (this.tg?.initDataUnsafe?.user) {
      return this.tg.initDataUnsafe.user;
    }

    // Default test user for browser / localhost
    return {
      id: 8829104,
      first_name: "Mahjong Adventurer",
      username: "whatajong_player",
      language_code: "en",
      is_premium: true,
      photo_url: "",
    };
  }

  public getStartParam(): string | null {
    return this.tg?.initDataUnsafe?.start_param || null;
  }

  // --- HAPTICS ---
  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    localStorage.setItem("whatajong_haptics", String(enabled));
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public impact(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") {
    if (!this.hapticsEnabled || !this.tg?.HapticFeedback) return;
    try {
      this.tg.HapticFeedback.impactOccurred(style);
    } catch (_) {}
  }

  public notification(type: "error" | "success" | "warning" = "success") {
    if (!this.hapticsEnabled || !this.tg?.HapticFeedback) return;
    try {
      this.tg.HapticFeedback.notificationOccurred(type);
    } catch (_) {}
  }

  public selectionChanged() {
    if (!this.hapticsEnabled || !this.tg?.HapticFeedback) return;
    try {
      this.tg.HapticFeedback.selectionChanged();
    } catch (_) {}
  }

  // --- SAFE AREA ---
  public getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (this.tg?.safeAreaInset) {
      return {
        top: this.tg.safeAreaInset.top || 0,
        bottom: this.tg.safeAreaInset.bottom || 0,
        left: this.tg.safeAreaInset.left || 0,
        right: this.tg.safeAreaInset.right || 0,
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

    if (this.tg?.openTelegramLink) {
      this.tg.openTelegramLink(telegramShareUrl);
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

    if (this.tg?.openTelegramLink) {
      this.tg.openTelegramLink(telegramShareUrl);
    } else {
      window.open(telegramShareUrl, "_blank");
    }
  }

  // --- TELEGRAM STARS INVOICE ---
  public openInvoice(invoiceLink: string): Promise<"paid" | "cancelled" | "failed"> {
    return new Promise((resolve) => {
      if (this.tg?.openInvoice) {
        this.tg.openInvoice(invoiceLink, (status: string) => {
          if (status === "paid") {
            resolve("paid");
          } else if (status === "cancelled") {
            resolve("cancelled");
          } else {
            resolve("failed");
          }
        });
      } else {
        console.warn("Telegram.WebApp.openInvoice not supported on this client. Opening link.");
        window.open(invoiceLink, "_blank");
        resolve("cancelled");
      }
    });
  }
}

export const tma = new TelegramService();
