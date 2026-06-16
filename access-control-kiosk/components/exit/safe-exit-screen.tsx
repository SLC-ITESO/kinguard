"use client"

// /salida waiting screen — uses the "Salida segura" background.
// Shows a live status overlay and a discreet simulation panel.
import { KioskFrame } from "@/components/kiosk/kiosk-frame"
import { StatusBadge } from "@/components/kiosk/status-badge"
import { SimulationPanel, type SimAction } from "@/components/kiosk/simulation-panel"

type Variant = "idle" | "success" | "warning" | "danger" | "info"

export function SafeExitScreen({
  statusText,
  statusVariant,
  adultValidated,
  scannedChildren,
  totalChildren,
  actions,
}: {
  statusText: string
  statusVariant: Variant
  adultValidated: boolean
  scannedChildren: number
  totalChildren: number
  actions: SimAction[]
}) {
  return (
    <KioskFrame background="safeExit">
      {/* Live status overlay pinned to a clear corner so it never collides
          with the artwork's title/subtitle copy */}
      <div className="absolute left-[2.5%] top-[16%] flex max-w-[26%] flex-col items-start gap-3 rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur">
        <StatusBadge variant={statusVariant} className="text-base">
          {statusText}
        </StatusBadge>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              adultValidated ? "bg-[#e9f7e2] text-[#3f8a1f]" : "bg-white/85 text-[#5b1a8b]/70"
            }`}
          >
            {adultValidated ? "Adulto validado" : "Adulto pendiente"}
          </span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[#d3066f]">
            Niñas/niños: {scannedChildren}/{totalChildren}
          </span>
        </div>
      </div>

      <SimulationPanel title="Simular lecturas de salida" actions={actions} />
    </KioskFrame>
  )
}
