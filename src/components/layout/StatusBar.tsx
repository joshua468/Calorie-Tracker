import { useState, useEffect } from 'react'

export function StatusBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      )
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-between px-6 py-1.5 text-[11px] font-semibold text-foreground safe-area-top select-none">
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg className="h-3 w-3.5" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="9" width="3" height="3" rx="0.5" />
          <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg className="h-3 w-3" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          <path d="M4.35 8.85a5.18 5.18 0 017.3 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M1.75 6.25a9.18 9.18 0 0112.5 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-px">
          <div className="relative h-[11px] w-[20px] rounded-[3px] border border-current p-[1.5px]">
            <div className="h-full w-[70%] rounded-[1px] bg-current" />
          </div>
          <div className="h-[5px] w-[1.5px] rounded-r-sm bg-current" />
        </div>
      </div>
    </div>
  )
}
