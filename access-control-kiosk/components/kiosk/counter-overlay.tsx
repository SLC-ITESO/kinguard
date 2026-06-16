"use client"

// Renders the live count number on top of the count-screen background.
import type { CSSProperties } from "react"

export function CounterOverlay({
  value,
  top,
  left,
  width,
  height,
  color = "#5b1a8b",
  bg,
}: {
  value: number
  top: string
  left: string
  width: string
  height: string
  color?: string
  // optional background to mask the static digit baked into the artwork
  bg?: string
}) {
  const style: CSSProperties = {
    top,
    left,
    width,
    height,
    color,
    background: bg,
    borderRadius: bg ? "0.75rem" : undefined,
  }
  return (
    <div
      style={style}
      aria-hidden="true"
      className="pointer-events-none absolute flex items-center justify-center font-sans font-extrabold leading-none"
    >
      <span style={{ fontSize: "min(4.5vw, 3.2rem)" }}>{value}</span>
    </div>
  )
}
