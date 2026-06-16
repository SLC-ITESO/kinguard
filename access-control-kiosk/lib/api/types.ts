// Shared API contracts. These types describe exactly what the backend
// (FastAPI + ACR122U) is expected to return, so mockApi and the future
// real client (client.ts) can be swapped without touching the UI.

export type WristbandRole = "ADULT" | "CHILD"

export interface QrResult {
  qrReference: string
  status: "SCANNED"
}

export interface SessionResult {
  sessionId: string
  qrReference?: string
  adultCount: number
  childCount: number
  status: "ACTIVE"
}

export interface WristbandResult {
  wristbandId: string
  role: WristbandRole
  status: "ASSIGNED"
}

// Simulated exit scan event types
export type ExitScanType =
  | "ADULT_VALID"
  | "CHILD_VALID"
  | "CHILD_WITHOUT_ADULT"
  | "WRONG_FAMILY"
  | "UNKNOWN_WRISTBAND"
  | "DUPLICATE_SCAN"
  | "EXIT_COMPLETED"

export type ExitStatus = "OK" | "ALARM" | "WARNING" | "COMPLETED"

export interface ExitScanResult {
  status: ExitStatus
  message: string
  alarmType?: string
  sessionId?: string
  missingAdults?: number
  missingChildren?: number
}

export interface ResolveAlarmResult {
  alarmId: string
  status: "RESOLVED"
}

// The interface any API implementation (mock or real) must satisfy.
export interface KioskApi {
  scanQr: () => Promise<QrResult>
  createSession: (adultCount: number, childCount: number) => Promise<SessionResult>
  assignWristband: (sessionId: string, role: WristbandRole) => Promise<WristbandResult>
  scanExitWristband: (type: ExitScanType) => Promise<ExitScanResult>
  resolveAlarm: (alarmId: string) => Promise<ResolveAlarmResult>
}
