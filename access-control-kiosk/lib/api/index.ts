// Single import point for the rest of the app.
// To go live, implement client.ts against FastAPI and swap the export below:
//   export { realApi as api } from "./client"
import { mockApi } from "./mock-api"
import type { KioskApi } from "./types"

export const api: KioskApi = mockApi

export * from "./types"
