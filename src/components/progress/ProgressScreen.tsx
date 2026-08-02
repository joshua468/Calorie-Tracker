import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { BackButton } from '@/components/ui/back-button'
import { TrendingUp, TrendingDown, Activity, Award, Brain, Plus, Target, Apple, Wheat, Beef, Flame } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

type Period = 'day' | 'week' | 'month'

function computeInsights(
  entries: Record<string, import('@/lib/types').FoodEntry[]>,
  goals: { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatGoal: number },
  getTotalsForDate: (date: Date) => { calories: number; protein: number; carbs: number; fat: number },
  streak: { currentStreak: number },
): string[] {
  const dateKeys = Object.keys(entries).sort()
  if (dateKeys.length < 3) {
    return ['Start logging meals daily to unlock personalised insights.']
  }

  const now = new Date()
  const insights: string[] = []

  const today = getTotalsForDate(now)
  if (today.calories > 0 && today.calories <= goals.calorieGoal * 1.05) {
    insights.push(`You're within ${Math.round(((goals.calorieGoal - today.calories) / goals.calorieGoal) * 100) || Math.round(((today.calories / goals.calorieGoal)) * 100)}% of your calorie goal today. Keep it up!`)
  } else if (today.calories > goals.calorieGoal * 1.1) {
    insights.push(`You're ${Math.round(today.calories - goals.calorieGoal)} kcal over today. A lighter dinner or extra walk can help balance it out.`)
  }

  let proteinHitDays = 0
  let weekendCalories = 0
  let weekdayCalories = 0
  let weekendCount = 0
  let weekdayCount = 0
  const allDays = dateKeys.length

  for (let i = 0; i < Math.min(allDays, 14); i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const totals = getTotalsForDate(d)
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (totals.protein >= goals.proteinGoal * 0.8) proteinHitDays++
    if (isWeekend) { weekendCalories += totals.calories; weekendCount++ }
    else { weekdayCalories += totals.calories; weekdayCount++ }
  }

  if (proteinHitDays >= 5) {
    insights.push("You're consistently hitting your protein goal — great for muscle maintenance.")
  } else if (proteinHitDays >= 2) {
    insights.push(`You hit your protein goal on ${proteinHitDays} of the last ${Math.min(allDays, 14)} days. Try adding eggs or Greek yogurt to breakfast.`)
  }

  const avgWeekend = weekendCount > 0 ? weekendCalories / weekendCount : 0
  const avgWeekday = weekdayCount > 0 ? weekdayCalories / weekdayCount : 0
  if (avgWeekend > avgWeekday * 1.15 && avgWeekend > 0) {
    insights.push(`Your weekend calories average ${Math.round(avgWeekend - avgWeekday)} kcal more than weekdays. Planning meals ahead can help stay on track.`)
  }

  if (streak.currentStreak >= 7) {
    insights.push(`Amazing ${streak.currentStreak}-day streak! Consistency is the biggest factor in reaching your goals.`)
  } else if (streak.currentStreak >= 3) {
    insights.push(`You're on a ${streak.currentStreak}-day streak. Log every day this week to build momentum.`)
  }

  const uniqueFoods = new Set<string>()
  dateKeys.forEach((key) => {
    entries[key]?.forEach((entry) => uniqueFoods.add(entry.name.toLowerCase()))
  })
  if (uniqueFoods.size >= 15) {
    insights.push(`You've tried ${uniqueFoods.size} different foods. Variety helps ensure balanced nutrition.`)
  }

  const latestDays = dateKeys.slice(-7)
  let caloriesIncreasing = 0
  for (let i = 1; i < latestDays.length; i++) {
    const prev = entries[latestDays[i - 1]]?.reduce((s, e) => s + e.calories * e.servingSize, 0) || 0
    const curr = entries[latestDays[i]]?.reduce((s, e) => s + e.calories * e.servingSize, 0) || 0
    if (curr > prev) caloriesIncreasing++
  }
  if (caloriesIncreasing >= 5) {
    insights.push("Your calorie intake has been trending upward this week. Check if portions have increased.")
  }

  if (insights.length === 0) {
    insights.push("Keep logging your meals. After a few more days, you'll start seeing personalised insights here.")
  }

  return insights.slice(0, 5)
}

function PeriodTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
        active
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

export function ProgressScreen() {
  const [period, setPeriod] = useState<Period>('week')
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [insightIndex, setInsightIndex] = useState(0)

  const setScreen = useStore((s) => s.setScreen)
  const getTotalsForDate = useStore((s) => s.getTotalsForDate)
  const getWeeklyData = useStore((s) => s.getWeeklyData)
  const getEntriesForDate = useStore((s) => s.getEntriesForDate)
  const profile = useStore((s) => s.profile)
  const currentDate = useStore((s) => s.currentDate)
  const entries = useStore((s) => s.entries)
  const streak = useStore((s) => s.streak)
  const goals = profile.goals

  const insights = useMemo(() => computeInsights(entries, goals, getTotalsForDate, streak), [entries, goals, getTotalsForDate, streak])

  const safeInsightIndex = insightIndex >= insights.length ? 0 : insightIndex

  const [weightEntries, setWeightEntries] = useState<{ date: string; weight: number }[]>(() => {
    try {
      const stored = localStorage.getItem('ct_weight_entries')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const weeklyData = useMemo(() => getWeeklyData(), [currentDate])

  const chartData = useMemo(() => {
    if (period === 'week') {
      return weeklyData.map((d) => ({
        label: d.day,
        value: d.calories,
        dateKey: d.dateKey,
      }))
    }
    if (period === 'month') {
      const result: { label: string; value: number; dateKey: string }[] = []
      const now = new Date()
      for (let w = 3; w >= 0; w--) {
        let total = 0
        let count = 0
        for (let d = 0; d < 7; d++) {
          const date = new Date(now)
          date.setDate(date.getDate() - (w * 7 + d))
          const totals = getTotalsForDate(date)
          total += totals.calories
          count++
        }
        result.push({
          label: ['This Wk', '1W Ago', '2W Ago', '3W Ago'][w],
          value: Math.round(total / Math.max(count, 1)),
          dateKey: '',
        })
      }
      return result
    }
    const entries = getEntriesForDate(currentDate)
    const meals = [
      { label: 'Breakfast', value: 0, key: 'breakfast' },
      { label: 'Lunch', value: 0, key: 'lunch' },
      { label: 'Dinner', value: 0, key: 'dinner' },
      { label: 'Snacks', value: 0, key: 'snacks' },
    ]
    entries.forEach((e) => {
      const meal = meals.find((m) => m.key === e.meal)
      if (meal) meal.value += e.calories * e.servingSize
    })
    return meals.map((m) => ({ label: m.label, value: Math.round(m.value), dateKey: '' }))
  }, [period, weeklyData, getTotalsForDate, currentDate, getEntriesForDate])

  const weeklyStats = useMemo(() => {
    let totalCal = 0, totalPro = 0, totalCarbs = 0, totalFat = 0, loggedDays = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate)
      d.setDate(currentDate.getDate() - i)
      const entries = getEntriesForDate(d)
      if (entries.length > 0) {
        const t = getTotalsForDate(d)
        totalCal += t.calories
        totalPro += t.protein
        totalCarbs += t.carbs
        totalFat += t.fat
        loggedDays++
      }
    }
    const count = Math.max(loggedDays, 1)
    return {
      avgCalories: Math.round(totalCal / count),
      avgProtein: Math.round(totalPro / count),
      avgCarbs: Math.round(totalCarbs / count),
      avgFat: Math.round(totalFat / count),
    }
  }, [currentDate, getTotalsForDate, getEntriesForDate])

  const todayTotals = useMemo(() => getTotalsForDate(currentDate), [currentDate, getTotalsForDate])

  const achievements = useMemo(() => {
    const dateKeys = Object.keys(entries)
    const hasAnyEntries = dateKeys.length > 0 && dateKeys.some((key) => entries[key].length > 0)

    const currentStreak = streak.currentStreak

    let macroMasterDays = 0
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const totals = getTotalsForDate(d)
      if (
        totals.protein >= goals.proteinGoal * 0.8 &&
        totals.carbs >= goals.carbsGoal * 0.8 &&
        totals.fat >= goals.fatGoal * 0.8
      ) {
        macroMasterDays++
      }
    }

    const uniqueFoods = new Set<string>()
    dateKeys.forEach((key) => {
      entries[key].forEach((entry) => {
        uniqueFoods.add(entry.name.toLowerCase())
      })
    })
    const uniqueCount = uniqueFoods.size

    return [
      { id: 'first-meal', title: 'First Meal', description: 'Log your first meal', icon: '🍽️', unlocked: hasAnyEntries, progress: hasAnyEntries ? 1 : 0, total: 1 },
      { id: '7-day-streak', title: '7-Day Streak', description: 'Log 7 days in a row', icon: '🔥', unlocked: currentStreak >= 7, progress: Math.min(currentStreak, 7), total: 7 },
      { id: '30-day-streak', title: '30-Day Streak', description: 'Log 30 days in a row', icon: '💪', unlocked: currentStreak >= 30, progress: Math.min(currentStreak, 30), total: 30 },
      { id: 'macro-master', title: 'Macro Master', description: 'Hit all macros for a week', icon: '🎯', unlocked: macroMasterDays >= 7, progress: macroMasterDays, total: 7 },
      { id: 'variety-eater', title: 'Variety Eater', description: 'Log 20 different foods', icon: '🌈', unlocked: uniqueCount >= 20, progress: Math.min(uniqueCount, 20), total: 20 },
    ]
  }, [entries, streak, getTotalsForDate, goals])

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1)
  const avgChartValue = chartData.reduce((s, d) => s + d.value, 0) / Math.max(chartData.length, 1)
  const todayKey = new Date().toISOString().split('T')[0].replace(/-/g, '-')

  const totalMacros = todayTotals.protein + todayTotals.carbs + todayTotals.fat
  const hasMacroData = totalMacros > 0
  const proteinPct = hasMacroData ? Math.round((todayTotals.protein / totalMacros) * 100) : 0
  const carbsPct = hasMacroData ? Math.round((todayTotals.carbs / totalMacros) * 100) : 0
  const fatPct = hasMacroData ? Math.round((todayTotals.fat / totalMacros) * 100) : 0

  const donutR = 70
  const donutCirc = 2 * Math.PI * donutR
    const pLen = (proteinPct / 100) * donutCirc
  const cLen = (carbsPct / 100) * donutCirc
  const fLen = (fatPct / 100) * donutCirc

  const donutStrokeWidth = 24

  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0
  const prevWeight = weightEntries.length > 1 ? weightEntries[weightEntries.length - 2].weight : 0
  const weightChange = latestWeight - prevWeight
  const isLoss = weightChange < 0
  const hasWeightChange = weightEntries.length >= 2

  const weightPoints = weightEntries.slice(-7)
  const weightSvgPath = useMemo(() => {
    if (weightPoints.length < 2) return ''
    const values = weightPoints.map((e) => e.weight)
    const minW = Math.min(...values)
    const maxW = Math.max(...values)
    const range = maxW - minW || 1
    const pad = range * 0.15
    const w = 180, h = 56
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w
        const y = h - ((v - (minW - pad)) / (range + 2 * pad)) * h
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [weightEntries])

  const handleAddWeight = () => {
    if (!weightInput) return
    const w = parseFloat(weightInput)
    if (isNaN(w) || w <= 0) return
    const entry = { date: new Date().toISOString().split('T')[0], weight: w }
    const updated = [...weightEntries, entry]
    setWeightEntries(updated)
    localStorage.setItem('ct_weight_entries', JSON.stringify(updated))
    setWeightInput('')
    setShowWeightInput(false)
  }

  const rotateInsight = () => {
    setInsightIndex((prev) => (prev + 1) % insights.length)
  }

  const barMaxHeight = 160

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 p-5 pb-8"
    >
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col pt-1"
      >
        <BackButton onClick={() => setScreen('home')} />
        <h1 className="text-2xl font-bold text-foreground mt-5">Progress</h1>
        <p className="text-sm text-muted-foreground mt-1">Your trends and goals</p>
      </motion.div>

      {/* 2. Period Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex gap-1.5 p-1.5 bg-muted/60 rounded-full w-fit shadow-sm"
      >
        <PeriodTab label="Day" active={period === 'day'} onClick={() => setPeriod('day')} />
        <PeriodTab label="Week" active={period === 'week'} onClick={() => setPeriod('week')} />
        <PeriodTab label="Month" active={period === 'month'} onClick={() => setPeriod('month')} />
      </motion.div>

      {/* 3. Calorie Trend Chart — redesigned */}
      <motion.div
        key={period}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-3xl border border-border/60 shadow-premium overflow-hidden"
      >
        <div className="px-6 pt-6 pb-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {period === 'day' ? "Today's Meals" : period === 'week' ? 'Daily Calories' : 'Weekly Average'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-extrabold text-foreground tabular-nums">
                  {formatNumber(Math.round(avgChartValue))}
                </span>
                <span className="text-xs font-medium text-muted-foreground">kcal avg</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                Goal: {formatNumber(goals.calorieGoal)}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2">
          <div className="relative">
            {/* SVG chart area */}
            <svg
              viewBox={`0 0 ${chartData.length * 60} 180`}
              className="w-full h-44"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="todayBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
                </linearGradient>
              </defs>

              {/* Goal line */}
              <line
                x1="0" y1={180 - (goals.calorieGoal / (maxChartValue * 1.15)) * 150 - 15}
                x2={chartData.length * 60}
                y2={180 - (goals.calorieGoal / (maxChartValue * 1.15)) * 150 - 15}
                stroke="hsl(var(--primary) / 0.3)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x={chartData.length * 60 - 4}
                y={180 - (goals.calorieGoal / (maxChartValue * 1.15)) * 150 - 18}
                textAnchor="end"
                fill="hsl(var(--primary) / 0.5)"
                fontSize="8"
                fontWeight="600"
              >
                goal
              </text>

              {/* Area fill path */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                d={`M${chartData.map((d, i) => {
                  const x = i * 60 + 30
                  const y = 180 - (d.value / (maxChartValue * 1.15)) * 150 - 15
                  return `${i === 0 ? 'M' : 'L'}${x},${y}`
                }).join(' ')}L${(chartData.length - 1) * 60 + 30},180 L30,180 Z`}
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                d={chartData.map((d, i) => {
                  const x = i * 60 + 30
                  const y = 180 - (d.value / (maxChartValue * 1.15)) * 150 - 15
                  return `${i === 0 ? 'M' : 'L'}${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots + Bars */}
              {chartData.map((d, i) => {
                const x = i * 60 + 30
                const rawY = (d.value / (maxChartValue * 1.15)) * 150
                const y = 180 - rawY - 15
                const isToday =
                  d.dateKey ===
                  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                const barHeight = Math.max(rawY, 2)
                return (
                  <g key={i}>
                    {/* Bar */}
                    <motion.rect
                      x={x - 8}
                      y={y - 15 + barHeight}
                      width={16}
                      height={0}
                      animate={{ height: barHeight, y: y - 15 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      rx={8}
                      fill={isToday ? 'url(#todayBarGrad)' : 'hsl(var(--primary) / 0.12)'}
                    />
                    {/* Dot */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={d.value > 0 ? 4 : 0}
                      initial={{ r: 0 }}
                      animate={{ r: d.value > 0 ? 4 : 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                      fill={isToday ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)'}
                      stroke="hsl(var(--card))"
                      strokeWidth="2"
                    />
                    {/* Value label */}
                    {d.value > 0 && (
                      <motion.text
                        x={x}
                        y={y - 14}
                        textAnchor="middle"
                        fill="hsl(var(--muted-foreground))"
                        fontSize="8"
                        fontWeight="700"
                        fontFamily="ui-monospace, monospace"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + i * 0.06 }}
                      >
                        {formatNumber(d.value)}
                      </motion.text>
                    )}
                    {/* Day label */}
                    <text
                      x={x}
                      y={180 - 2}
                      textAnchor="middle"
                      fill={isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      fontSize="9"
                      fontWeight={isToday ? '700' : '500'}
                    >
                      {d.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </motion.div>

      {/* 4. Macro Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-2xl border border-border/60 shadow-premium p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Macro Balance
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg viewBox="0 0 200 200" className="w-56 h-56 -rotate-90">
              <defs>
                <linearGradient id="donutProtein" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="donutCarbs" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="donutFat" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r={donutR} fill="none" stroke="hsl(var(--muted))" strokeWidth={donutStrokeWidth} />
              {pLen > 0 && (
                <motion.circle
                  cx="100" cy="100" r={donutR}
                  fill="none"
                  stroke="url(#donutProtein)"
                  strokeWidth={donutStrokeWidth}
                  strokeLinecap="butt"
                  strokeDasharray={`${pLen} ${donutCirc - pLen}`}
                  initial={{ strokeDashoffset: donutCirc }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {cLen > 0 && (
                <motion.circle
                  cx="100" cy="100" r={donutR}
                  fill="none"
                  stroke="url(#donutCarbs)"
                  strokeWidth={donutStrokeWidth}
                  strokeLinecap="butt"
                  strokeDasharray={`${cLen} ${donutCirc - cLen}`}
                  initial={{ strokeDashoffset: donutCirc }}
                  animate={{ strokeDashoffset: -pLen }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                />
              )}
              {fLen > 0 && (
                <motion.circle
                  cx="100" cy="100" r={donutR}
                  fill="none"
                  stroke="url(#donutFat)"
                  strokeWidth={donutStrokeWidth}
                  strokeLinecap="butt"
                  strokeDasharray={`${fLen} ${donutCirc - fLen}`}
                  initial={{ strokeDashoffset: donutCirc }}
                  animate={{ strokeDashoffset: -(pLen + cLen) }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-foreground tabular-nums">
                {totalMacros > 0 ? Math.round(todayTotals.protein + todayTotals.carbs + todayTotals.fat) : '--'}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">total g</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium tabular-nums text-foreground">{formatNumber(todayTotals.protein)}g</span>
              <span className="text-[10px] text-muted-foreground">Protein</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium tabular-nums text-foreground">{formatNumber(todayTotals.carbs)}g</span>
              <span className="text-[10px] text-muted-foreground">Carbs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-medium tabular-nums text-foreground">{formatNumber(todayTotals.fat)}g</span>
              <span className="text-[10px] text-muted-foreground">Fat</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 gap-4"
      >
        {[
          { label: 'Avg Calories', value: formatNumber(weeklyStats.avgCalories), suffix: 'kcal', icon: Flame, color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
          { label: 'Avg Protein', value: formatNumber(weeklyStats.avgProtein), suffix: 'g', icon: Beef, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Avg Carbs', value: formatNumber(weeklyStats.avgCarbs), suffix: 'g', icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Avg Fat', value: formatNumber(weeklyStats.avgFat), suffix: 'g', icon: Apple, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'bg-card rounded-2xl border shadow-premium-sm p-4 flex flex-col gap-2',
                stat.border
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn('p-2 rounded-xl', stat.bg)}>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">7-day avg</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className={cn('text-3xl font-extrabold tabular-nums', stat.color)}>{stat.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{stat.suffix}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Section Divider */}
      <div className="h-px bg-border/50 mx-1" />

      {/* 6. Weight Tracking Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-2xl border border-border/60 shadow-premium p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Weight</span>
          </div>
          <button
            onClick={() => setShowWeightInput(!showWeightInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Weight
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground tabular-nums">
                {latestWeight > 0 ? latestWeight.toFixed(1) : '--'}
              </span>
              <span className="text-sm font-medium text-muted-foreground">{profile.weightUnit}</span>
            </div>
            {weightEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground mt-1.5">Log your first weigh-in to start tracking your trend</p>
            ) : hasWeightChange ? (
              <div className={cn('flex items-center gap-1 mt-1', isLoss ? 'text-emerald-500' : 'text-rose-500')}>
                {isLoss ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                <span className="text-xs font-bold tabular-nums">
                  {Math.abs(weightChange).toFixed(1)} {profile.weightUnit}
                </span>
                <span className="text-[10px] text-muted-foreground">from last week</span>
              </div>
            ) : null}
          </div>

          {weightPoints.length >= 2 && weightSvgPath && (
            <div className="flex-1">
              <svg viewBox="0 0 180 56" className="w-full h-14">
                <defs>
                  <linearGradient id="weightLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                  </linearGradient>
                </defs>
                <path
                  d={weightSvgPath}
                  fill="none"
                  stroke="url(#weightLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={weightSvgPath.split(' ').filter((s) => s.startsWith('L') || s.startsWith('M')).pop()?.replace(/[ML]/g, '').split(',')[0] || '170'}
                  cy={weightSvgPath.split(' ').filter((s) => s.startsWith('L') || s.startsWith('M')).pop()?.replace(/[ML]/g, '').split(',')[1] || '28'}
                  r="3.5"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--card))"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showWeightInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-border/50 flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
                  placeholder={`Enter weight (${profile.weightUnit})`}
                  className="flex-1 h-10 px-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 tabular-nums"
                  autoFocus
                />
                <button
                  onClick={handleAddWeight}
                  disabled={!weightInput || parseFloat(weightInput) <= 0}
                  className="px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Section Divider */}
      <div className="h-px bg-border/50 mx-1" />

      {/* 7. Achievement Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 mb-3 px-1">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Achievements</span>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {achievements.map((badge, i) => {
            const pct = Math.round((badge.progress / badge.total) * 100)
            const circ = 2 * Math.PI * 28
            const offset = circ - (pct / 100) * circ
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'flex flex-col items-center gap-3 min-w-[110px] p-5 rounded-2xl border shadow-premium-sm',
                  badge.unlocked
                    ? 'bg-card border-border/60'
                    : 'bg-muted/30 border-border/30'
                )}
              >
                <div className="relative">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle
                      cx="36" cy="36" r="28"
                      fill="none"
                      stroke={badge.unlocked ? 'hsl(var(--muted))' : 'hsl(var(--muted) / 0.5)'}
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="36" cy="36" r="28"
                      fill="none"
                      stroke={badge.unlocked ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1, delay: 0.6 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">
                    {badge.icon}
                  </span>
                </div>
                <span className={cn(
                  'text-[11px] font-bold text-center leading-tight',
                  badge.unlocked ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {badge.title}
                </span>
                <span className={cn(
                  'text-[9px] font-medium',
                  badge.unlocked ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {badge.unlocked ? 'Unlocked' : `${badge.progress}/${badge.total}`}
                </span>
              </motion.div>
            )
          })}
        </div>
        <div className="absolute -right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
      </motion.div>

      {/* Section Divider */}
      <div className="h-px bg-border/50 mx-1" />

      {/* 8. AI Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-gradient-to-br from-primary/5 via-card to-primary/5 rounded-2xl border border-primary/10 shadow-premium p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Insights</span>
          </div>
          <button
            onClick={rotateInsight}
            className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Next Tip
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={safeInsightIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm font-bold text-primary">{safeInsightIndex + 1}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {insights[safeInsightIndex]}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setInsightIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === safeInsightIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40'
              )}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
