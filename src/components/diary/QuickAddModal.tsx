import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { MEAL_LABELS } from '@/lib/constants'
import type { MealType } from '@/lib/types'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMeal?: string
}

export function QuickAddModal({ isOpen, onClose, defaultMeal }: QuickAddModalProps) {
  const addEntry = useStore((s) => s.addEntry)
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [meal, setMeal] = useState<MealType>((defaultMeal as MealType) || 'snacks')
  const calRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && defaultMeal) setMeal(defaultMeal as MealType)
    if (isOpen) setTimeout(() => calRef.current?.focus(), 200)
  }, [isOpen, defaultMeal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cal = parseFloat(calories) || 0
    if (cal <= 0) return

    addEntry({
      name: 'Quick Entry',
      calories: cal,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      meal,
      source: 'quick_add',
    })

    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div>
                <h2 className="text-lg font-bold text-foreground">Quick Add</h2>
                <p className="text-xs text-muted-foreground">Just calories and macros — no food name needed</p>
              </div>
              <button onClick={onClose} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Calories *</label>
                <Input
                  ref={calRef}
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g. 250"
                  min={0}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    <span className="text-nutrient-protein">P</span> (g)
                  </label>
                  <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" min={0} step={0.1} className="h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    <span className="text-nutrient-carbs">C</span> (g)
                  </label>
                  <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" min={0} step={0.1} className="h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    <span className="text-nutrient-fat">F</span> (g)
                  </label>
                  <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" min={0} step={0.1} className="h-11" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meal</label>
                <Select value={meal} onValueChange={(v) => setMeal(v as MealType)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEAL_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="green" size="lg" className="w-full h-12 rounded-2xl gap-2" type="submit">
                <Zap className="h-4 w-4" />
                Quick Add
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
