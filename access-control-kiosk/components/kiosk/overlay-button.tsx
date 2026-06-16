"use client"

// A clickable zone positioned in percentages over the background image.
// Set `debug` to give it a visible tint while aligning hotspots.
import type { CSSProperties, ReactNode } from "react"

export function OverlayButton({
  top,
  left,
  width,
  height,
  onClick,
  disabled,
  debug = false,
  ariaLabel,
  children,
  rounded = "rounded-2xl",
}: {
  top: string
  left: string
  width: string
  height: string
  onClick?: () => void
  disabled?: boolean
  debug?: boolean
  ariaLabel: string
  children?: ReactNode
  rounded?: string
}) {
  const style: CSSProperties = { top, left, width, height }
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[
        "absolute flex items-center justify-center transition-transform duration-150",
        rounded,
        "focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:scale-[1.03] active:scale-95",
        debug ? "bg-pink-500/40 ring-2 ring-pink-600" : "bg-transparent",
      ].join(" ")}
    >
      {children}
    </button>
  )
}
