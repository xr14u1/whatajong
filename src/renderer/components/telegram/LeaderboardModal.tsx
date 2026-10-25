// Whatajong — Telegram Leaderboard Modal
// Created by Snuff (https://snuffdied.xyz)

import { createSignal, onMount, For, Show } from "solid-js";
import { api, type LeaderboardEntry } from "@/lib/api";
import { play } from "@/components/audio";

export function LeaderboardModal(props: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = createSignal<"global" | "friends" | "weekly">("global");
  const [entries, setEntries] = createSignal<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = createSignal<LeaderboardEntry | null>(null);

  const fetchRanks = async (currentTab: "global" | "friends" | "weekly") => {
    const data = await api.getLeaderboard(currentTab);
    setEntries(data.entries);
    setUserRank(data.userRank);
  };

  onMount(() => {
    fetchRanks(tab());
  });

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
            <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
              <span style={{ "font-size": "22px" }}>🏆</span>
              <div>
                <h2 style={{ "font-size": "18px", "font-weight": "900", color: "#1f2937", margin: 0 }}>
                  Real Leaderboard
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

          {/* Tabs */}
          <div style={{ display: "grid", "grid-template-columns": "1fr 1fr 1fr", gap: "6px" }}>
            {(["global", "friends", "weekly"] as const).map((t) => (
              <button
                type="button"
                onClick={() => {
                  play("click2");
                  setTab(t);
                  fetchRanks(t);
                }}
                style={{
                  padding: "6px",
                  "border-radius": "12px",
                  border: "none",
                  "font-size": "11px",
                  "font-weight": "800",
                  "text-transform": "capitalize",
                  cursor: "pointer",
                  background: tab() === t ? "#f59e0b" : "rgba(0,0,0,0.05)",
                  color: tab() === t ? "#ffffff" : "#4b5563",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Rankings List */}
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "6px",
              "max-height": "280px",
              "overflow-y": "auto",
              padding: "4px 2px",
            }}
          >
            <For each={entries()}>
              {(entry) => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "space-between",
                    padding: "8px 12px",
                    "border-radius": "14px",
                    background: entry.rank === 1
                      ? "rgba(254, 240, 138, 0.45)"
                      : entry.rank <= 3
                      ? "rgba(254, 243, 199, 0.35)"
                      : "rgba(0,0,0,0.03)",
                    border: entry.rank === 1
                      ? "1px solid #facc15"
                      : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
                    <span
                      style={{
                        "font-weight": "900",
                        "font-size": "14px",
                        width: "22px",
                        "text-align": "center",
                      }}
                    >
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                    </span>
                    <div>
                      <div style={{ "font-size": "12px", "font-weight": "800", color: "#1f2937", display: "flex", "align-items": "center", gap: "4px" }}>
                        <span>{entry.firstName}</span>
                        {entry.isCurrentUser && (
                          <span style={{ "font-size": "9px", background: "#f59e0b", color: "#fff", padding: "1px 5px", "border-radius": "6px", "font-weight": "900" }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ "font-size": "10px", color: "#6b7280" }}>
                        Level {entry.level}
                      </div>
                    </div>
                  </div>

                  <div style={{ "font-weight": "900", "font-size": "12px", color: "#d97706", "font-family": "monospace" }}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* User's Pinned Rank */}
          <Show when={userRank()}>
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "10px 14px",
                "border-radius": "16px",
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                border: "1px solid #f59e0b",
                "box-shadow": "0 2px 8px rgba(245, 158, 11, 0.15)",
              }}
            >
              <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                <span style={{ "font-weight": "900", "font-size": "13px", color: "#b45309" }}>
                  #{userRank()?.rank}
                </span>
                <div>
                  <div style={{ "font-size": "12px", "font-weight": "900", color: "#78350f" }}>
                    Your Rank ({userRank()?.firstName})
                  </div>
                  <div style={{ "font-size": "10px", color: "#92400e" }}>
                    Best Score: {userRank()?.score.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
