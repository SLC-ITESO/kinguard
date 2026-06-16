"use client"

// Orchestrates the exit station: safe-exit waiting -> authorized / alarm.
// Validation rule: an adult must be validated before children count.
import { useMemo, useState } from "react"
import { api, type ExitScanType } from "@/lib/api"
import { useKiosk } from "@/lib/kiosk-context"
import type { SimAction } from "@/components/kiosk/simulation-panel"
import { SafeExitScreen } from "./safe-exit-screen"
import { AuthorizedExitScreen } from "./authorized-exit-screen"
import { AlarmScreen } from "./alarm-screen"

type Phase = "scanning" | "authorized" | "alarm"
type Variant = "idle" | "success" | "warning" | "danger" | "info"

export function ExitFlow() {
  const { sessions, raiseAlarm, resolveAlarm, addEvent, setExitStatus } = useKiosk()

  // Expected children to scan: from the latest active session, fallback to 2.
  const totalChildren = useMemo(() => {
    const active = sessions.find((s) => s.status === "ACTIVE")
    return active?.childCount ?? 2
  }, [sessions])

  const [phase, setPhase] = useState<Phase>("scanning")
  const [adultValidated, setAdultValidated] = useState(false)
  const [scannedChildren, setScannedChildren] = useState(0)
  const [statusText, setStatusText] = useState("Esperando pulsera de adulto")
  const [statusVariant, setStatusVariant] = useState<Variant>("idle")
  const [alarmType, setAlarmType] = useState<string | undefined>(undefined)
  const [currentAlarmId, setCurrentAlarmId] = useState<string | null>(null)

  function updateStatus(text: string, variant: Variant) {
    setStatusText(text)
    setStatusVariant(variant)
    setExitStatus(text)
  }

  function resetExit() {
    setPhase("scanning")
    setAdultValidated(false)
    setScannedChildren(0)
    setAlarmType(undefined)
    setCurrentAlarmId(null)
    updateStatus("Esperando pulsera de adulto", "idle")
    addEvent("EXIT", "Salida reiniciada")
  }

  function triggerAlarm(type: string, message: string) {
    const alarm = raiseAlarm(type, message)
    setAlarmType(type)
    setCurrentAlarmId(alarm.id)
    setPhase("alarm")
  }

  async function completeExit() {
    const res = await api.scanExitWristband("EXIT_COMPLETED")
    addEvent("EXIT", res.message)
    updateStatus("Salida autorizada", "success")
    setPhase("authorized")
  }

  async function handleScan(type: ExitScanType) {
    const res = await api.scanExitWristband(type)
    addEvent("EXIT", `${type}: ${res.message}`)

    if (res.status === "ALARM") {
      triggerAlarm(res.alarmType ?? "Salida no autorizada", res.message)
      return
    }

    if (res.status === "WARNING") {
      // duplicate scan, etc.
      updateStatus(res.message, "warning")
      return
    }

    // OK responses
    if (type === "ADULT_VALID") {
      setAdultValidated(true)
      updateStatus("Adulto validado. Ahora escanea a las niñas y los niños.", "success")
      return
    }

    if (type === "CHILD_VALID") {
      if (!adultValidated) {
        updateStatus("Primero valida la pulsera de un adulto.", "warning")
        return
      }
      const next = scannedChildren + 1
      setScannedChildren(next)
      if (next >= totalChildren) {
        updateStatus("Todas las pulseras escaneadas.", "success")
        completeExit()
      } else {
        updateStatus(`Pulsera válida. Faltan ${totalChildren - next} por escanear.`, "info")
      }
    }
  }

  if (phase === "authorized") {
    return <AuthorizedExitScreen onNewExit={resetExit} />
  }

  if (phase === "alarm") {
    return (
      <AlarmScreen
        alarmType={alarmType}
        onResolve={() => {
          if (currentAlarmId) resolveAlarm(currentAlarmId)
          resetExit()
        }}
        onRetry={() => {
          setPhase("scanning")
          updateStatus("Reintentar escaneo. Esperando pulsera de adulto.", "idle")
        }}
        onCallSupervisor={() => addEvent("EXIT", "Supervisor llamado por el guardia")}
      />
    )
  }

  const actions: SimAction[] = [
    { label: "Simular adulto válido", onClick: () => handleScan("ADULT_VALID"), variant: "primary" },
    { label: "Simular menor válido", onClick: () => handleScan("CHILD_VALID"), variant: "primary" },
    { label: "Simular menor sin adulto", onClick: () => handleScan("CHILD_WITHOUT_ADULT"), variant: "danger" },
    { label: "Simular pulsera incorrecta", onClick: () => handleScan("WRONG_FAMILY"), variant: "danger" },
    { label: "Simular pulsera desconocida", onClick: () => handleScan("UNKNOWN_WRISTBAND"), variant: "danger" },
    { label: "Simular pulsera repetida", onClick: () => handleScan("DUPLICATE_SCAN"), variant: "warning" },
    { label: "Reiniciar salida", onClick: resetExit, variant: "neutral" },
  ]

  return (
    <SafeExitScreen
      statusText={statusText}
      statusVariant={statusVariant}
      adultValidated={adultValidated}
      scannedChildren={scannedChildren}
      totalChildren={totalChildren}
      actions={actions}
    />
  )
}
