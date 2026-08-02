'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, Flame } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { useToastStore } from '@/store/toastStore'
import {
  EXERCISE_LABELS, EXERCISE_EMOJIS, EXERCISE_MET_VALUES,
  INTENSITY_LABELS,
} from '@/lib/constants'
import type { ExerciseType, Intensity } from '@/lib/types'

interface ExerciseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExerciseModal({ isOpen, onClose }: ExerciseModalProps) {
  const profile = useStore((s) => s.profile)
  const addExerciseEntry = useStore((s) => s.addExerciseEntry)
  const [type, setType] = useState<ExerciseType>('walking')
  const [duration, setDuration] = useState('30')
  const [intensity, setIntensity] = useState<Intensity>('moderate')

  const weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.453592 : profile.weight
  const met = EXERCISE_MET_VALUES[type]?.[intensity] || 3.5
  const durationHrs = (parseFloat(duration) || 0) / 60
  const caloriesBurned = Math.round(met * weightKg * durationHrs)

  const handleSubmit = () => {
    if (!duration || parseFloat(duration) <= 0) return
    addExerciseEntry({ type, duration: parseFloat(duration), intensity, caloriesBurned })
    useToastStore.getState().addToast(`Logged ${EXERCISE_LABELS[type]} — ${caloriesBurned} kcal burned`)
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
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Log Exercise</h2>
              </div>
              <button onClick={onClose} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Activity</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(EXERCISE_LABELS) as [ExerciseType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      className={`flex flex-col items-center gap-1 rounded-xl py-3 px-2 transition-colors ${
                        type === key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-xl">{EXERCISE_EMOJIS[key]}</span>
                      <span className="text-[10px] font-semibold leading-tight text-center">{label.split(' / ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duration (min)</label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    min={1}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Intensity</label>
                  <Select value={intensity} onValueChange={(v) => setIntensity(v as Intensity)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTENSITY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/50 border border-border/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Calories burned</p>
                    <p className="text-xs text-muted-foreground">MET {met} &times; {weightKg.toFixed(0)} kg &times; {durationHrs.toFixed(2)} hrs</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-foreground tabular-nums">{caloriesBurned}</span>
              </div>

              <Button variant="green" size="lg" className="w-full h-12 rounded-2xl" onClick={handleSubmit} disabled={!duration || parseFloat(duration) <= 0}>
                <Dumbbell className="h-4 w-4" />
                Log Exercise
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}