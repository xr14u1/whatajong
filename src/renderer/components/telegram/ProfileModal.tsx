// Whatajong — Telegram Player Profile Modal
// Created by Snuff (https://snuffdied.xyz)

import { Show } from "solid-js";
import { type StoredProfile } from "@/lib/api";
import { tma } from "@/lib/tma";
import { play } from "@/components/audio";
import { ShopButton } from "@/components/button";

export function ProfileModal(props: {
  open: boolean;
  profile: StoredProfile | null;
  onClose: () => void;
  onOpenShop: () => void;
}) {
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
            "box-shadow": "0 20px 40px rgba(0,0,0,0.25)",
            width: "100%",
            "max-width": "380px",
            padding: "24px 20px",
            display: "flex",
            "flex-direction": "column",
            gap: "16px",
            "max-height": "90vh",
            "overflow-y": "auto",
          }}
        >
          {/* Top Header & Close Button */}
          <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
            <span style={{ "font-size": "12px", "font-weight": "800", color: "#b45309", "text-transform": "uppercase", "letter-spacing": "0.05em" }}>
              Telegram Mini App Profile
            </span>
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
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                cursor: "pointer",
                "font-size": "14px",
                color: "#6b7280",
              }}
            >
              ✕
            </button>
          </div>

          {/* User Hero Identity */}
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              gap: "8px",
              padding: "12px 0 6px 0",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "72px",
                height: "72px",
                "border-radius": "50%",
                overflow: "hidden",
                border: "3px solid #f59e0b",
                "box-shadow": "0 4px 14px rgba(245, 158, 11, 0.35)",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              }}
            >
              <Show
                when={props.profile?.photoUrl}
                fallback={
                  <span style={{ "font-size": "32px", "font-weight": "900", color: "#b45309" }}>
                    {props.profile?.firstName?.[0] || "🀄"}
                  </span>
                }
              >
                <img
                  src={props.profile!.photoUrl}
                  alt={props.profile?.firstName || "Avatar"}
                  style={{ width: "100%", height: "100%", "object-fit": "cover" }}
                />
              </Show>
            </div>

            {/* Name & Username */}
            <div style={{ "text-align": "center" }}>
              <div style={{ "font-size": "18px", "font-weight": "900", color: "#1f2937", display: "flex", "align-items": "center", "justify-content": "center", gap: "4px" }}>
                <span>{props.profile?.firstName || "Mahjong Adventurer"}</span>
                <span style={{ color: "#0284c7", "font-size": "14px" }} title="Verified Telegram User">
                  ✓
                </span>
              </div>
              <div style={{ "font-size": "13px", "font-weight": "700", color: "#6b7280" }}>
                @{props.profile?.username || "snuff_player"}
              </div>
              <div style={{ "font-size": "10px", color: "#9ca3af", "margin-top": "2px" }}>
                ID: {props.profile?.telegramId || "8829104"}
              </div>
            </div>
          </div>

          {/* Level & XP Bar */}
          <div
            style={{
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              padding: "10px 14px",
              "border-radius": "14px",
            }}
          >
            <div style={{ display: "flex", "justify-content": "space-between", "font-size": "12px", "font-weight": "800", "margin-bottom": "6px" }}>
              <span style={{ color: "#374151" }}>Level {props.profile?.level || 1}</span>
              <span style={{ color: "#b45309" }}>{props.profile?.xp || 0} XP</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.1)", "border-radius": "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, ((props.profile?.xp || 0) % 500) / 5)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                  "border-radius": "4px",
                }}
              />
            </div>
          </div>

          {/* Player Stats Grid */}
          <div
            style={{
              display: "grid",
              "grid-template-columns": "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "10px", "border-radius": "12px", "text-align": "center" }}>
              <div style={{ "font-size": "10px", "font-weight": "800", color: "#6b7280" }}>BEST SCORE</div>
              <div style={{ "font-size": "16px", "font-weight": "900", color: "#b45309" }}>
                {props.profile?.stats?.bestScore?.toLocaleString() || "45,000"}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "10px", "border-radius": "12px", "text-align": "center" }}>
              <div style={{ "font-size": "10px", "font-weight": "800", color: "#6b7280" }}>DAILY STREAK</div>
              <div style={{ "font-size": "16px", "font-weight": "900", color: "#ea580c" }}>
                🔥 {props.profile?.streak?.current || 1} Days
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "10px", "border-radius": "12px", "text-align": "center" }}>
              <div style={{ "font-size": "10px", "font-weight": "800", color: "#6b7280" }}>GAMES PLAYED</div>
              <div style={{ "font-size": "16px", "font-weight": "900", color: "#374151" }}>
                {props.profile?.stats?.gamesPlayed || 0}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "10px", "border-radius": "12px", "text-align": "center" }}>
              <div style={{ "font-size": "10px", "font-weight": "800", color: "#6b7280" }}>VICTORIES</div>
              <div style={{ "font-size": "16px", "font-weight": "900", color: "#059669" }}>
                {props.profile?.stats?.gamesWon || 0}
              </div>
            </div>
          </div>

          {/* Resources & Assists Stash */}
          <div
            style={{
              display: "flex",
              "align-items": "center",
              "justify-content": "space-around",
              background: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)",
              border: "1px solid #fde047",
              padding: "10px",
              "border-radius": "14px",
            }}
          >
            <div style={{ "text-align": "center" }}>
              <div style={{ "font-size": "14px" }}>💡</div>
              <div style={{ "font-size": "12px", "font-weight": "900", color: "#78350f" }}>
                {props.profile?.hints ?? 5}
              </div>
              <div style={{ "font-size": "9px", color: "#a16207" }}>Hints</div>
            </div>
            <div style={{ "text-align": "center" }}>
              <div style={{ "font-size": "14px" }}>🔀</div>
              <div style={{ "font-size": "12px", "font-weight": "900", color: "#78350f" }}>
                {props.profile?.shuffles ?? 3}
              </div>
              <div style={{ "font-size": "9px", color: "#a16207" }}>Shuffles</div>
            </div>
            <div style={{ "text-align": "center" }}>
              <div style={{ "font-size": "14px" }}>⭐</div>
              <div style={{ "font-size": "12px", "font-weight": "900", color: "#78350f" }}>
                {props.profile?.starPoints ?? 50}
              </div>
              <div style={{ "font-size": "9px", color: "#a16207" }}>Points</div>
            </div>
            <div style={{ "text-align": "center" }}>
              <div style={{ "font-size": "14px" }}>🪙</div>
              <div style={{ "font-size": "12px", "font-weight": "900", color: "#78350f" }}>
                {props.profile?.coins ?? 300}
              </div>
              <div style={{ "font-size": "9px", color: "#a16207" }}>Coins</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", "flex-direction": "column", gap: "8px", "margin-top": "4px" }}>
            <ShopButton
              type="button"
              hue="bam"
              style={{ width: "100%", "justify-content": "center", padding: "10px" }}
              onPointerDown={() => {
                props.onClose();
                props.onOpenShop();
              }}
            >
              <span>⭐ Buy Telegram Stars Packs</span>
            </ShopButton>

            <button
              type="button"
              onClick={() => {
                play("click2");
                tma.shareReferralLink();
              }}
              style={{
                width: "100%",
                padding: "8px",
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                "border-radius": "14px",
                "font-weight": "800",
                "font-size": "12px",
                cursor: "pointer",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                gap: "6px",
              }}
            >
              <span>✈️ Invite Telegram Friends</span>
            </button>
          </div>

          {/* Creator Attribution */}
          <div style={{ "text-align": "center", "font-size": "10px", color: "#9ca3af", "margin-top": "2px" }}>
            Created by <a href="https://snuffdied.xyz" target="_blank" rel="noopener noreferrer" style={{ color: "#b45309", "font-weight": "800", "text-decoration": "none" }}>Snuff</a> • snuffdied.xyz
          </div>
        </div>
      </div>
    </Show>
  );
}
