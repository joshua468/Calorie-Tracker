import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Camera, Plus, Minus, Droplets, Dumbbell, Flame, Clock, Sunrise, Sun, Moon, Cookie } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { MEAL_LABELS } from '@/lib/constants'
import type { MealType, FoodEntry } from '@/lib/types'

const MEAL_ICONS: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snacks: Cookie,
}
import { useState, useEffect, useMemo, useRef } from 'react'
import { format } from 'date-fns'
import { CalorieRing } from './CalorieRing'
import HomeHeader from './HomeHeader'

const RING_RADIUS = 85
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

function getWeekDates(date: Date): Date[] {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}



function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = prevRef.current
    if (value === start) return
    prevRef.current = value
    const diff = value - start
    const startTime = performance.now()
    const duration = 700
    function step(timestamp: number) {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return <span className={className}>{display}</span>
}

function MacroBar({ label, consumed, goal, color, unit }: { label: string; consumed: number; goal: number; color: string; unit: string }) {
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          {Math.round(consumed)} / {goal}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

function MealSection({ meal, entries, onAddFood }: { meal: MealType; entries: FoodEntry[]; onAddFood: (meal?: string) => void }) {
  const totalCals = entries.reduce((sum, e) => sum + e.calories * e.servingSize, 0)
  if (entries.length === 0) {
    return (
      <button
        onClick={() => onAddFood(meal)}
        className="flex items-center justify-between w-full px-token-base py-token-md rounded-2xl glass shadow-premium-sm active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 text-foreground/70">{(() => { const Icon = MEAL_ICONS[meal]; return <Icon className="h-5 w-5" /> })()}</span>
          <span className="text-sm font-medium text-foreground">{MEAL_LABELS[meal]}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">Add food</span>
      </button>
    )
  }
  return (
    <div className="rounded-2xl glass shadow-premium-sm overflow-hidden">
      <div className="flex items-center justify-between px-token-base py-token-md">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 text-foreground/70">{(() => { const Icon = MEAL_ICONS[meal]; return <Icon className="h-5 w-5" /> })()}</span>
          <div>
            <span className="text-sm font-semibold text-foreground">{MEAL_LABELS[meal]}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tabular-nums text-foreground">{Math.round(totalCals)}</span>
          <button
            onClick={() => onAddFood(meal)}
            className="h-6 w-6 rounded-lg bg-brand-green/10 flex items-center justify-center active:scale-90 transition-all"
          >
            <Plus className="h-3 w-3 text-brand-green" />
          </button>
        </div>
      </div>
      <div className="px-token-base pb-token-md space-y-1">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2 px-token-md py-2 rounded-xl bg-muted/30">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{entry.name}</p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {entry.servingSize > 1 ? `${entry.servingSize}x ` : ''}
                {Math.round(entry.calories * entry.servingSize)} cal
                {entry.servingUnit ? ` / ${entry.servingUnit}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface HomeScreenProps {
  onAddFood: (meal?: string) => void
  onLogExercise?: () => void
  onViewMeal?: (entryId: string) => void
  onGoToProfile?: () => void
  onNotificationClick?: () => void
}

export function HomeScreen({ onAddFood, onLogExercise, onGoToProfile, onNotificationClick }: HomeScreenProps) {
  const currentDate = useStore((s) => s.currentDate)
  const navigateDate = useStore((s) => s.navigateDate)
  const getEntriesForDate = useStore((s) => s.getEntriesForDate)
  const getExerciseEntriesForDate = useStore((s) => s.getExerciseEntriesForDate)
  const getTotalsForDate = useStore((s) => s.getTotalsForDate)
  const profile = useStore((s) => s.profile)
  const getWaterForDate = useStore((s) => s.getWaterForDate)
  const addWater = useStore((s) => s.addWater)
  const removeWater = useStore((s) => s.removeWater)

  const [water, setWater] = useState(0)

  const todayStr = format(currentDate, 'EEEE, MMMM d')
  const entries = getEntriesForDate(currentDate)
  const exerciseEntries = getExerciseEntriesForDate(currentDate)
  const totals = getTotalsForDate(currentDate)
  const goals = profile.goals

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  useEffect(() => {
    setWater(getWaterForDate(currentDate))
  }, [currentDate, getWaterForDate])

  const meals = useMemo(() => {
    return MEAL_ORDER.reduce(
      (acc, meal) => { acc[meal] = entries.filter((e) => e.meal === meal); return acc },
      {} as Record<MealType, FoodEntry[]>,
    )
  }, [entries])

  const exerciseCalories = exerciseEntries.reduce((s, e) => s + e.caloriesBurned, 0)
  const adjustedGoal = profile.addExerciseToBudget ? goals.calorieGoal + exerciseCalories : goals.calorieGoal
  const remaining = Math.max(0, adjustedGoal - totals.calories)

  const macros = [
    { label: 'Protein', consumed: totals.protein, goal: goals.proteinGoal, color: '#22c55e', unit: 'g' },
    { label: 'Carbs', consumed: totals.carbs, goal: goals.carbsGoal, color: '#f59e0b', unit: 'g' },
    { label: 'Fat', consumed: totals.fat, goal: goals.fatGoal, color: '#3b82f6', unit: 'g' },
  ]

  return (
    <div className="pb-6 space-y-token-xl max-w-lg mx-auto w-full">
      <HomeHeader
        userName={profile.name || 'there'}
        avatarUrl={profile.avatarUrl}
        date={currentDate}
        onProfileClick={onGoToProfile}
        onNotificationClick={onNotificationClick}
      />

      {/* Calendar strip */}
      <div className="px-token-base">
        <div className="flex justify-between">
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <button
                key={i}
                onClick={() => {
                  const diff = Math.round((date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
                  navigateDate(diff)
                }}
                className="flex flex-col items-center gap-0.5 w-[42px] py-2 rounded-xl transition-all active:scale-90"
                style={{
                  background: isToday ? '#1F7A4D' : 'transparent',
                }}
              >
                <span className="text-[11px] font-extrabold" style={{ color: isToday ? '#FFFFFF' : '#5B6B64' }}>
                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                </span>
                <span className="text-[14px] font-bold" style={{ color: isToday ? '#FFFFFF' : '#0E1512' }}>
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Calorie card */}
      <div className="px-token-base">
        <div
          className="rounded-3xl p-5"
          style={{ background: '#1F7A4D' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold tracking-wider text-white/85 uppercase">Calories today</span>
            <span className="text-[11px] font-extrabold tracking-wide text-white uppercase">{remaining.toLocaleString()} left</span>
          </div>

          <div className="flex flex-col items-center mb-[18px]">
            <CalorieRing consumed={totals.calories} goal={goals.calorieGoal} light />
          </div>

          <div className="flex gap-2.5">
            <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-3 py-2.5 backdrop-blur-xl bg-white/12 border border-white/15">
              <div className="w-8 h-8 rounded-full bg-white/22 flex items-center justify-center shrink-0 backdrop-blur-sm">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white leading-tight">{Math.round(totals.calories).toLocaleString()} kcal</div>
                <div className="text-[10.5px] text-white/80 font-semibold">Food</div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-3 py-2.5 backdrop-blur-xl bg-white/12 border border-white/15">
              <div className="w-8 h-8 rounded-full bg-white/22 flex items-center justify-center shrink-0 backdrop-blur-sm">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white leading-tight">{remaining.toLocaleString()} kcal</div>
                <div className="text-[10.5px] text-white/80 font-semibold">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Bars */}
      <div className="px-token-base">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl glass shadow-premium-sm p-token-base space-y-token-md"
        >
          {macros.map((m) => (
            <MacroBar key={m.label} {...m} />
          ))}
        </motion.div>
      </div>

      {/* Water */}
      <div className="px-token-base">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl glass shadow-premium-sm p-token-base"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">Water</span>
              <span className="text-xs text-muted-foreground">{water} / {goals.waterGoal} glasses</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (water > 0) { removeWater(); setWater(w => w - 1) } }}
                disabled={water === 0}
                className="h-7 w-7 rounded-lg border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                onClick={() => { if (water < goals.waterGoal) { addWater(); setWater(w => w + 1) } }}
                disabled={water >= goals.waterGoal}
                className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
              >
                <Plus className="h-3 w-3 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exercise */}
      <div className="px-token-base">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.27 }}
          className="rounded-2xl glass shadow-premium-sm p-token-base"
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-teal-500" />
            <span className="text-sm font-semibold text-foreground">Exercise</span>
            <span className="text-xs text-muted-foreground">
              {exerciseEntries.length > 0
                ? `${exerciseEntries.reduce((s, e) => s + e.duration, 0)} min`
                : 'No activity logged'}
            </span>
          </div>
          {exerciseEntries.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-teal-500" />
                <span className="text-xs font-bold tabular-nums text-foreground">
                  {exerciseEntries.reduce((s, e) => s + e.caloriesBurned, 0)}
                </span>
                <span className="text-[10px] text-muted-foreground">kcal burned</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-bold tabular-nums text-foreground">
                  {exerciseEntries.reduce((s, e) => s + e.duration, 0)}
                </span>
                <span className="text-[10px] text-muted-foreground">min</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Today's Meals */}
      <div className="px-token-base">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-between mb-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground">Meals</h2>
        </motion.div>
        <div className="space-y-2">
          {MEAL_ORDER.map((meal, idx) => (
            <motion.div
              key={meal}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + idx * 0.05 }}
            >
              <MealSection meal={meal} entries={meals[meal]} onAddFood={onAddFood} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="px-token-base pt-1 space-y-2">
        <motion.button
          onClick={() => onAddFood()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full h-[52px] rounded-xl bg-brand-green text-white font-semibold text-base flex items-center justify-center gap-3 active:scale-[0.96]"
        >
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Camera className="h-5 w-5" />
          </div>
          <span>Log a Meal</span>
        </motion.button>

        <motion.button
          onClick={onLogExercise}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full h-[52px] rounded-xl border-2 border-teal-500 text-teal-500 font-semibold text-base flex items-center justify-center gap-3 active:scale-[0.96]"
        >
          <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-teal-500" />
          </div>
          <span>Log Exercise</span>
        </motion.button>
      </div>
    </div>
  )
}
