import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { MEAL_LABELS, MEAL_EMOJIS } from '@/lib/constants'
import { useStore } from '@/store/useStore'
import type { FoodEntry } from '@/lib/types'
import { useMemo } from 'react'

interface MealDetailsScreenProps {
  entryId?: string
  onBack: () => void
}

export function MealDetailsScreen({ entryId, onBack }: MealDetailsScreenProps) {
  const entries = useStore((s) => s.entries)
  const currentDate = useStore((s) => s.currentDate)

  const entry: FoodEntry | null = useMemo(() => {
    if (entryId) {
      const dateKey = currentDate.toISOString().slice(0, 10)
      const dayEntries = entries[dateKey] || []
      return dayEntries.find((e) => e.id === entryId) || null
    }
    return null
  }, [entryId, entries, currentDate])

  if (!entry) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 pt-4">
          <button onClick={onBack} className="h-10 w-10 rounded-xl border border-border flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Entry not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-xl border border-border flex items-center justify-center active:scale-90 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">{entry.name}</h1>
          <p className="text-xs text-muted-foreground">
            {MEAL_EMOJIS[entry.meal]} {MEAL_LABELS[entry.meal]}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ios-scroll px-4 pb-6 space-y-4">
        {/* Calorie hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10 p-6 text-center"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Calories</p>
          <p className="text-5xl font-extrabold text-foreground">
            {Math.round(entry.calories * entry.servingSize)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            per {entry.servingUnit || 'serving'}
          </p>
        </motion.div>

        {/* Macro breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border/50 shadow-premium-sm p-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-3">Macros</h3>
          <div className="space-y-3">
            {[
              { label: 'Protein', value: entry.protein * entry.servingSize, color: 'bg-nutrient-protein', unit: 'g' },
              { label: 'Carbs', value: entry.carbs * entry.servingSize, color: 'bg-nutrient-carbs', unit: 'g' },
              { label: 'Fat', value: entry.fat * entry.servingSize, color: 'bg-nutrient-fat', unit: 'g' },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {Math.round(m.value)}{m.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${m.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((m.value / 100) * 100, 100)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Serving info */}
        {entry.servingSize && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-border/50 shadow-premium-sm p-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-2">Serving</h3>
            <p className="text-sm text-foreground">
              {entry.servingSize > 1 ? `${entry.servingSize}x ` : ''}
              {entry.servingUnit || 'serving'}
            </p>
          </motion.div>
        )}

        {/* Source info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-card border border-border/50 shadow-premium-sm p-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground mb-2">Source</h3>
          <p className="text-sm text-foreground capitalize">{entry.source?.replace('_', ' ') || 'Manual'}</p>
          {entry.aiConfidence && (
            <p className="text-xs text-muted-foreground mt-1">
              AI Confidence: {entry.aiConfidence}%
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
