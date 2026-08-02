import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/common/AnimatedNumber'

interface CalorieRingProps {
  consumed: number
  goal: number
  burned?: number
  light?: boolean
}

const CIRCUMFERENCE = 2 * Math.PI * 85

export function CalorieRing({ consumed, goal, burned = 0, light }: CalorieRingProps) {
  const remaining = Math.max(0, goal - consumed + burned)
  const progress = Math.min(consumed / goal, 1)
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE
  const isOver = consumed >= goal

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="transform -rotate-90"
          role="img"
          aria-label={`Calorie progress: ${consumed} of ${goal} calories consumed`}
        >
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={light ? 'rgba(255,255,255,0.2)' : 'hsl(var(--muted))'}
            strokeWidth="10"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={isOver ? '#ef4444' : 'url(#ringGradient)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber
            value={consumed}
            className={cn('text-4xl font-extrabold tracking-tight', light ? 'text-white' : 'text-foreground')}
          />
          <span className={cn('text-[10px] uppercase tracking-[2px] mt-0.5', light ? 'text-white/70' : 'text-muted-foreground')}>
            of {goal}
          </span>
          <span className={cn('text-[10px] uppercase tracking-[1px]', light ? 'text-white/50' : 'text-muted-foreground')}>
            kcal
          </span>
        </div>
      </div>

      {!light && (
        <div className="flex items-center gap-8 mt-4">
          <div className="flex flex-col items-center">
            <span className={cn('text-xl font-bold', remaining > 0 ? 'text-foreground' : 'text-destructive')}>
              <AnimatedNumber value={remaining} />
            </span>
            <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground">Remaining</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-foreground">
              <AnimatedNumber value={burned} />
            </span>
            <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground">Burned</span>
          </div>
        </div>
      )}
    </div>
  )
}
