"use client"

// Brand header bar that mirrors the top strip of the artwork, used on the
// custom (non-image) kiosk screens so they stay visually consistent.
import { useEffect, useState } from "react"

export function CritHeader({ badge = "Bienvenido" }: { badge?: string }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(t)
  }, [])

  const time = now
    ? now.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true })
    : "--:--"
  const date = now
    ? now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : ""

  return (
    <header className="flex items-center justify-between bg-[#4a1370] px-8 py-4 text-white">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5b400] text-lg font-black text-[#3a1063]">
          ♥
        </span>
        <div className="leading-tight">
          <p className="text-xl font-black tracking-tight">
            CRIT <span className="font-semibold text-white/90">Teletón</span>
          </p>
        </div>
        <span className="ml-3 hidden border-l border-white/30 pl-3 text-sm text-white/70 md:inline">
          Juntos lo hacemos posible
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-black/25 px-4 py-2 text-right leading-tight">
          <p className="text-base font-bold">{time}</p>
          <p className="text-xs capitalize text-white/70">{date}</p>
        </div>
        <span className="rounded-full bg-[#f5b400] px-4 py-2 text-sm font-bold text-[#3a1063]">{badge}</span>
      </div>
    </header>
  )
}
