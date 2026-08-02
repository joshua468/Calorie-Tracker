import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Sunrise, Sun, Moon, Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { cn, getSourceIcon, getSourceLabel } from '@/lib/utils'
import { MEAL_LABELS } from '@/lib/constants'
import type { FoodEntry, MealType } from '@/lib/types'

const MEAL_ICONS: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snacks: Cookie,
}

interface MealSectionProps {
  meal: MealType
  entries: FoodEntry[]
  onAddEntry: () => void
  onDeleteEntry: (id: string) => void
}

const mealColors: Record<MealType, string> = {
  breakfast: 'bg-amber-50 dark:bg-amber-950/20',
  lunch: 'bg-emerald-50 dark:bg-emerald-950/20',
  dinner: 'bg-green-50 dark:bg-green-950/20',
  snacks: 'bg-rose-50 dark:bg-rose-950/20',
}

const mealDotColors: Record<MealType, string> = {
  breakfast: 'bg-amber-400',
  lunch: 'bg-emerald-400',
  dinner: 'bg-green-400',
  snacks: 'bg-rose-400',
}

export function MealSection({ meal, entries, onAddEntry, onDeleteEntry }: MealSectionProps) {
  const totalCals = entries.reduce((sum, e) => sum + e.calories * e.servingSize, 0)

  return (
    <Card className="overflow-hidden">
      <div className={cn('flex items-center justify-between px-5 pt-4 pb-3', mealColors[meal])}>
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 text-foreground/70">{(() => { const Icon = MEAL_ICONS[meal]; return <Icon className="h-5 w-5" /> })()}</span>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{MEAL_LABELS[meal]}</h3>
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.round(totalCals)} cal
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddEntry} className="h-8 rounded-lg gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <CardContent className="pt-3 pb-4">
        {entries.length === 0 ? (
          <EmptyState
            title={`No ${MEAL_LABELS[meal].toLowerCase()} yet`}
            description="Tap Add to log your food"
            className="py-6"
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-1.5">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors group"
                >
                  <span className={cn('h-2 w-2 rounded-full shrink-0', mealDotColors[meal])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0" title={getSourceLabel(entry.source)}>
                        {getSourceIcon(entry.source)}
                      </span>
                      {entry.aiConfidence !== null && entry.aiConfidence < 70 && (
                        <span className="text-[9px] text-amber-500 font-medium shrink-0">Est.</span>
                      )}
                    </div>
                    {entry.servingSize !== 1 && (
                      <p className="text-[11px] text-muted-foreground">×{entry.servingSize}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      P {Math.round(entry.protein * entry.servingSize)}g · C {Math.round(entry.carbs * entry.servingSize)}g · F {Math.round(entry.fat * entry.servingSize)}g
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {Math.round(entry.calories * entry.servingSize)}
                      <span className="text-[10px] font-normal text-muted-foreground ml-0.5">cal</span>
                    </span>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      aria-label={`Delete ${entry.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
