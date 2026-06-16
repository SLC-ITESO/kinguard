"use client"

// Internal monitoring + testing panel for the team. Reads global kiosk state
// and exposes demo actions (create session, simulate alarm, reset, clear).
import Link from "next/link"
import { api } from "@/lib/api"
import { useKiosk } from "@/lib/kiosk-context"

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-primary">{value}</p>
    </div>
  )
}

export function AdminDashboard() {
  const { sessions, events, alarms, lastQr, exitStatus, identificationMode, addSession, raiseAlarm, clearEvents, reset } =
    useKiosk()

  const activeSessions = sessions.filter((s) => s.status === "ACTIVE")
  const activeAlarms = alarms.filter((a) => a.status === "ACTIVE")
  const totalAdults = sessions.reduce((acc, s) => acc + s.adultCount, 0)
  const totalChildren = sessions.reduce((acc, s) => acc + s.childCount, 0)
  const totalWristbands = sessions.reduce((acc, s) => acc + s.wristbands.length, 0)

  async function createDemoSession() {
    const res = await api.createSession(2, 2)
    addSession({
      id: res.sessionId,
      adultCount: res.adultCount,
      childCount: res.childCount,
      wristbands: [],
      status: "ACTIVE",
      createdAt: Date.now(),
    })
  }

  return (
    <div className="min-h-screen bg-background p-6 text-foreground md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-primary">Panel de administración</h1>
            <p className="text-sm text-muted-foreground">Monitoreo y simulación · CRIT Teletón</p>
          </div>
          <nav className="flex gap-2">
            <Link href="/entrada" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Estación de entrada
            </Link>
            <Link href="/salida" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              Estación de salida
            </Link>
          </nav>
        </header>

        {/* Mode + Stats */}
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Identificación: {identificationMode}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Estado de salida: {exitStatus}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Último QR: {lastQr ?? "—"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Sesiones activas" value={activeSessions.length} />
          <Stat label="Adultos" value={totalAdults} />
          <Stat label="Niñas/niños" value={totalChildren} />
          <Stat label="Pulseras" value={totalWristbands} />
          <Stat label="Alarmas activas" value={activeAlarms.length} />
          <Stat label="Eventos" value={events.length} />
        </div>

        {/* Test actions */}
        <section className="mt-8 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
          <h2 className="mb-3 text-lg font-bold text-primary">Pruebas</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createDemoSession}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Crear sesión demo
            </button>
            <button
              type="button"
              onClick={() => raiseAlarm("Menor sin adulto autorizado", "Alarma simulada desde admin")}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              Simular alarma
            </button>
            <button
              type="button"
              onClick={clearEvents}
              className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:opacity-90"
            >
              Limpiar eventos
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-foreground/80 px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Reiniciar sistema mock
            </button>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Sessions */}
          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <h2 className="mb-3 text-lg font-bold text-primary">Sesiones activas</h2>
            {activeSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin sesiones activas.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activeSessions.map((s) => (
                  <li key={s.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="font-bold text-primary">{s.id}</p>
                    <p className="text-muted-foreground">
                      {s.adultCount} adultos · {s.childCount} niñas/niños · {s.wristbands.length} pulseras
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Alarms */}
          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <h2 className="mb-3 text-lg font-bold text-accent">Alarmas</h2>
            {alarms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin alarmas registradas.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {alarms.slice(0, 8).map((a) => (
                  <li key={a.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="font-bold text-accent">{a.type}</p>
                    <p className="text-muted-foreground">{a.message}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        a.status === "ACTIVE" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Events */}
          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <h2 className="mb-3 text-lg font-bold text-primary">Eventos recientes</h2>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin eventos.</p>
            ) : (
              <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {events.map((e) => (
                  <li key={e.id} className="rounded-lg bg-muted/40 p-2 text-xs">
                    <span className="font-bold text-primary">[{e.type}]</span>{" "}
                    <span className="text-muted-foreground">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
