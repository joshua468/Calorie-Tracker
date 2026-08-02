'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Search, Camera, Barcode, Zap, Plus, UtensilsCrossed,
  AlertCircle, RefreshCw, ChevronDown, ImageIcon, Loader2,
  CheckCircle2, AlertTriangle, ScanLine, Smartphone,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { useToastStore } from '@/store/toastStore'
import { cn, defaultMealByTime } from '@/lib/utils'
import { MEAL_LABELS, RECENT_FOODS, NIGERIAN_FOODS_FALLBACK, QUICK_FOODS, generateBarcodeMockName } from '@/lib/constants'
import type { MealType, LogSource, QuickFood } from '@/lib/types'

interface FoodSearchResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
  servingWeight: number
  source: 'nigerian_foods' | 'spoonacular' | 'usda'
  sourceId?: string
}

interface AddFoodModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMeal?: string
}

type Tab = 'search' | 'photo' | 'barcode' | 'quick'

const SOURCE_STYLES: Record<string, string> = {
  nigerian_foods: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  spoonacular: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  usda: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const SOURCE_LABELS: Record<string, string> = {
  nigerian_foods: 'Nigerian Foods',
  spoonacular: 'Spoonacular',
  usda: 'USDA',
}

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'search', label: 'Search', icon: Search },
  { key: 'photo', label: 'Photo', icon: Camera },
  { key: 'barcode', label: 'Barcode', icon: Barcode },
  { key: 'quick', label: 'Quick', icon: Zap },
]

