import { motion } from 'framer-motion'
import { cn, clamp } from '@/lib/utils'

interface MacroBarProps {
  label: string
  consumed: number
  goal: number
  color: 'protein' | 'carbs' | 'fat'
  unit?: string
}

const colorMap = {
  protein: {
    dot: 'bg-nutrient-protein',
    bar: 'bg-gradient-to-r from-nutrient-protein to-emerald-400',
    shadow: 'shadow-nutrient-protein/20',
  },
  carbs: {
    dot: 'bg-nutrient-carbs',
    bar: 'bg-gradient-to-r from-nutrient-carbs to-amber-300',
    shadow: 'shadow-nutrient-carbs/20',
  },
  fat: {
    dot: 'bg-nutrient-fat',
    bar: 'bg-gradient-to-r from-nutrient-fat to-rose-400',
    shadow: 'shadow-nutrient-fat/20',
  },
}

function MacroBar({ label, consumed, goal, color, unit = 'g' }: MacroBarProps) {
  const pct = clamp((consumed / (goal || 1)) * 100, 0, 100)
  const colors = colorMap[color]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
        <span className="text-sm font-medium text-foreground flex-1">{label}</span>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          <span className="text-foreground">{Math.round(consumed)}</span> / {goal}{unit}
        </span>
      </div>
      <div className="macro-bar-track">
        <motion.div
          className={cn('macro-bar-fill', colors.bar, colors.shadow)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

interface MacroBarsProps {
  protein: { consumed: number; goal: number }
  carbs: { consumed: number; goal: number }
  fat: { consumed: number; goal: number }
  className?: string
}

export function MacroBars({ protein, carbs, fat, className }: MacroBarsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <MacroBar label="Protein" consumed={protein.consumed} goal={protein.goal} color="protein" />
      <MacroBar label="Carbs" consumed={carbs.consumed} goal={carbs.goal} color="carbs" />
      <MacroBar label="Fat" consumed={fat.consumed} goal={fat.goal} color="fat" />
    </div>
  )
}
