"use client"

// Salida autorizada — clean on-brand confirmation screen.
import { CritHeader } from "@/components/kiosk/crit-header"

export function AuthorizedExitScreen({ onNewExit }: { onNewExit: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#3a1063] text-white">
      <CritHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="w-full max-w-2xl rounded-3xl bg-white/95 p-10 text-[#3a1063] shadow-2xl">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#e9f7e2] text-5xl text-[#3f8a1f]">
            ✓
          </div>
          <h1 className="text-balance text-5xl font-extrabold">Salida autorizada</h1>
          <p className="mt-4 text-pretty text-xl text-[#5b1a8b]/80">
            Gracias. Puedes depositar las pulseras en la caja.
          </p>
          <button
            type="button"
            onClick={onNewExit}
            className="mt-8 rounded-full bg-[#f5b400] px-8 py-4 text-lg font-bold text-[#3a1063] shadow-lg transition hover:bg-[#e0a400]"
          >
            Nueva salida
          </button>
        </div>
      </main>
    </div>
  )
}
