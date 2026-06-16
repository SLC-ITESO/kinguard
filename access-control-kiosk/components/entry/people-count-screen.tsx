"use client"

// Screen 2 of /entrada — uses the "¿Cuántas personas van a entrar?" background.
// Overlay hotspots sit over the +/- circles; numbers are masked over the art.
import { KioskFrame } from "@/components/kiosk/kiosk-frame"
import { OverlayButton } from "@/components/kiosk/overlay-button"
import { CounterOverlay } from "@/components/kiosk/counter-overlay"
import { ArtworkClock } from "@/components/kiosk/artwork-clock"

export function PeopleCountScreen({
  adultCount,
  childCount,
  setAdultCount,
  setChildCount,
  onConfirm,
  onBack,
}: {
  adultCount: number
  childCount: number
  setAdultCount: (n: number) => void
  setChildCount: (n: number) => void
  onConfirm: () => void
  onBack: () => void
}) {
  // counters can go down to 0
  const decAdult = () => setAdultCount(Math.max(0, adultCount - 1))
  const incAdult = () => setAdultCount(Math.min(20, adultCount + 1))
  const decChild = () => setChildCount(Math.max(0, childCount - 1))
  const incChild = () => setChildCount(Math.min(20, childCount + 1))

  return (
    <KioskFrame background="count">
      {/* Live clock over the static time pill in the artwork header */}
      <ArtworkClock />

      {/* Dynamic numbers (masking the static 0 in the artwork) */}
      <CounterOverlay value={adultCount} top="53%" left="46.6%" width="10%" height="17%" color="#5b1a8b" bg="#ece3f7" />
      <CounterOverlay value={childCount} top="53%" left="72.5%" width="10%" height="17%" color="#d3066f" bg="#fbe2ef" />

      {/* Adults − / + */}
      <OverlayButton ariaLabel="Quitar un adulto" top="69%" left="38%" width="8%" height="13%" onClick={decAdult} rounded="rounded-full" />
      <OverlayButton ariaLabel="Agregar un adulto" top="69%" left="48%" width="8%" height="13%" onClick={incAdult} rounded="rounded-full" />

      {/* Kids − / + */}
      <OverlayButton ariaLabel="Quitar una niña o niño" top="69%" left="63.5%" width="8%" height="13%" onClick={decChild} rounded="rounded-full" />
      <OverlayButton ariaLabel="Agregar una niña o niño" top="69%" left="73.5%" width="8%" height="13%" onClick={incChild} rounded="rounded-full" />

      {/* Confirmar entrada */}
      <OverlayButton ariaLabel="Confirmar entrada" top="82%" left="34%" width="25%" height="11%" onClick={onConfirm} disabled={adultCount + childCount === 0} />

      {/* Volver */}
      <OverlayButton ariaLabel="Volver" top="82%" left="63.5%" width="13%" height="11%" onClick={onBack} />
    </KioskFrame>
  )
}
