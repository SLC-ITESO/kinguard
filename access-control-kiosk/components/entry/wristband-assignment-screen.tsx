"use client"

// Screen 3 of /entrada — assigns one NFC wristband per person.
// Kept on-brand but as a clean custom screen (not over a busy photo).
import { useMemo, useState } from "react"
import { api, type WristbandRole } from "@/lib/api"
import { useKiosk } from "@/lib/kiosk-context"
import { ProgressIndicator } from "@/components/kiosk/progress-indicator"
import { StatusBadge } from "@/components/kiosk/status-badge"
import { CritHeader } from "@/components/kiosk/crit-header"

interface QueueItem {
  role: WristbandRole
  label: string
}

export function WristbandAssignmentScreen({
  sessionId,
  adultCount,
  childCount,
  onNewRegistration,
}: {
  sessionId: string
  adultCount: number
  childCount: number
  onNewRegistration: () => void
}) {
  const { addWristband } = useKiosk()

  // Build the ordered queue: adults first, then children.
  const queue = useMemo<QueueItem[]>(() => {
    const items: QueueItem[] = []
    for (let i = 1; i <= adultCount; i++) items.push({ role: "ADULT", label: `Acerque pulsera de adulto ${i}` })
    for (let i = 1; i <= childCount; i++) items.push({ role: "CHILD", label: `Acerque pulsera de niña/niño ${i}` })
    return items
  }, [adultCount, childCount])

  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [justAssigned, setJustAssigned] = useState(false)

  const total = queue.length
  const done = index >= total
  const current = queue[index]

  async function handleScan() {
    if (busy || done) return
    setBusy(true)
    const res = await api.assignWristband(sessionId, current.role)
    addWristband(sessionId, { id: res.wristbandId, role: res.role })
    setJustAssigned(true)
    setBusy(false)
    setTimeout(() => {
      setJustAssigned(false)
      setIndex((i) => i + 1)
    }, 700)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#3a1063] text-white">
      <CritHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {!done ? (
          <>
            <h1 className="text-balance text-4xl font-extrabold md:text-5xl">Asignación de pulseras</h1>
            <p className="mt-3 text-lg text-white/80">Sesión {sessionId}</p>

            <div className="mt-8 w-full max-w-2xl rounded-3xl bg-white/95 p-8 text-[#3a1063] shadow-2xl">
              <div className="mb-4">
                {justAssigned ? (
                  <StatusBadge variant="success">Pulsera registrada correctamente</StatusBadge>
                ) : (
                  <StatusBadge variant={current.role === "ADULT" ? "info" : "danger"}>
                    {current.role === "ADULT" ? "Adulto" : "Niña / Niño"}
                  </StatusBadge>
                )}
              </div>
              <p className="text-pretty text-3xl font-extrabold">{current.label}</p>
              <div className="mt-8">
                <ProgressIndicator current={index} total={total} label={`Pulsera ${index + 1} de ${total}`} />
              </div>
              <button
                type="button"
                onClick={handleScan}
                disabled={busy}
                className="mt-8 rounded-full bg-[#f5b400] px-8 py-4 text-lg font-bold text-[#3a1063] shadow-lg transition hover:bg-[#e0a400] disabled:opacity-50"
              >
                {busy ? "Leyendo pulsera…" : "Simular pulsera escaneada"}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-2xl rounded-3xl bg-white/95 p-10 text-[#3a1063] shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f7e2] text-4xl text-[#3f8a1f]">
              ✓
            </div>
            <h1 className="text-balance text-4xl font-extrabold">Entrada autorizada</h1>
            <p className="mt-3 text-xl text-[#5b1a8b]/80">Sesión activa.</p>
            <p className="mt-1 text-base text-[#5b1a8b]/60">
              {adultCount} {adultCount === 1 ? "adulto" : "adultos"} · {childCount}{" "}
              {childCount === 1 ? "niña/niño" : "niñas/niños"} · {total} pulseras asignadas
            </p>
            <button
              type="button"
              onClick={onNewRegistration}
              className="mt-8 rounded-full bg-[#5b1a8b] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#4a1370]"
            >
              Nuevo registro
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
