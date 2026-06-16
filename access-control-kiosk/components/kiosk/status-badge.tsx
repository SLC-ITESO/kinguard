"use client"

// Small dynamic status pill used across kiosk screens.
type Variant = "idle" | "success" | "warning" | "danger" | "info"

const styles: Record<Variant, string> = {
  idle: "bg-white/90 text-[#5b1a8b] ring-[#5b1a8b]/20",
  success: "bg-[#e9f7e2] text-[#3f8a1f] ring-[#3f8a1f]/30",
  warning: "bg-[#fff4d6] text-[#b07a00] ring-[#b07a00]/30",
  danger: "bg-[#ffe1ec] text-[#d3066f] ring-[#d3066f]/30",
  info: "bg-[#efe6fb] text-[#5b1a8b] ring-[#5b1a8b]/30",
}

export function StatusBadge({
  variant = "idle",
  children,
  className = "",
}: {
  variant?: Variant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
