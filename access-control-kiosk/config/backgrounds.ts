// Central place to map each kiosk screen to its background image.
// Swap these paths if the design assets are updated.
export const backgrounds = {
  qr: "/backgrounds/qr-screen.png",
  count: "/backgrounds/count-screen.png",
  safeExit: "/backgrounds/safe-exit-screen.png",
  alarm: "/backgrounds/alarm-screen.png",
} as const

export type BackgroundKey = keyof typeof backgrounds
