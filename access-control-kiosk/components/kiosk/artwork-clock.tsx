"use client"

// Live clock that sits exactly over the static time pill baked into the
// kiosk artwork header, so the displayed time/date stays current.
import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function ArtworkClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const time = now
    ? now
        .toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true })
        .replace(/\./g, "")
        .replace("a m", "a.m.")
        .replace("p m", "p.m.")
    : "--:--"
  const date = now
    ? now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : ""

  return (
    <div
      aria-label="Hora y fecha actual"
      className="absolute flex items-center gap-2 rounded-2xl bg-[#2a1048] px-3 text-white"
      style={{ top: "3.5%", left: "63.8%", width: "16.8%", height: "9.5%" }}
    >
      <Clock className="h-[28%] w-auto shrink-0 text-white/90" style={{ minHeight: 16 }} aria-hidden="true" />
      <div className="leading-tight">
        <p className="font-bold" style={{ fontSize: "min(1.3vw, 1.05rem)" }}>
          {time}
        </p>
        <p className="capitalize text-white/70" style={{ fontSize: "min(0.85vw, 0.7rem)" }}>
          {date}
        </p>
      </div>
    </div>
  )
}
