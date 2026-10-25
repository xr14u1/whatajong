// Whatajong — Volume Slider Component
// Created by Snuff (https://snuffdied.xyz)

import { play } from "@/components/audio"
import { throttle } from "@/lib/throttle"
import {
  sliderLabelClass,
  sliderRangeClass,
  sliderRootClass,
  sliderThumbClass,
  sliderTrackClass,
} from "@/routes/settings.css"
import { Slider } from "@kobalte/core/slider"

const playClick = throttle(() => play("click2"), 60)

export function VolumeSlider(props: {
  label: string
  value: number
  onChange: (value: number) => void
  width?: string | number
}) {
  function onChange(value: number[]) {
    playClick()
    props.onChange(value[0]!)
  }

  return (
    <Slider
      value={[props.value]}
      class={sliderRootClass}
      style={{
        width: props.width ? (typeof props.width === "number" ? `${props.width}px` : props.width) : "100%",
        "max-width": "100%",
      }}
      onChange={onChange}
    >
      <div class={sliderLabelClass}>
        <Slider.Label style={{ "font-weight": "800", color: "#352e1e" }}>
          {props.label}
        </Slider.Label>
        <Slider.ValueLabel style={{ "font-weight": "800", color: "#84090b" }}>
          {props.value}%
        </Slider.ValueLabel>
      </div>
      <Slider.Track
        class={sliderTrackClass}
        style={{
          "margin-top": "6px",
          height: "10px",
          background: "rgba(0, 0, 0, 0.15)",
        }}
      >
        <Slider.Fill
          class={sliderRangeClass}
          style={{ background: "#2c80ef" }}
        />
        <Slider.Thumb
          class={sliderThumbClass}
          style={{
            width: "20px",
            height: "20px",
            top: "-5px",
            background: "#004192",
            "box-shadow": "0 2px 6px rgba(0,0,0,0.35)",
            cursor: "grab",
          }}
        >
          <Slider.Input />
        </Slider.Thumb>
      </Slider.Track>
      <Slider.Description />
      <Slider.ErrorMessage />
    </Slider>
  )
}
