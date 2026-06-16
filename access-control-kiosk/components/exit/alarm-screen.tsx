"use client"

// Salida no autorizada — uses the alarm background; only functional buttons
// are overlaid since the artwork already carries the main message.
import { KioskFrame } from "@/components/kiosk/kiosk-frame"

export function AlarmScreen({
  alarmType,
  onResolve,
  onRetry,
  onCallSupervisor,
}: {
  alarmType?: string
  onResolve: () => void
  onRetry: () => void
  onCallSupervisor: () => void
}) {
  return (
    <KioskFrame background="alarm">
      {/* Optional alarm type, placed under the subtitle on the right half */}
      {alarmType ? (
        <div className="absolute left-[50%] top-[73%] w-[46%] -translate-x-1/2 text-center">
          <span className="inline-block rounded-full bg-[#d3066f] px-5 py-2 text-sm font-bold text-white shadow-lg">
            {alarmType}
          </span>
        </div>
      ) : null}

      {/* Guard / family action buttons */}
      <div className="absolute left-[50%] top-[82%] flex w-[46%] -translate-x-1/2 items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResolve}
          className="rounded-full bg-[#3f8a1f] px-6 py-3 text-base font-bold text-white shadow-lg transition hover:bg-[#347016]"
        >
          Resolver alerta
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-[#5b1a8b] px-6 py-3 text-base font-bold text-white shadow-lg transition hover:bg-[#4a1370]"
        >
          Reintentar escaneo
        </button>
        <button
          type="button"
          onClick={onCallSupervisor}
          className="rounded-full bg-white px-6 py-3 text-base font-bold text-[#5b1a8b] shadow-lg ring-1 ring-[#5b1a8b]/30 transition hover:bg-[#f3ecfb]"
        >
          Llamar supervisor
        </button>
      </div>
    </KioskFrame>
  )
}
