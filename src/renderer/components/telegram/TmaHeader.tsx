// Whatajong — Telegram Header Component
// Created by Snuff (https://snuffdied.xyz)

import { createSignal, onMount, Show } from "solid-js";
import { api, type StoredProfile } from "@/lib/api";
import { tma } from "@/lib/tma";
import { play } from "@/components/audio";

export function TmaHeader(props: {
  onOpenProfile: () => void;
  onOpenStreak: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
}) {
  const [profile, setProfile] = createSignal<StoredProfile | null>(null);

  const refreshProfile = async () => {
    const p = await api.auth();
    setProfile(p);
  };

  onMount(() => {
    refreshProfile();
  });

  return (
    <div
      style={{
        display: "flex",
        "align-items": "center",
        "justify-content": "space-between",
        width: "100%",
        "max-width": "640px",
        padding: "8px 16px",
        "margin-bottom": "4px",
        "z-index": 10,
        position: "relative",
      }}
    >
      {/* Left Group: Telegram User Identity & Streak */}
      <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
        {/* User Info & Avatar Pill */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "7px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "3px 10px 3px 5px",
            "border-radius": "20px",
            "box-shadow": "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
          onClick={() => {
            tma.impact("light");
            play("click2");
            props.onOpenProfile();
          }}
          title="View your Telegram Profile & Stats"
        >
          {/* Avatar Photo */}
          <div
            style={{
              width: "28px",
              height: "28px",
              "border-radius": "50%",
              overflow: "hidden",
              background: "#fde68a",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "font-size": "13px",
              "font-weight": "900",
              color: "#b45309",
              border: "1.5px solid #f59e0b",
              "flex-shrink": 0,
            }}
          >
            <Show
              when={profile()?.photoUrl}
              fallback={<span>{profile()?.firstName?.[0] || "🀄"}</span>}
            >
              <img
                src={profile()!.photoUrl}
                alt="Avatar"
                style={{ width: "100%", height: "100%", "object-fit": "cover" }}
              />
            </Show>
          </div>

          {/* Name & @username */}
          <div style={{ display: "flex", "flex-direction": "column" }}>
            <span style={{ "font-size": "11px", "font-weight": "800", color: "#1f2937", "line-height": "1.2" }}>
              {profile()?.firstName || "Adventurer"}
            </span>
            <span style={{ "font-size": "9px", "font-weight": "700", color: "#6b7280" }}>
              @{profile()?.username || "snuff_player"}
            </span>
          </div>
        </div>

        {/* Daily Streak Pill */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "3px",
            background: "rgba(255, 237, 213, 0.9)",
            border: "1px solid #fdba74",
            padding: "4px 8px",
            "border-radius": "14px",
            cursor: "pointer",
            "font-size": "11px",
            "font-weight": "800",
            color: "#c2410c",
            "box-shadow": "0 2px 6px rgba(234, 88, 12, 0.15)",
          }}
          onClick={() => {
            tma.impact("light");
            play("click2");
            props.onOpenStreak();
          }}
          title="Claim Daily Streak Reward"
        >
          <span>🔥</span>
          <span>{profile()?.streak.current || 1}d</span>
        </div>
      </div>

      {/* Right Group: Resource Badges, Stars Shop, Rank */}
      <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
        {/* Hints Counter Pill */}
        <div
          onClick={() => {
            tma.impact("light");
            play("click2");
            props.onOpenShop();
          }}
          style={{
            display: "flex",
            "align-items": "center",
            gap: "3px",
            background: "rgba(254, 243, 199, 0.9)",
            border: "1px solid #fcd34d",
            padding: "4px 8px",
            "border-radius": "12px",
            "font-weight": "800",
            "font-size": "11px",
            color: "#92400e",
            cursor: "pointer",
          }}
          title="Remaining Hints (Click to open Stars Shop)"
        >
          <span>💡</span>
          <span>{profile()?.hints ?? 5}</span>
        </div>

        {/* Stars Shop Button */}
        <button
          type="button"
          onClick={() => {
            tma.impact("light");
            play("click2");
            props.onOpenShop();
          }}
          style={{
            display: "flex",
            "align-items": "center",
            gap: "4px",
            background: "linear-gradient(135deg, #fef08a 0%, #facc15 100%)",
            border: "1px solid #eab308",
            padding: "5px 12px",
            "border-radius": "14px",
            "font-weight": "900",
            "font-size": "11px",
            color: "#713f12",
            cursor: "pointer",
            "box-shadow": "0 2px 6px rgba(234, 179, 8, 0.3)",
          }}
        >
          <span>⭐</span>
          <span>Stars</span>
        </button>

        {/* Leaderboard Button */}
        <button
          type="button"
          onClick={() => {
            tma.impact("light");
            play("click2");
            props.onOpenLeaderboard();
          }}
          style={{
            display: "flex",
            "align-items": "center",
            gap: "4px",
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(0,0,0,0.1)",
            padding: "5px 10px",
            "border-radius": "14px",
            "font-weight": "800",
            "font-size": "11px",
            color: "#374151",
            cursor: "pointer",
            "box-shadow": "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <span>🏆</span>
          <span>Rank</span>
        </button>
      </div>
    </div>
  );
}
