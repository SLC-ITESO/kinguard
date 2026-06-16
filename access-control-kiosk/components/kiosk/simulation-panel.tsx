"use client"

// Discreet, collapsible panel of demo buttons. These stand in for real NFC
// reads coming from the FastAPI backend, and should be removed/hidden in prod.
import { useState } from "react"

export interface SimAction {
  label: string
  onClick: () => void
  variant?: "primary" | "neutral" | "danger" | "warning"
}

const variantClass: Record<NonNullable<SimAction["variant"]>, string> = {
  primary: "bg-[#5b1a8b] text-white hover:bg-[#4a1370]",
  neutral: "bg-white text-[#5b1a8b] ring-1 ring-[#5b1a8b]/30 hover:bg-[#f3ecfb]",
  danger: "bg-[#d3066f] text-white hover:bg-[#b00559]",
  warning: "bg-[#f5b400] text-[#3a1063] hover:bg-[#e0a400]",
}

export function SimulationPanel({
  title = "Panel de simulación",
  actions,
}: {
  title?: string
  actions: SimAction[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute bottom-4 right-4 z-20 text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
      >
        <span aria-hidden="true">{open ? "▾" : "▴"}</span>
        {open ? "Ocultar pruebas" : "Pruebas"}
      </button>

      {open ? (
        <div className="mt-2 w-64 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-black/10 backdrop-blur">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#5b1a8b]/70">{title}</p>
          <div className="flex flex-col gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  variantClass[a.variant ?? "neutral"]
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
