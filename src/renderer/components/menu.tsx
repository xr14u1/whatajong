// Whatajong — In-Game Menu & Settings Dialog
// Created by Snuff (https://snuffdied.xyz)

import { Dialog } from "@/components/dialog"
import { useTranslation } from "@/i18n/useTranslation"
import { useRunState } from "@/state/runState"
import { useGlobalState } from "@/state/globalState"
import { tma } from "@/lib/tma"
import { createEffect, createSignal } from "solid-js"
import { Button, LinkButton } from "./button"
import { VolumeSlider } from "./volumeSlider"
import {
  dialogContentClass,
  dialogItemClass,
  dialogItemsClass,
  dialogTitleClass,
} from "./dialog.css"
import { Home, ArrowRight, Gear, Check } from "./icon"

export function Menu() {
  const run = useRunState()
  const globalState = useGlobalState()
  const [open, setOpen] = createSignal(false)
  const [haptics, setHaptics] = createSignal(tma.isHapticsEnabled())
  const t = useTranslation()

  // close the menu when the run changes
  createEffect((prevRunId: string) => {
    if (prevRunId !== run.runId) {
      setOpen(false)
    }

    return run.runId
  }, run.runId)

  const toggleHaptics = () => {
    const next = !haptics()
    setHaptics(next)
    tma.setHapticsEnabled(next)
    if (next) tma.impact("medium")
  }

  return (
    <Dialog
      open={open()}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          hue="dot"
          title="settings"
          onPointerDown={() => setOpen(true)}
        >
          <Gear />
        </Button>
      }
      content={
        <div class={dialogContentClass} style={{ gap: "20px", "max-width": "340px", width: "100%" }}>
          <h1 class={dialogTitleClass} style={{ "text-align": "center", "margin-bottom": "4px" }}>
            {t.settings.title()}
          </h1>

          {/* Audio Controls */}
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "16px",
              background: "rgba(0, 0, 0, 0.04)",
              padding: "16px",
              "border-radius": "14px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Music Volume Slider */}
            <VolumeSlider
              label={t.settings.musicVolume()}
              value={Math.round(globalState.musicVolume * 100)}
              onChange={(value) => {
                globalState.musicVolume = value / 100
              }}
            />

            {/* Sound FX Volume Slider */}
            <VolumeSlider
              label={t.settings.soundVolume()}
              value={Math.round(globalState.soundVolume * 100)}
              onChange={(value) => {
                globalState.soundVolume = value / 100
              }}
            />

            {/* Telegram Haptics Toggle */}
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                "margin-top": "4px",
                "padding-top": "12px",
                "border-top": "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <div>
                <div style={{ "font-size": "13px", "font-weight": "800", color: "#352e1e" }}>
                  Telegram Haptics
                </div>
                <div style={{ "font-size": "10px", color: "#78716c" }}>
                  Tactile vibrations on match
                </div>
              </div>
              <button
                type="button"
                onClick={toggleHaptics}
                style={{
                  padding: "4px 12px",
                  "border-radius": "10px",
                  border: "none",
                  "font-size": "11px",
                  "font-weight": "800",
                  cursor: "pointer",
                  background: haptics() ? "#3b9a36" : "#b3ad9b",
                  color: "#ffffff",
                  "box-shadow": "0 2px 4px rgba(0,0,0,0.15)",
                }}
              >
                {haptics() ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div class={dialogItemsClass} style={{ gap: "10px" }}>
            {/* Resume button */}
            <div class={dialogItemClass}>
              <Button
                type="button"
                hue="bam"
                suave
                style={{ width: "100%", "justify-content": "center" }}
                onPointerDown={() => setOpen(false)}
              >
                <Check />
                Resume Game
              </Button>
            </div>

            {/* New run button */}
            <div class={dialogItemClass}>
              <LinkButton
                href="/new"
                hue="dot"
                suave
                style={{ width: "100%", "justify-content": "center" }}
              >
                <ArrowRight />
                {t.settings.newRun()}
              </LinkButton>
            </div>

            {/* Go back to menu button */}
            <div class={dialogItemClass}>
              <LinkButton
                href="/"
                hue="bone"
                suave
                style={{ width: "100%", "justify-content": "center" }}
              >
                <Home />
                {t.settings.goBack()}
              </LinkButton>
            </div>

            {/* Created by Snuff Credit */}
            <a
              href="https://snuffdied.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                "font-size": "11px",
                "font-weight": "800",
                color: "#b45309",
                "text-align": "center",
                "text-decoration": "none",
                "margin-top": "6px",
                opacity: "0.85",
              }}
            >
              Created by Snuff • snuffdied.xyz ↗
            </a>
          </div>
        </div>
      }
    />
  )
}
