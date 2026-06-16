import Link from "next/link"
import { CritHeader } from "@/components/kiosk/crit-header"

// Selector de estación (no es parte del kiosco, sirve para abrir cada modo).
export default function Page() {
  const stations = [
    { href: "/entrada", title: "Estación de entrada", desc: "Escaneo de QR, conteo de personas y asignación de pulseras.", cls: "bg-primary text-primary-foreground" },
    { href: "/salida", title: "Estación de salida", desc: "Validación de adulto, escaneo de menores y depósito de pulseras.", cls: "bg-accent text-accent-foreground" },
    { href: "/admin", title: "Panel de administración", desc: "Monitoreo, sesiones, alarmas y simulación.", cls: "bg-secondary text-secondary-foreground" },
  ]
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CritHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-balance text-4xl font-extrabold text-primary md:text-5xl">
          Sistema de control de acceso
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-lg text-muted-foreground">
          Una sola aplicación con dos estaciones de kiosco. Selecciona un modo para comenzar.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {stations.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`flex flex-col rounded-3xl p-7 shadow-lg transition hover:scale-[1.02] ${s.cls}`}
            >
              <span className="text-2xl font-extrabold">{s.title}</span>
              <span className="mt-2 text-sm opacity-90">{s.desc}</span>
              <span className="mt-6 text-sm font-bold underline underline-offset-4">Abrir →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
