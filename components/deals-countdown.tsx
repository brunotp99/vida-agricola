"use client"

import { useEffect, useState } from "react"

function getSecondsUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}

export function DealsCountdown() {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsUntilMidnight())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <span className="text-muted-foreground">Resets in</span>
      <span className="rounded bg-destructive px-2 py-0.5 font-mono text-destructive-foreground">
        {pad(h)}
      </span>
      <span className="text-muted-foreground">:</span>
      <span className="rounded bg-destructive px-2 py-0.5 font-mono text-destructive-foreground">
        {pad(m)}
      </span>
      <span className="text-muted-foreground">:</span>
      <span className="rounded bg-destructive px-2 py-0.5 font-mono text-destructive-foreground">
        {pad(s)}
      </span>
    </div>
  )
}