export function AddFoodModal({ isOpen, onClose, defaultMeal }: AddFoodModalProps) {
  const addEntry = useStore((s) => s.addEntry)
  const [tab, setTab] = useState<Tab>('search')
  const [meal, setMeal] = useState<MealType>((defaultMeal as MealType) || defaultMealByTime())

  useEffect(() => {
    if (isOpen) {
      setTab('search')
      setMeal((defaultMeal as MealType) || defaultMealByTime())
    }
  }, [isOpen, defaultMeal])

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
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
              <h2 className="text-lg font-bold text-foreground">Add Food</h2>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 px-4 pb-3 shrink-0">
              {TABS.map((t) => {
                const isActive = tab === t.key
                const Icon = t.icon
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors flex-1 justify-center',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                )
              })}
            </div>

            <div className="overflow-y-auto flex-1 px-6 pb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                >
                  {tab === 'search' && (
                    <SearchTab
                      meal={meal}
                      onMealChange={setMeal}
                      onAddEntry={(data) => {
                        addEntry(data)
                        onClose()
                      }}
                    />
                  )}
                  {tab === 'photo' && (
                    <PhotoTab
                      meal={meal}
                      onMealChange={setMeal}
                      onAddEntry={(data) => {
                        addEntry(data)
                      }}
                      onClose={onClose}
                    />
                  )}
                  {tab === 'barcode' && (
                    <BarcodeTab
                      meal={meal}
                      onMealChange={setMeal}
                      onAddEntry={(data) => {
                        addEntry({ ...data, source: 'barcode' })
                        onClose()
                      }}
                    />
                  )}
                  {tab === 'quick' && (
                    <QuickTab
                      meal={meal}
                      onMealChange={setMeal}
                      onAddEntry={(data) => {
                        addEntry({ ...data, name: 'Quick Entry', source: 'quick_add' })
                        onClose()
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ───────── Search Tab ───────── */

function SearchTab({
  meal,
  onMealChange,
  onAddEntry,
}: {
  meal: MealType
  onMealChange: (m: MealType) => void
  onAddEntry: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; servingSize?: number; source?: LogSource }) => void
}) {
  const addEntry = useStore((s) => s.addEntry)
  const getEntriesForDate = useStore((s) => s.getEntriesForDate)
  const todayEntries = getEntriesForDate(new Date())
  const recentEntries = todayEntries.slice(-5).reverse()

  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [servings, setServings] = useState('1')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      setSearchError(null)
      return
    }
    setIsSearching(true)
    setSearchError(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setResults(data.foods || [])
        setShowResults(true)
      } catch {
        setSearchError('Search temporarily unavailable')
        setResults([])
      }
      setIsSearching(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectFood = useCallback((food: FoodSearchResult) => {
    setSelectedFood(food)
    setName(food.name)
    setCalories(String(Math.round(food.calories)))
    setProtein(String(Math.round(food.protein)))
    setCarbs(String(Math.round(food.carbs)))
    setFat(String(Math.round(food.fat)))
    setServings('1')
    setQuery(food.name)
    setShowResults(false)
    setShowManual(false)
  }, [])

  const handleServingsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setServings(value)
    if (selectedFood) {
      const s = parseFloat(value) || 1
      setCalories(String(Math.round(selectedFood.calories * s)))
      setProtein(String(Math.round(selectedFood.protein * s)))
      setCarbs(String(Math.round(selectedFood.carbs * s)))
      setFat(String(Math.round(selectedFood.fat * s)))
    }
  }, [selectedFood])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !calories) return
    onAddEntry({
      name: name.trim(),
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      meal,
      servingSize: parseFloat(servings) || 1,
    })
  }

  const handleQuickLog = (food: QuickFood) => {
    addEntry({
      name: food.name,
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      meal,
    })
    useToastStore.getState().addToast(`Added ${food.name} — ${food.calories} kcal`)
  }

  const showDropdown = showResults && results.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative" ref={resultsRef}>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search Food</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true) }}
            placeholder="Search jollof rice, chicken, egusi..."
            className="pl-9 h-11"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 mt-1 w-full rounded-2xl border border-border bg-card shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {results.map((food, i) => (
              <button
                key={`${food.source}-${food.sourceId || i}`}
                type="button"
                onClick={() => handleSelectFood(food)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{food.name}</span>
                    <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', SOURCE_STYLES[food.source] || '')}>
                      {SOURCE_LABELS[food.source] || food.source}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {food.servingSize} &middot; {Math.round(food.calories)} cal
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] shrink-0" />
              </button>
            ))}
          </motion.div>
        )}

        {!isSearching && query.trim().length >= 2 && results.length === 0 && !searchError && (
          <div className="mt-2 p-3 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              No matches found — try a different name or{' '}
              <button type="button" onClick={() => { setShowManual(true); setName(query); setQuery('') }} className="text-primary underline font-medium">
                enter manually
              </button>
            </p>
          </div>
        )}

        {searchError && (
          <div className="mt-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">{searchError}</p>
            <button type="button" onClick={() => setQuery(query)} className="text-primary text-xs font-medium shrink-0">
              <RefreshCw className="h-3.5 w-3.5 inline mr-1" />
              Retry
            </button>
          </div>
        )}
      </div>

      {!showManual && !selectedFood && query.trim().length < 2 && (
        <div className="space-y-3">
          {recentEntries.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mt-2">
                {recentEntries.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleQuickLog({ name: e.name, calories: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat, emoji: '' })}
                    className="shrink-0 rounded-xl border border-border bg-card px-3.5 py-2 text-left hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground whitespace-nowrap">{e.name}</p>
                    <p className="text-[10px] text-muted-foreground">{e.calories} kcal</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popular</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {NIGERIAN_FOODS_FALLBACK.slice(0, 6).map((food) => (
                <button
                  key={food.name}
                  type="button"
                  onClick={() => handleQuickLog(food)}
                  className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <p className="text-xs font-medium text-foreground">{food.name}</p>
                  <p className="text-[10px] text-muted-foreground">{food.calories} kcal</p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-1">
            <button type="button" onClick={() => setShowManual(true)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              Can't find your food? Enter manually
            </button>
          </div>
        </div>
      )}

      {(showManual || selectedFood) && (
        <>
          <div className="border-t border-border/30 pt-4 space-y-4">
            {showManual && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Food Name</label>
                <div className="relative">
                  <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grilled Chicken"
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>
            )}

            {selectedFood && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <Badge className={cn('text-[10px] px-1.5 py-0', SOURCE_STYLES[selectedFood.source])}>
                  {SOURCE_LABELS[selectedFood.source]}
                </Badge>
                <button type="button" onClick={() => { setSelectedFood(null); setShowManual(true); setName('') }} className="text-xs text-muted-foreground hover:text-foreground underline ml-auto">
                  Change
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Calories</label>
                <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" min={0} required className="h-11" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Servings</label>
                <Input type="number" value={servings} onChange={handleServingsChange} placeholder="1" min={0.1} step={0.1} className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'Protein', className: 'text-nutrient-protein' }, { label: 'Carbs', className: 'text-nutrient-carbs' }, { label: 'Fat', className: 'text-nutrient-fat' }].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    <span className={field.className}>{field.label}</span> (g)
                  </label>
                  <Input
                    type="number"
                    value={field.label === 'Protein' ? protein : field.label === 'Carbs' ? carbs : fat}
                    onChange={(e) => {
                      const v = e.target.value
                      if (field.label === 'Protein') setProtein(v)
                      else if (field.label === 'Carbs') setCarbs(v)
                      else setFat(v)
                    }}
                    placeholder="0" min={0} step={0.1} className="h-11"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meal</label>
              <Select value={meal} onValueChange={(v) => onMealChange(v as MealType)}>
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

          <Button variant="green" size="lg" className="w-full h-12 rounded-2xl" type="submit">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </>
      )}

      {showManual && (
        <div className="text-center pt-1">
          <button type="button" onClick={() => { setShowManual(false); setSelectedFood(null) }} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
            Search instead
          </button>
        </div>
      )}
    </form>
  )
}

/* ───────── Photo Tab ───────── */

function PhotoTab({
  meal,
  onMealChange,
  onAddEntry,
  onClose,
}: {
  meal: MealType
  onMealChange: (m: MealType) => void
  onAddEntry: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; source?: LogSource; aiConfidence?: number }) => void
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'select' | 'analyzing' | 'done' | 'error'>('select')
  const [errorMsg, setErrorMsg] = useState('')
  const [, setLogResult] = useState<{ totalCal: number; meal: string; count: number } | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => { reset(); onClose() }, 1200)
      return () => clearTimeout(t)
    }
  }, [phase, onClose])

  const reset = () => {
    setPhase('select')
    setErrorMsg('')
    setLogResult(null)
  }

  const handleFile = async (file: File) => {
    if (!file) return
    setPhase('analyzing')
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const { analyzeFoodImage } = await import('@/lib/services/food-analysis')
      const foods = await analyzeFoodImage(dataUrl)

      if (!foods || foods.length === 0) {
        setErrorMsg('Could not identify any food in the image. Try again with a clearer photo.')
        setPhase('error')
        return
      }

      let totalCal = 0
      for (const food of foods) {
        onAddEntry({
          name: food.name,
          calories: Math.round(food.calories),
          protein: Math.round(food.protein),
          carbs: Math.round(food.carbs),
          fat: Math.round(food.fat),
          meal: meal || defaultMealByTime(),
          source: 'photo',
          aiConfidence: food.confidence,
        })
        totalCal += Math.round(food.calories)
      }

      const mealLabel = MEAL_LABELS[meal] || meal.charAt(0).toUpperCase() + meal.slice(1)
      setLogResult({ totalCal, meal: mealLabel, count: foods.length })
      useToastStore.getState().addToast(`Logged ${foods.length} item${foods.length > 1 ? 's' : ''} — ${totalCal} kcal`)
      setPhase('done')
    } catch {
      setErrorMsg('Analysis failed. Please try again.')
      setPhase('error')
    }
  }

  return (
    <div className="space-y-4">
      {phase === 'select' && (
        <>
          <div
            onClick={() => uploadRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-12 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">Take or upload a photo</p>
            <p className="text-xs text-muted-foreground mt-1">AI will identify your food</p>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="lg" className="flex-1 h-12 rounded-2xl" onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button type="button" variant="secondary" size="lg" className="flex-1 h-12 rounded-2xl" onClick={() => uploadRef.current?.click()}>
              <ImageIcon className="h-4 w-4" />
              Upload
            </Button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meal</label>
            <Select value={meal} onValueChange={(v) => onMealChange(v as MealType)}>
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
        </>
      )}

      {phase === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-foreground">Identifying your food...</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <p className="text-lg font-bold text-foreground">Logged!</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground text-center mb-4">{errorMsg}</p>
          <Button type="button" variant="secondary" onClick={reset} className="rounded-2xl">
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}

/* ───────── Barcode Tab ───────── */

function BarcodeTab({
  meal,
  onMealChange,
  onAddEntry,
}: {
  meal: MealType
  onMealChange: (m: MealType) => void
  onAddEntry: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; servingSize?: number; source?: LogSource }) => void
}) {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan')
  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [product, setProduct] = useState<{ name: string; calories: number; protein: number; carbs: number; fat: number } | null>(null)
  const [productNameDraft, setProductNameDraft] = useState('')
  const [manualName, setManualName] = useState('')
  const [servings, setServings] = useState('1')

  const handleSearch = () => {
    if (!barcode.trim()) return
    setScanning(true)
    setTimeout(() => {
      const found = QUICK_FOODS.find((f) => f.barcode === barcode.trim())
      if (found) {
        setProduct({ name: found.name, calories: found.calories, protein: found.protein || 0, carbs: found.carbs || 0, fat: found.fat || 0 })
        setProductNameDraft('')
      } else {
        const known = generateBarcodeMockName(barcode)
        setProduct({ name: known || '', calories: 250, protein: 12, carbs: 30, fat: 8 })
        setProductNameDraft('')
      }
      setScanning(false)
    }, 800)
  }

  const handleLogProduct = () => {
    if (!product) return
    const name = product.name.trim() || productNameDraft.trim()
    if (!name) return
    const s = parseFloat(servings) || 1
    onAddEntry({
      name,
      calories: Math.round(product.calories * s),
      protein: Math.round(product.protein * s),
      carbs: Math.round(product.carbs * s),
      fat: Math.round(product.fat * s),
      meal,
      servingSize: s,
    })
  }

  const handleManualLog = () => {
    if (!manualName.trim()) return
    onAddEntry({
      name: manualName.trim(),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meal,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode('scan'); setProduct(null); setProductNameDraft('') }}
          className={cn('flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors', mode === 'scan' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
        >
          <ScanLine className="h-3.5 w-3.5 inline mr-1.5" />
          Scan
        </button>
        <button
          type="button"
          onClick={() => { setMode('manual'); setProduct(null); setProductNameDraft('') }}
          className={cn('flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors', mode === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
        >
          <Smartphone className="h-3.5 w-3.5 inline mr-1.5" />
          Manual Entry
        </button>
      </div>

      {mode === 'scan' && (
        <>
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-10">
            <ScanLine className="h-12 w-12 text-muted-foreground/30 mb-2" />
            {scanning ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Searching product database...</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Enter barcode manually</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/\D/g, '').slice(0, 13))}
              placeholder="Barcode number"
              inputMode="numeric"
              maxLength={13}
              className="h-11 flex-1"
            />
            <Button type="button" variant="green" size="lg" className="h-11 rounded-xl px-4" onClick={handleSearch} disabled={scanning}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {product && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div>
                {product.name ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.calories} cal per serving</p>
                  </>
                ) : (
                  <>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                      Product not recognised — name it to log
                    </label>
                    <Input
                      value={productNameDraft}
                      onChange={(e) => setProductNameDraft(e.target.value)}
                      placeholder="e.g. Milk"
                      className="h-10"
                      autoFocus
                    />
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 p-2">
                  <p className="text-sm font-bold text-nutrient-protein">{product.protein}g</p>
                  <p className="text-[10px] text-muted-foreground">Protein</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2">
                  <p className="text-sm font-bold text-nutrient-carbs">{product.carbs}g</p>
                  <p className="text-[10px] text-muted-foreground">Carbs</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2">
                  <p className="text-sm font-bold text-nutrient-fat">{product.fat}g</p>
                  <p className="text-[10px] text-muted-foreground">Fat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Servings</label>
                  <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} min={0.1} step={0.1} className="h-9" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Meal</label>
                  <Select value={meal} onValueChange={(v) => onMealChange(v as MealType)}>
                    <SelectTrigger className="h-9">
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
              <Button type="button" variant="green" size="lg" className="w-full h-11 rounded-xl" onClick={handleLogProduct} disabled={!product.name && !productNameDraft.trim()}>
                <Plus className="h-4 w-4" />
                Log {product.name || productNameDraft.trim() || 'Product'}
              </Button>
            </div>
          )}

          {!product && !scanning && barcode.trim().length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Product not found?{' '}
              <button type="button" onClick={() => setMode('manual')} className="text-primary underline font-medium">
                Enter manually
              </button>
            </p>
          )}
        </>
      )}

      {mode === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Name</label>
            <Input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. Milk" className="h-11" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meal</label>
            <Select value={meal} onValueChange={(v) => onMealChange(v as MealType)}>
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
          <Button type="button" variant="green" size="lg" className="w-full h-12 rounded-2xl" onClick={handleManualLog} disabled={!manualName.trim()}>
            <Search className="h-4 w-4" />
            Search &amp; Log
          </Button>
        </div>
      )}
    </div>
  )
}

