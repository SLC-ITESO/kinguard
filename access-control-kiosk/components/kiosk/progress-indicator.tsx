"use client"

// Simple progress bar + text for wristband assignment / exit scanning.
export function ProgressIndicator({
  current,
  total,
  label,
}: {
  current: number
  total: number
  label?: string
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div className="w-full">
      {label ? <p className="mb-2 text-center text-base font-semibold text-[#5b1a8b]">{label}</p> : null}
      <div className="h-4 w-full overflow-hidden rounded-full bg-[#5b1a8b]/15">
        <div
          className="h-full rounded-full bg-[#f5b400] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm font-medium text-[#5b1a8b]/80">
        {current} de {total}
      </p>
    </div>
  )
}
