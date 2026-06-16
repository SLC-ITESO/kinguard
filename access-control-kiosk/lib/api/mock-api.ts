// Simulated API layer. Replace this module with lib/api/client.ts (talking to
// FastAPI) when the ACR122U backend is ready. The UI only depends on KioskApi.
import type {
  ExitScanResult,
  ExitScanType,
  KioskApi,
  QrResult,
  ResolveAlarmResult,
  SessionResult,
  WristbandResult,
  WristbandRole,
} from "./types"

// small helper to simulate network latency
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

const randomId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export async function scanQr(): Promise<QrResult> {
  await delay()
  return { qrReference: randomId("QR"), status: "SCANNED" }
}

export async function createSession(
  adultCount: number,
  childCount: number,
): Promise<SessionResult> {
  await delay()
  return {
    sessionId: randomId("SESS"),
    adultCount,
    childCount,
    status: "ACTIVE",
  }
}

export async function assignWristband(
  sessionId: string,
  role: WristbandRole,
): Promise<WristbandResult> {
  await delay(250)
  return {
    wristbandId: randomId("WB"),
    role,
    status: "ASSIGNED",
  }
}

// Maps each simulated scan type to the structured response the backend
// would produce. The exit flow uses status/alarmType to drive screens.
export async function scanExitWristband(type: ExitScanType): Promise<ExitScanResult> {
  await delay(250)
  switch (type) {
    case "ADULT_VALID":
      return {
        status: "OK",
        message: "Adulto validado. Ahora escanea a las niñas y los niños.",
      }
    case "CHILD_VALID":
      return { status: "OK", message: "Pulsera válida." }
    case "CHILD_WITHOUT_ADULT":
      return {
        status: "ALARM",
        message: "Menor sin adulto autorizado.",
        alarmType: "Menor sin adulto autorizado",
      }
    case "WRONG_FAMILY":
      return {
        status: "ALARM",
        message: "Pulsera no vinculada a esta familia.",
        alarmType: "Pulsera no vinculada",
      }
    case "UNKNOWN_WRISTBAND":
      return {
        status: "ALARM",
        message: "Pulsera desconocida.",
        alarmType: "Pulsera desconocida",
      }
    case "DUPLICATE_SCAN":
      return { status: "WARNING", message: "Pulsera ya registrada." }
    case "EXIT_COMPLETED":
      return { status: "COMPLETED", message: "Salida autorizada." }
    default:
      return { status: "WARNING", message: "Lectura no reconocida." }
  }
}

export async function resolveAlarm(alarmId: string): Promise<ResolveAlarmResult> {
  await delay()
  return { alarmId, status: "RESOLVED" }
}

// Bundled implementation that satisfies the KioskApi contract.
export const mockApi: KioskApi = {
  scanQr,
  createSession,
  assignWristband,
  scanExitWristband,
  resolveAlarm,
}
