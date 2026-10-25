import { getTileSrc } from "@/assets/assets"
import { useMusic } from "@/components/audio"
import { LinkButton } from "@/components/button"
import { VolumeSlider } from "@/components/volumeSlider"
import { ArrowLeft, Check, ChevronUpAndDown } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { useGlobalState } from "@/state/globalState"
import { tma } from "@/lib/tma"
import { createSignal } from "solid-js"
import { Select } from "@kobalte/core/select"
import {
  backButtonClass,
  containerClass,
  contentClass,
  selectContentClass,
  selectIconClass,
  selectItemClass,
  selectItemIndicatorClass,
  selectListboxClass,
  selectTriggerClass,
  selectValueClass,
  titleClass,
} from "./settings.css"

const LOCALES = {
  es: "Spanish",
  en: "English",
} as const

export function Settings() {
  const globalState = useGlobalState()
  const t = useTranslation()
  const [haptics, setHaptics] = createSignal(tma.isHapticsEnabled())

  useMusic("music")

  const toggleHaptics = () => {
    const next = !haptics()
    setHaptics(next)
    tma.setHapticsEnabled(next)
    if (next) tma.impact("medium")
  }

  return (
    <div class={containerClass}>
      <div class={contentClass}>
        <div class={backButtonClass}>
          <LinkButton href="/" hue="dot">
            <ArrowLeft />
          </LinkButton>
        </div>
        <h1 class={titleClass}>{t.settings.title()}</h1>
        <VolumeSlider
          label={t.settings.soundVolume()}
          value={Math.round(globalState.soundVolume * 100)}
          onChange={(value) => {
            globalState.soundVolume = value / 100
          }}
        />
        <VolumeSlider
          label={t.settings.musicVolume()}
          value={Math.round(globalState.musicVolume * 100)}
          onChange={(value) => {
            globalState.musicVolume = value / 100
          }}
        />

        {/* Telegram Haptics Toggle */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            padding: "12px 16px",
            "border-radius": "16px",
            background: "rgba(0,0,0,0.03)",
            border: "1px solid rgba(0,0,0,0.08)",
            width: "100%",
          }}
        >
          <div>
            <div style={{ "font-size": "13px", "font-weight": "800", color: "#1f2937" }}>
              Telegram Haptics
            </div>
            <div style={{ "font-size": "10px", color: "#6b7280" }}>
              Tactile vibration on tile match & select
            </div>
          </div>
          <button
            type="button"
            onClick={toggleHaptics}
            style={{
              padding: "6px 14px",
              "border-radius": "12px",
              border: "none",
              background: haptics() ? "#10b981" : "#9ca3af",
              color: "#ffffff",
              "font-size": "11px",
              "font-weight": "800",
              cursor: "pointer",
            }}
          >
            {haptics() ? "ON" : "OFF"}
          </button>
        </div>

        <Select
          options={Object.keys(LOCALES)}
          value={globalState.locale}
          selectionBehavior="replace"
          disallowEmptySelection
          onChange={(value) => {
            globalState.locale = value!
          }}
          placeholder="Select Language"
          itemComponent={(props) => (
            <Select.Item item={props.item} class={selectItemClass}>
              <Select.ItemLabel>
                {LOCALES[props.item.rawValue as keyof typeof LOCALES]}
              </Select.ItemLabel>
              <Select.ItemIndicator class={selectItemIndicatorClass}>
                <Check width={20} height={20} />
              </Select.ItemIndicator>
            </Select.Item>
          )}
        >
          <Select.Trigger aria-label="Language" class={selectTriggerClass}>
            <Select.Value class={selectValueClass}>
              {(state: any) =>
                LOCALES[state.selectedOption() as keyof typeof LOCALES]
              }
            </Select.Value>
            <Select.Icon class={selectIconClass}>
              <ChevronUpAndDown width={20} height={20} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectContentClass}>
              <Select.Listbox class={selectListboxClass} />
            </Select.Content>
          </Select.Portal>
        </Select>

        {/* CREATED BY SNUFF CARD */}
        <a
          href="https://snuffdied.xyz"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            padding: "12px 16px",
            "border-radius": "16px",
            background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
            border: "1.5px solid #f59e0b",
            "box-shadow": "0 4px 14px rgba(245, 158, 11, 0.2)",
            width: "100%",
            "max-width": "280px",
            "text-decoration": "none",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(245, 158, 11, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(245, 158, 11, 0.2)";
          }}
        >
          <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
            <img
              src={getTileSrc("phoenix")}
              alt="Snuff"
              width={28}
              height={40}
              style={{ "border-radius": "4px" }}
            />
            <div>
              <div style={{ "font-size": "13px", "font-weight": "900", color: "#92400e" }}>
                Created by Snuff
              </div>
              <div style={{ "font-size": "10px", "font-weight": "700", color: "#b45309" }}>
                snuffdied.xyz ↗
              </div>
            </div>
          </div>
          <span
            style={{
              background: "#b45309",
              color: "#ffffff",
              "font-size": "10px",
              "font-weight": "800",
              padding: "4px 8px",
              "border-radius": "8px",
            }}
          >
            Visit
          </span>
        </a>

        {/* Attributions & MIT Notice */}
        <div
          style={{
            "margin-top": "16px",
            padding: "12px",
            "border-radius": "16px",
            background: "rgba(0,0,0,0.03)",
            "font-size": "10px",
            color: "#6b7280",
            "text-align": "center",
            "line-height": "1.5",
          }}
        >
          <div>Whatajong is MIT Licensed • Copyright (c) 2025 Pao Ramon</div>
          <div>Telegram Mini App features adapted from Meowdoku (MIT)</div>
        </div>
      </div>
    </div>
  )
}
