"use client"

// Orchestrates the three entry-station screens: QR -> count -> wristbands.
import { useState } from "react"
import { api } from "@/lib/api"
import { useKiosk } from "@/lib/kiosk-context"
import { QRScreen } from "./qr-screen"
import { PeopleCountScreen } from "./people-count-screen"
import { WristbandAssignmentScreen } from "./wristband-assignment-screen"

type Step = "qr" | "count" | "wristbands"

export function EntryFlow() {
  const { addSession } = useKiosk()
  const [step, setStep] = useState<Step>("qr")
  const [qrReference, setQrReference] = useState<string | null>(null)
  const [adultCount, setAdultCount] = useState(0)
  const [childCount, setChildCount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)

  function resetFlow() {
    setStep("qr")
    setQrReference(null)
    setAdultCount(0)
    setChildCount(0)
    setSessionId(null)
  }

  async function handleConfirm() {
    const res = await api.createSession(adultCount, childCount)
    setSessionId(res.sessionId)
    addSession({
      id: res.sessionId,
      qrReference: qrReference ?? undefined,
      adultCount: res.adultCount,
      childCount: res.childCount,
      wristbands: [],
      status: "ACTIVE",
      createdAt: Date.now(),
    })
    setStep("wristbands")
  }

  if (step === "qr") {
    return (
      <QRScreen
        onScanned={(qr) => {
          setQrReference(qr)
          setStep("count")
        }}
      />
    )
  }

  if (step === "count") {
    return (
      <PeopleCountScreen
        adultCount={adultCount}
        childCount={childCount}
        setAdultCount={setAdultCount}
        setChildCount={setChildCount}
        onConfirm={handleConfirm}
        onBack={() => setStep("qr")}
      />
    )
  }

  return (
    <WristbandAssignmentScreen
      sessionId={sessionId as string}
      adultCount={adultCount}
      childCount={childCount}
      onNewRegistration={resetFlow}
    />
  )
}
