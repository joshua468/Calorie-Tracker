import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { WaterTracker } from '@/components/common/WaterTracker'
import { CalorieRing } from '@/components/home/CalorieRing'
import { MacroBars } from '@/components/home/MacroBars'
import { StreakBadge } from '@/components/common/StreakBadge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Plus, Trash2 } from 'lucide-react'
import { cn, getSourceIcon, getSourceLabel } from '@/lib/utils'
import { MEAL_LABELS, MEAL_EMOJIS } from '@/lib/constants'
import type { MealType, FoodEntry } from '@/lib/types'

const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

const mealDotColors: Record<MealType, string> = {
  breakfast: 'bg-amber-400',
  lunch: 'bg-emerald-400',
  dinner: 'bg-green-400',
  snacks: 'bg-rose-400',
}

interface DiaryScreenProps {
  onGoToSearch: () => void
}

export function DiaryScreen({ onGoToSearch }: DiaryScreenProps) {
  const currentDate = useStore((s) => s.currentDate)
  const getEntriesForDate = useStore((s) => s.getEntriesForDate)
  const getTotalsForDate = useStore((s) => s.getTotalsForDate)
  const deleteEntry = useStore((s) => s.deleteEntry)
  const setScreen = useStore((s) => s.setScreen)
  const profile = useStore((s) => s.profile)
  const streak = useStore((s) => s.streak)

  const entries = getEntriesForDate(currentDate)
  const totals = getTotalsForDate(currentDate)
  const goals = profile.goals

  const getMealEntries = (meal: MealType) => entries.filter((e) => e.meal === meal)

  return (
    <div className="space-y-4 p-4 pb-8 animate-fade-in">
      <div className="flex flex-col pt-1">
        <BackButton onClick={() => setScreen('home')} />
        <h1 className="text-2xl font-bold text-foreground mt-5">Diary</h1>
        <p className="text-sm text-muted-foreground mt-1">Your daily meals</p>
      </div>
      <StreakBadge streak={streak} />

      <Card>
        <CardContent className="pt-5">
          <CalorieRing consumed={totals.calories} goal={goals.calorieGoal} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <MacroBars
            protein={{ consumed: totals.protein, goal: goals.proteinGoal }}
            carbs={{ consumed: totals.carbs, goal: goals.carbsGoal }}
            fat={{ consumed: totals.fat, goal: goals.fatGoal }}
          />
        </CardContent>
      </Card>

      <WaterTracker />

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        <Button variant="green" size="sm" onClick={onGoToSearch} className="h-9 rounded-xl gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Add Food
        </Button>
      </div>

      <div className="space-y-3">
        {meals.map((meal) => {
          const mealEntries = getMealEntries(meal)
          const mealCalories = mealEntries.reduce((s, e) => s + e.calories * e.servingSize, 0)

          return (
            <Card key={meal} className="overflow-hidden">
              <div className={cn(
                'flex items-center justify-between px-5 pt-4 pb-3',
                meal === 'breakfast' && 'bg-amber-50/50 dark:bg-amber-950/20',
                meal === 'lunch' && 'bg-emerald-50/50 dark:bg-emerald-950/20',
                meal === 'dinner' && 'bg-green-50/50 dark:bg-green-950/20',
                meal === 'snacks' && 'bg-rose-50/50 dark:bg-rose-950/20',
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{MEAL_EMOJIS[meal]}</span>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{MEAL_LABELS[meal]}</h3>
                    <span className="text-xs text-muted-foreground tabular-nums">{Math.round(mealCalories)} cal</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={onGoToSearch} className="h-8 rounded-lg text-xs px-2">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <CardContent className="pt-3 pb-4">
                {mealEntries.length === 0 ? (
                  <EmptyState title={`No ${MEAL_LABELS[meal].toLowerCase()} logged`} className="py-6" />
                ) : (
                  <div className="space-y-1">
                    {mealEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
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
                            onClick={() => deleteEntry(entry.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            aria-label={`Delete ${entry.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
