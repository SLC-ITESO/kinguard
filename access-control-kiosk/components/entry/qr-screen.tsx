"use client"

// Screen 1 of /entrada — uses the "Escanea tu código QR" background.
// Real QR/NFC reads come from the backend; here a test button simulates it.
import { useState } from "react"
import { KioskFrame } from "@/components/kiosk/kiosk-frame"
import { OverlayButton } from "@/components/kiosk/overlay-button"
import { StatusBadge } from "@/components/kiosk/status-badge"
import { ArtworkClock } from "@/components/kiosk/artwork-clock"
import { api } from "@/lib/api"
import { useKiosk } from "@/lib/kiosk-context"

export function QRScreen({ onScanned }: { onScanned: (qrReference: string) => void }) {
  const { setQr } = useKiosk()
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle")

  async function handleScan() {
    setStatus("scanning")
    const res = await api.scanQr()
    setQr(res.qrReference)
    setStatus("done")
    setTimeout(() => onScanned(res.qrReference), 600)
  }

  return (
    <KioskFrame background="qr">
      {/* Live status pill placed below the scanner frame */}
      <div className="absolute left-1/2 top-[80%] -translate-x-1/2">
        {status === "idle" && <StatusBadge variant="idle">Esperando código QR</StatusBadge>}
        {status === "scanning" && <StatusBadge variant="info">Leyendo código…</StatusBadge>}
        {status === "done" && <StatusBadge variant="success">QR escaneado correctamente</StatusBadge>}
      </div>

      {/* Clickable scanner zone (over the QR frame in the artwork) */}
      <OverlayButton
        ariaLabel="Simular código QR escaneado"
        top="48%"
        left="40%"
        width="20%"
        height="30%"
        onClick={handleScan}
        disabled={status !== "idle"}
      />

      {/* Explicit test button bottom-left */}
      <button
        type="button"
        onClick={handleScan}
        disabled={status !== "idle"}
        className="absolute bottom-[4%] left-[3%] rounded-full bg-[#f5b400] px-5 py-3 text-sm font-bold text-[#3a1063] shadow-lg transition hover:bg-[#e0a400] disabled:opacity-50"
      >
        Simular QR escaneado
      </button>
    </KioskFrame>
  )
}
