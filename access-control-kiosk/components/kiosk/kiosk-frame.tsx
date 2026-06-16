"use client"

// Fullscreen, no-scroll kiosk container that holds a 16:9 stage.
// The stage is sized to fit the viewport while keeping the 16:9 ratio, so
// percentage-based overlays line up exactly with the background image.
import type { ReactNode } from "react"
import type { BackgroundKey } from "@/config/backgrounds"
import { backgrounds } from "@/config/backgrounds"

export function KioskFrame({
  background,
  children,
}: {
  background: BackgroundKey
  children?: ReactNode
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#3a1063]">
      {/* 16:9 stage: width capped by viewport width and by 16/9 of viewport height */}
      <div
        className="relative"
        style={{
          width: "min(100vw, 177.78vh)",
          height: "min(100vh, 56.25vw)",
        }}
      >
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${backgrounds[background]})` }}
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  )
}
