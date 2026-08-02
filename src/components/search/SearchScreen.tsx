import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Barcode, Camera, Zap, Clock, TrendingUp, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/common/EmptyState'
import { useStore } from '@/store/useStore'
import { RECENT_FOODS, NIGERIAN_FOODS_FALLBACK } from '@/lib/constants'
import { supabase } from '@/lib/supabase/client'
import type { QuickFood, MealType, LogSource } from '@/lib/types'

interface SearchScreenProps {
  onAddFood: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; source?: LogSource }) => void
  onOpenModal?: (meal?: string) => void
}

export function SearchScreen({ onAddFood, onOpenModal }: SearchScreenProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<QuickFood[]>([])
  const [popularFoods, setPopularFoods] = useState<QuickFood[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const setScreen = useStore((s) => s.setScreen)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadFoods = async () => {
      try {
        const { data } = await supabase
          .from('nigerian_foods')
          .select('dish_name, calories, protein_g, carbs_g, fat_g, emoji')
          .order('dish_name')
          .limit(10)
        if (data && data.length > 0) {
          setPopularFoods(
            data.map((f) => ({
              name: f.dish_name,
              emoji: f.emoji || '🍽️',
              calories: f.calories,
              protein: f.protein_g,
              carbs: f.carbs_g,
              fat: f.fat_g,
            }))
          )
        } else {
          setPopularFoods(NIGERIAN_FOODS_FALLBACK)
        }
      } catch {
        setPopularFoods(NIGERIAN_FOODS_FALLBACK)
      }
    }
    loadFoods()
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value.trim().length < 2) {
      setIsSearching(false)
      setResults([])
      return
    }
    setIsSearching(true)
    const q = value.toLowerCase()
    const filtered = popularFoods.filter(
      (f) => f.name.toLowerCase().includes(q)
    )
    setTimeout(() => {
      setResults(filtered)
      setIsSearching(false)
    }, 150)
  }, [popularFoods])

  const handleQuickAdd = (food: QuickFood) => {
    onAddFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      meal: food.meal || 'snacks',
      source: 'search',
    })
  }

  const isShowingResults = query.trim().length >= 2

  return (
    <div className="space-y-4 p-4 pb-8 animate-fade-in">
      <div className="flex flex-col pt-1">
        <BackButton onClick={() => setScreen('home')} />
        <h1 className="text-2xl font-bold text-foreground mt-5">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">Find and log foods</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search food database..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-base rounded-2xl"
          aria-label="Search foods"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsSearching(false) }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        <Button variant="outline" size="sm" onClick={() => onOpenModal?.()} className="rounded-xl gap-1.5 h-9 shrink-0">
          <Barcode className="h-3.5 w-3.5" />
          Barcode
        </Button>
        <Button variant="outline" size="sm" onClick={() => onOpenModal?.()} className="rounded-xl gap-1.5 h-9 shrink-0">
          <Camera className="h-3.5 w-3.5" />
          Photo
        </Button>
        <Button variant="outline" size="sm" onClick={() => onOpenModal?.()} className="rounded-xl gap-1.5 h-9 shrink-0">
          <Zap className="h-3.5 w-3.5" />
          Quick Add
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isShowingResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {results.length === 0 && !isSearching ? (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No results found"
                description="Try a different search term"
              />
            ) : (
              <ScrollArea className="h-[calc(100dvh-280px)]">
                <div className="space-y-2 pr-2">
                  {results.map((food, i) => (
                    <motion.div
                      key={food.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => handleQuickAdd(food)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(food)}
                    >
                      <span className="text-2xl">{food.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{food.name}</p>
                        <div className="flex gap-1.5 mt-1">
                          <Badge variant="protein" className="text-[10px] px-1.5 py-0">{Math.round(food.protein)}g P</Badge>
                          <Badge variant="carbs" className="text-[10px] px-1.5 py-0">{Math.round(food.carbs)}g C</Badge>
                          <Badge variant="fat" className="text-[10px] px-1.5 py-0">{Math.round(food.fat)}g F</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tabular-nums text-foreground">{food.calories}</span>
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Recent
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 relative">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {RECENT_FOODS.map((food) => (
                    <button
                      key={food.name}
                      onClick={() => handleQuickAdd(food)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-lg">{food.emoji}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{food.name}</p>
                        <span className="text-[10px] text-muted-foreground">{food.calories} cal</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Popular
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {popularFoods.slice(0, 8).map((food) => (
                    <button
                      key={food.name}
                      onClick={() => handleQuickAdd(food)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-left border border-border/30"
                    >
                      <span className="text-xl">{food.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{food.name}</p>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{food.calories} cal</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
