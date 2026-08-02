import { Snowflake } from 'lucide-react'
import type { StreakData } from '@/lib/types'

interface StreakBadgeProps {
  streak: StreakData
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-brand-green/5 rounded-2xl px-4 py-3 border border-brand-green/10">
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full border-2 border-brand-green flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-brand-green" />
        </div>
        <span className="text-lg font-extrabold tabular-nums text-brand-green">{streak.currentStreak}</span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-1.5">
        <Snowflake className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-muted-foreground">
          {Math.max(0, 2 - (streak.freezeTokensUsed || 0))} freeze{Math.max(0, 2 - (streak.freezeTokensUsed || 0)) === 1 ? '' : 's'} left
        </span>
      </div>
    </div>
  )
}
