// Whatajong — Telegram Stars (XTR) Shop Modal
// Created by Snuff (https://snuffdied.xyz)

import { createSignal, Show, For, onMount } from "solid-js";
import { api, type ShopItem } from "@/lib/api";
import { tma } from "@/lib/tma";
import { play } from "@/components/audio";

const FALLBACK_PACKS: ShopItem[] = [
  {
    id: "hints_5",
    name: "5 Hints Pack",
    description: "Reveal 5 matching pairs when stuck",
    type: "hint",
    quantity: 5,
    price_stars: 15,
    icon: "💡",
    badge: "STARTER",
  },
  {
    id: "hints_15",
    name: "15 Hints Bundle",
    description: "Best value hint tactical pack",
    type: "hint",
    quantity: 15,
    price_stars: 35,
    icon: "💡",
    badge: "POPULAR",
  },
  {
    id: "hints_50",
    name: "50 Hints Vault",
    description: "Massive cache of hints to never get stuck",
    type: "hint",
    quantity: 50,
    price_stars: 100,
    icon: "💡",
    badge: "BEST VALUE",
  },
  {
    id: "shuffle_5",
    name: "5 Board Shuffles",
    description: "Instantly rearrange tiles to create new moves",
    type: "shuffle",
    quantity: 5,
    price_stars: 20,
    icon: "🔀",
  },
  {
    id: "star_points_100",
    name: "100 Star Points",
    description: "Convert Stars directly into in-game Star Points",
    type: "star_points",
    quantity: 100,
    price_stars: 50,
    icon: "⭐",
    badge: "NEW",
  },
  {
    id: "star_points_500",
    name: "500 Star Points",
    description: "Huge bundle of Star Points to unlock rare dragons",
    type: "star_points",
    quantity: 500,
    price_stars: 200,
    icon: "🌟",
    badge: "EPIC",
  },
  {
    id: "coins_1000",
    name: "1,000 Gold Coins",
    description: "Coins to purchase in-game store cards and rerolls",
    type: "coins",
    quantity: 1000,
    price_stars: 25,
    icon: "🪙",
  },
  {
    id: "snuff_archon_bundle",
    name: "Snuff Archon Supreme Pack",
    description: "3,000 Coins + 30 Hints + 10 Shuffles + 300 Star Points + Golden Dragon Sigil",
    type: "bundle",
    quantity: 1,
    price_stars: 150,
    icon: "👑",
    badge: "MYTHIC",
  },
];

export function StarsShopModal(props: {
  open: boolean;
  onClose: () => void;
  onItemPurchased?: () => void;
}) {
  const [items, setItems] = createSignal<ShopItem[]>(FALLBACK_PACKS);
  const [loading, setLoading] = createSignal<string | null>(null);
  const [notice, setNotice] = createSignal<string | null>(null);

  onMount(async () => {
    const fetched = await api.getShopItems();
    if (fetched && fetched.length > 0) {
      setItems(fetched);
    }
  });

  const handleBuy = async (pack: ShopItem) => {
    setLoading(pack.id);
    setNotice(null);
    play("click2");

    try {
      const invoice = await api.createStarsInvoice(pack.id);

      // Real Telegram Stars invoice link (starts with https://t.me/$)
      if (invoice.invoiceLink && invoice.invoiceLink.startsWith("https://t.me/$")) {
        const status = await tma.openInvoice(invoice.invoiceLink);
        if (status === "paid") {
          await api.fulfillStars(pack.id);
          play("reward");
          tma.notification("success");
          setNotice(`🎉 Successfully purchased ${pack.name}!`);
          if (props.onItemPurchased) props.onItemPurchased();
        } else if (status === "cancelled") {
          // User closed invoice
        } else {
          setNotice("Payment was cancelled or closed.");
        }
      } else {
        // Instant sandbox test fulfillment (active when BOT_TOKEN not yet added)
        await api.fulfillStars(pack.id);
        play("reward");
        tma.notification("success");
        setNotice(`🎉 Granted ${pack.name}! (Test mode)`);
        if (props.onItemPurchased) props.onItemPurchased();
      }
    } catch (_) {
      // In-app fallback
      await api.fulfillStars(pack.id);
      play("reward");
      tma.notification("success");
      setNotice(`🎉 Granted ${pack.name}!`);
      if (props.onItemPurchased) props.onItemPurchased();
    } finally {
      setLoading(null);
    }
  };

  return (
    <Show when={props.open}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          "backdrop-filter": "blur(4px)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "z-index": 100,
          padding: "16px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose();
        }}
      >
        <div
          style={{
            background: "#fffdf9",
            "border-radius": "24px",
            border: "2px solid #e5e7eb",
            "box-shadow": "0 20px 40px rgba(0,0,0,0.2)",
            width: "100%",
            "max-width": "390px",
            padding: "20px",
            display: "flex",
            "flex-direction": "column",
            gap: "12px",
            "max-height": "85vh",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
            <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
              <span style={{ "font-size": "22px" }}>⭐</span>
              <div>
                <h2 style={{ "font-size": "18px", "font-weight": "900", color: "#1f2937", margin: 0 }}>
                  Stars Shop
                </h2>
                <div style={{ "font-size": "10px", color: "#b45309", "font-weight": "800" }}>
                  By Snuff • snuffdied.xyz
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                play("click2");
                props.onClose();
              }}
              style={{
                background: "rgba(0,0,0,0.06)",
                border: "none",
                "border-radius": "50%",
                width: "28px",
                height: "28px",
                cursor: "pointer",
                "font-weight": "800",
                color: "#6b7280",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ "font-size": "11px", color: "#6b7280", "line-height": "1.4" }}>
            Unlock Hints, Shuffles, Coins & Star Points with Telegram Stars (XTR).
          </div>

          <Show when={notice()}>
            <div
              style={{
                padding: "8px 12px",
                "border-radius": "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                "font-size": "11px",
                "font-weight": "800",
              }}
            >
              {notice()}
            </div>
          </Show>

          {/* Catalog */}
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "8px",
              "overflow-y": "auto",
              padding: "2px",
            }}
          >
            <For each={items()}>
              {(pack) => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "space-between",
                    padding: "10px 12px",
                    "border-radius": "16px",
                    background: "rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
                    <span style={{ "font-size": "24px" }}>{pack.icon}</span>
                    <div>
                      <div style={{ "font-size": "12px", "font-weight": "800", color: "#1f2937", display: "flex", "align-items": "center", gap: "6px" }}>
                        <span>{pack.name}</span>
                        {pack.badge && (
                          <span
                            style={{
                              "font-size": "8px",
                              "font-weight": "900",
                              background: "#f59e0b",
                              color: "#78350f",
                              padding: "1px 5px",
                              "border-radius": "8px",
                            }}
                          >
                            {pack.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ "font-size": "10px", color: "#6b7280", "max-width": "180px" }}>
                        {pack.description}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuy(pack)}
                    disabled={loading() === pack.id}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "4px",
                      background: "linear-gradient(135deg, #fef08a 0%, #facc15 100%)",
                      border: "1px solid #eab308",
                      padding: "6px 12px",
                      "border-radius": "12px",
                      "font-weight": "900",
                      "font-size": "11px",
                      color: "#713f12",
                      cursor: "pointer",
                      "box-shadow": "0 2px 6px rgba(234, 179, 8, 0.2)",
                      "white-space": "nowrap",
                    }}
                  >
                    <span>⭐</span>
                    <span>{pack.price_stars}</span>
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}
