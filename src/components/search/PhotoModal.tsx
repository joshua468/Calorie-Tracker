import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, Image, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { useToastStore } from '@/store/toastStore'
import { MEAL_LABELS } from '@/lib/constants'
import { analyzeFoodImage } from '@/lib/services/food-analysis'
import type { MealType } from '@/lib/types'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMeal?: string
}

export function PhotoModal({ isOpen, onClose, defaultMeal }: PhotoModalProps) {
  const addEntry = useStore((s) => s.addEntry)
  const [phase, setPhase] = useState<'select' | 'analyzing' | 'done' | 'error'>('select')
  const defaultMealByTime = (): MealType => {
    const h = new Date().getHours()
    if (h >= 5 && h < 11) return 'breakfast'
    if (h >= 11 && h < 15) return 'lunch'
    if (h >= 17 && h < 21) return 'dinner'
    return 'snacks'
  }
  const [meal, setMeal] = useState<MealType>((defaultMeal as MealType) || defaultMealByTime())
  const [error, setError] = useState<string | null>(null)
  const [loggedCount, setLoggedCount] = useState(0)
  const [totalCal, setTotalCal] = useState(0)
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setPhase('select')
    setError(null)
    setLoggedCount(0)
    setTotalCal(0)
    if (cameraRef.current) cameraRef.current.value = ''
    if (uploadRef.current) uploadRef.current.value = ''
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhase('analyzing')
    setError(null)

    try {
      const detectedFoods = await analyzeFoodImage(file)
      if (detectedFoods.length === 0) throw new Error('No food detected in this image')

      let totalKcal = 0
      detectedFoods.forEach((food) => {
        addEntry({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          meal,
          source: 'photo',
          aiConfidence: food.confidence,
        })
        totalKcal += food.calories
      })

      setLoggedCount(detectedFoods.length)
      setTotalCal(Math.round(totalKcal))
      setPhase('done')

      const names = detectedFoods.map((f) => f.name).join(', ')
      const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1)
      useToastStore.getState().addToast(
        `Logged ${names} to ${mealLabel} — ${Math.round(totalKcal)} kcal`
      )

      setTimeout(() => {
        reset()
        onClose()
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setPhase('error')
    }
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
            onClick={() => { reset(); onClose() }}
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
                <h2 className="text-lg font-bold text-foreground">Log a Meal</h2>
                <p className="text-xs text-muted-foreground">
                  {phase === 'select' && 'Take or upload a photo of your meal'}
                  {phase === 'analyzing' && 'AI is analyzing your food...'}
                  {phase === 'done' && `Logged ${loggedCount} item${loggedCount > 1 ? 's' : ''}`}
                  {phase === 'error' && 'Something went wrong'}
                </p>
              </div>
              <button onClick={() => { reset(); onClose() }} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-4">
              {phase === 'select' && (
                <div className="space-y-4">
                  <div
                    onClick={() => uploadRef.current?.click()}
                    className="aspect-[4/3] rounded-2xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Image className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">Upload a photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Or tap to browse</p>
                  </div>
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFile}
                    className="hidden"
                  />
                  <input
                    ref={uploadRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl gap-2" onClick={() => cameraRef.current?.click()}>
                      <Camera className="h-4 w-4" />
                      Camera
                    </Button>
                    <Button variant="outline" className="flex-1 h-11 rounded-xl gap-2" onClick={() => uploadRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
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
                </div>
              )}

              {phase === 'analyzing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Identifying your food...</p>
                </div>
              )}

              {phase === 'done' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-foreground">Logged!</p>
                  <p className="text-sm text-muted-foreground mt-1">{totalCal} kcal added to {meal}</p>
                </div>
              )}

              {phase === 'error' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">{error}</p>
                  <Button variant="outline" className="rounded-xl" onClick={reset}>
                    Try again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
