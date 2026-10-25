// Whatajong - Telegram Daily Streak Modal
import { createSignal, Show, For } from "solid-js";
import { api } from "@/lib/api";
import { tma } from "@/lib/tma";
import { play } from "@/components/audio";

const STREAK_DAYS = [
  { day: 1, reward: 50 },
  { day: 2, reward: 100 },
  { day: 3, reward: 150 },
  { day: 4, reward: 200 },
  { day: 5, reward: 250 },
  { day: 6, reward: 300 },
  { day: 7, reward: 500 },
];

export function DailyStreakModal(props: { open: boolean; onClose: () => void }) {
  const [currentStreak, setCurrentStreak] = createSignal(2);
  const [claimed, setClaimed] = createSignal(false);

  const handleClaim = async () => {
    play("reward");
    tma.notification("success");
    const res = await api.claimStreak();
    setCurrentStreak(res.currentStreak);
    setClaimed(true);
  };

  return (
    <Show when={props.open}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
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
            "max-width": "360px",
            padding: "20px",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            "text-align": "center",
            gap: "12px",
          }}
        >
          {/* Flame Icon */}
          <div
            style={{
              width: "60px",
              height: "60px",
              "border-radius": "20px",
              background: "#ffedd5",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "font-size": "32px",
              border: "2px solid #fdba74",
            }}
          >
            🔥
          </div>

          <h2 style={{ "font-size": "20px", "font-weight": "900", color: "#1f2937", margin: 0 }}>
            Daily Login Streak
          </h2>
          <div style={{ "font-size": "12px", color: "#6b7280" }}>
            Maintain your daily streak to earn bonus coins & powerups!
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: "grid",
              "grid-template-columns": "repeat(4, 1fr)",
              gap: "8px",
              width: "100%",
              "margin-top": "6px",
            }}
          >
            <For each={STREAK_DAYS}>
              {(item) => {
                const isCurrent = item.day === currentStreak();
                const isPast = item.day < currentStreak();

                return (
                  <div
                    style={{
                      padding: "8px 4px",
                      "border-radius": "14px",
                      border: isCurrent ? "2px solid #ea580c" : "1px solid rgba(0,0,0,0.08)",
                      background: isCurrent ? "#fff7ed" : isPast ? "#ecfdf5" : "rgba(0,0,0,0.03)",
                      display: "flex",
                      "flex-direction": "column",
                      "align-items": "center",
                      gap: "2px",
                    }}
                  >
                    <span style={{ "font-size": "10px", "font-weight": "800", color: "#6b7280" }}>
                      Day {item.day}
                    </span>
                    <span style={{ "font-size": "16px" }}>{isPast ? "✅" : "🎁"}</span>
                    <span style={{ "font-size": "10px", "font-weight": "900", color: "#ea580c" }}>
                      +{item.reward}
                    </span>
                  </div>
                );
              }}
            </For>
          </div>

          {/* Claim Button */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimed()}
            style={{
              width: "100%",
              padding: "12px",
              "border-radius": "16px",
              background: claimed() ? "#9ca3af" : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              border: "none",
              color: "#ffffff",
              "font-size": "13px",
              "font-weight": "900",
              cursor: claimed() ? "default" : "pointer",
              "box-shadow": "0 4px 12px rgba(234, 88, 12, 0.3)",
              "margin-top": "8px",
            }}
          >
            {claimed() ? "Claimed for Today!" : "Claim Reward 🔥"}
          </button>
        </div>
      </div>
    </Show>
  );
}
