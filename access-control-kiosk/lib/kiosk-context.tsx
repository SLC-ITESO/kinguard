"use client"

// Global prototype state shared across the entry station, exit station and
// admin dashboard. Uses Context + useReducer; swap for a real store later.
import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"
import type { WristbandRole } from "./api"

export type StationMode = "ENTRY" | "EXIT"

export interface Wristband {
  id: string
  role: WristbandRole
}

export interface Session {
  id: string
  qrReference?: string
  adultCount: number
  childCount: number
  wristbands: Wristband[]
  status: "ACTIVE" | "EXITED"
  createdAt: number
}

export interface KioskEvent {
  id: string
  time: number
  type: string
  message: string
}

export interface Alarm {
  id: string
  type: string
  message: string
  time: number
  status: "ACTIVE" | "RESOLVED"
}

interface KioskState {
  sessions: Session[]
  events: KioskEvent[]
  alarms: Alarm[]
  lastQr: string | null
  exitStatus: string
  identificationMode: "UID_ONLY"
}

const initialState: KioskState = {
  sessions: [],
  events: [],
  alarms: [],
  lastQr: null,
  exitStatus: "Esperando salida",
  identificationMode: "UID_ONLY",
}

type Action =
  | { type: "ADD_EVENT"; payload: { type: string; message: string } }
  | { type: "SET_QR"; payload: string }
  | { type: "ADD_SESSION"; payload: Session }
  | { type: "ADD_WRISTBAND"; payload: { sessionId: string; wristband: Wristband } }
  | { type: "RAISE_ALARM"; payload: Alarm }
  | { type: "RESOLVE_ALARM"; payload: string }
  | { type: "SET_EXIT_STATUS"; payload: string }
  | { type: "CLEAR_EVENTS" }
  | { type: "RESET" }

let counter = 0
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${counter++}`

function reducer(state: KioskState, action: Action): KioskState {
  switch (action.type) {
    case "ADD_EVENT":
      return {
        ...state,
        events: [
          { id: uid("EV"), time: Date.now(), ...action.payload },
          ...state.events,
        ].slice(0, 40),
      }
    case "SET_QR":
      return { ...state, lastQr: action.payload }
    case "ADD_SESSION":
      return { ...state, sessions: [action.payload, ...state.sessions] }
    case "ADD_WRISTBAND":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload.sessionId
            ? { ...s, wristbands: [...s.wristbands, action.payload.wristband] }
            : s,
        ),
      }
    case "RAISE_ALARM":
      return { ...state, alarms: [action.payload, ...state.alarms] }
    case "RESOLVE_ALARM":
      return {
        ...state,
        alarms: state.alarms.map((a) =>
          a.id === action.payload ? { ...a, status: "RESOLVED" } : a,
        ),
      }
    case "SET_EXIT_STATUS":
      return { ...state, exitStatus: action.payload }
    case "CLEAR_EVENTS":
      return { ...state, events: [] }
    case "RESET":
      return initialState
    default:
      return state
  }
}

interface KioskContextValue extends KioskState {
  addEvent: (type: string, message: string) => void
  setQr: (qr: string) => void
  addSession: (session: Session) => void
  addWristband: (sessionId: string, wristband: Wristband) => void
  raiseAlarm: (type: string, message: string) => Alarm
  resolveAlarm: (id: string) => void
  setExitStatus: (status: string) => void
  clearEvents: () => void
  reset: () => void
}

const KioskContext = createContext<KioskContextValue | null>(null)

export function KioskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addEvent = useCallback(
    (type: string, message: string) => dispatch({ type: "ADD_EVENT", payload: { type, message } }),
    [],
  )
  const setQr = useCallback((qr: string) => {
    dispatch({ type: "SET_QR", payload: qr })
    dispatch({ type: "ADD_EVENT", payload: { type: "QR", message: `QR escaneado: ${qr}` } })
  }, [])
  const addSession = useCallback((session: Session) => {
    dispatch({ type: "ADD_SESSION", payload: session })
    dispatch({
      type: "ADD_EVENT",
      payload: {
        type: "SESSION",
        message: `Sesión ${session.id} creada (${session.adultCount} adultos, ${session.childCount} niñas/niños)`,
      },
    })
  }, [])
  const addWristband = useCallback((sessionId: string, wristband: Wristband) => {
    dispatch({ type: "ADD_WRISTBAND", payload: { sessionId, wristband } })
    dispatch({
      type: "ADD_EVENT",
      payload: { type: "WRISTBAND", message: `Pulsera ${wristband.id} (${wristband.role}) asignada` },
    })
  }, [])
  const raiseAlarm = useCallback((type: string, message: string) => {
    const alarm: Alarm = { id: uid("ALARM"), type, message, time: Date.now(), status: "ACTIVE" }
    dispatch({ type: "RAISE_ALARM", payload: alarm })
    dispatch({ type: "ADD_EVENT", payload: { type: "ALARM", message: `Alarma: ${type}` } })
    return alarm
  }, [])
  const resolveAlarm = useCallback((id: string) => {
    dispatch({ type: "RESOLVE_ALARM", payload: id })
    dispatch({ type: "ADD_EVENT", payload: { type: "ALARM", message: `Alarma ${id} resuelta` } })
  }, [])
  const setExitStatus = useCallback(
    (status: string) => dispatch({ type: "SET_EXIT_STATUS", payload: status }),
    [],
  )
  const clearEvents = useCallback(() => dispatch({ type: "CLEAR_EVENTS" }), [])
  const reset = useCallback(() => dispatch({ type: "RESET" }), [])

  return (
    <KioskContext.Provider
      value={{
        ...state,
        addEvent,
        setQr,
        addSession,
        addWristband,
        raiseAlarm,
        resolveAlarm,
        setExitStatus,
        clearEvents,
        reset,
      }}
    >
      {children}
    </KioskContext.Provider>
  )
}

export function useKiosk() {
  const ctx = useContext(KioskContext)
  if (!ctx) throw new Error("useKiosk must be used within KioskProvider")
  return ctx
}