/* ───────── Quick Add Tab ───────── */

function QuickTab({
  meal,
  onMealChange,
  onAddEntry,
}: {
  meal: MealType
  onMealChange: (m: MealType) => void
  onAddEntry: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; source?: LogSource }) => void
}) {
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!calories) return
    onAddEntry({
      name: 'Quick Entry',
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      meal,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">Just calories and macros — no food name needed</p>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Calories</label>
        <Input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          min={0}
          required
          className="h-11"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[{ label: 'P', full: 'Protein', className: 'text-nutrient-protein' }, { label: 'C', full: 'Carbs', className: 'text-nutrient-carbs' }, { label: 'F', full: 'Fat', className: 'text-nutrient-fat' }].map((field) => (
          <div key={field.label}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              <span className={field.className}>{field.label}</span> (g)
            </label>
            <Input
              type="number"
              value={field.label === 'P' ? protein : field.label === 'C' ? carbs : fat}
              onChange={(e) => {
                const v = e.target.value
                if (field.label === 'P') setProtein(v)
                else if (field.label === 'C') setCarbs(v)
                else setFat(v)
              }}
              placeholder="0" min={0} step={0.1} className="h-11"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meal</label>
        <Select value={meal} onValueChange={(v) => onMealChange(v as MealType)}>
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

      <Button variant="green" size="lg" className="w-full h-12 rounded-2xl" type="submit" disabled={!calories}>
        <Zap className="h-4 w-4" />
        Quick Add
      </Button>
    </form>
  )
}