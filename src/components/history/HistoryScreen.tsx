import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Search, Clock, Star, UtensilsCrossed, Heart, Image, Sparkles, X, Plus } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { cn, formatNumber } from '@/lib/utils'
import { MEAL_LABELS, MEAL_EMOJIS } from '@/lib/constants'
import type { HistoryFilter, FoodEntry, MealType } from '@/lib/types'
import { format } from 'date-fns'

interface HistoryScreenProps {
  onViewMeal?: (entryId: string) => void
}

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
  { key: 'favorites', label: 'Favorites' },
]

function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem('ct_favorites')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(ids: string[]): void {
  localStorage.setItem('ct_favorites', JSON.stringify(ids))
}

function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'h:mm a')
}

export function HistoryScreen({ onViewMeal }: HistoryScreenProps) {
  const entries = useStore((s) => s.entries)
  const calorieGoal = useStore((s) => s.profile.goals.calorieGoal)
  const setScreen = useStore((s) => s.setScreen)

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all')
  const [favorites, setFavoritesState] = useState<string[]>(getFavorites)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef(0)
  const scrollTopRef = useRef(0)
  const refreshThreshold = 80

  useEffect(() => {
    setFavoritesState(getFavorites())
    const handler = () => setFavoritesState(getFavorites())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const sortedDateKeys = useMemo(() => {
    return Object.keys(entries).sort((a, b) => b.localeCompare(a))
  }, [entries])

  const timelineData = useMemo(() => {
    const favs = favorites
    return sortedDateKeys
      .map((dateKey) => {
        let dayEntries = entries[dateKey] || []

        if (search.trim()) {
          const q = search.toLowerCase()
          dayEntries = dayEntries.filter((e) =>
            e.name.toLowerCase().includes(q)
          )
        }

        if (activeFilter !== 'all' && activeFilter !== 'favorites') {
          dayEntries = dayEntries.filter((e) => e.meal === activeFilter)
        }

        if (activeFilter === 'favorites') {
          dayEntries = dayEntries.filter((e) => favs.includes(e.id))
        }

        if (dayEntries.length === 0) return null

        const sorted = [...dayEntries].sort((a, b) => a.timestamp - b.timestamp)

        const mealOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']
        const grouped: { meal: MealType; entries: FoodEntry[] }[] = []
        for (const meal of mealOrder) {
          const mealEntries = sorted.filter((e) => e.meal === meal)
          if (mealEntries.length > 0) {
            grouped.push({ meal, entries: mealEntries })
          }
        }

        const dayTotal = sorted.reduce((sum, e) => sum + e.calories * e.servingSize, 0)

        return { dateKey, total: dayTotal, meals: grouped }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
  }, [sortedDateKeys, entries, search, activeFilter, favorites])

  const handleToggleFavorite = useCallback((entryId: string) => {
    const favs = getFavorites()
    const idx = favs.indexOf(entryId)
    if (idx >= 0) {
      favs.splice(idx, 1)
    } else {
      favs.push(entryId)
    }
    saveFavorites(favs)
    setFavoritesState([...favs])
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    scrollTopRef.current = listRef.current?.scrollTop ?? 0
    if (scrollTopRef.current <= 0) {
      touchStartRef.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || refreshing) return
    const diff = e.touches[0].clientY - touchStartRef.current
    if (diff > 0 && scrollTopRef.current <= 0) {
      setPullDistance(Math.min(diff * 0.35, refreshThreshold * 1.5))
    }
  }, [isPulling, refreshing])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= refreshThreshold) {
      setRefreshing(true)
      setPullDistance(0)
      setTimeout(() => setRefreshing(false), 1400)
    } else {
      setPullDistance(0)
    }
    setIsPulling(false)
  }, [pullDistance])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <BackButton onClick={() => setScreen('home')} />
          <h1 className="text-[32px] font-bold text-foreground leading-tight tracking-tight mt-5">History</h1>
          <p className="text-[13px] text-muted-foreground leading-tight mt-1">Your meal timeline</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[52px] pl-12 pr-10 rounded-2xl bg-muted/60 border border-border/50 text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 focus:bg-muted/80 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 active:scale-90 transition-all"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </motion.div>
      </div>

      {/* Filter Pills */}
      <div className="relative px-5 pb-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-3 overflow-x-auto no-scrollbar pr-8"
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  'shrink-0 h-10 px-5 rounded-xl text-[13px] font-medium transition-all active:scale-95 min-w-[72px]',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted/80 border border-border/30'
                )}
              >
                {f.key === 'favorites' && (
                  <Heart className={cn(
                    'h-4 w-4 inline mr-1.5 -mt-0.5',
                    isActive && 'fill-white'
                  )} />
                )}
                {f.label}
              </button>
            )
          })}
        </motion.div>
        <div className="absolute right-4 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Timeline */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {(pullDistance > 0 || refreshing) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: refreshing ? 56 : Math.max(pullDistance, 0),
                opacity: 1,
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                <Clock className={cn('h-5 w-5', refreshing ? 'text-primary' : 'text-muted-foreground')} />
              </motion.div>
              <span className="ml-2.5 text-sm font-medium text-muted-foreground">
                {refreshing ? 'Refreshing...' : pullDistance >= refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {timelineData.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-24 px-6"
            >
              <div className="h-28 w-28 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No meals logged</h3>
              <p className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">
                {search
                  ? 'Try a different search term'
                  : activeFilter !== 'all'
                    ? 'No meals match this filter'
                    : 'Your logged meals will appear here'}
              </p>
              <button
                onClick={() => setScreen('diary')}
                className="mt-6 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-all shadow-sm shadow-primary/20 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Log your first meal
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {timelineData.map((day, dayIdx) => (
                <motion.div
                  key={day.dateKey}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: dayIdx * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="pb-1.5 pt-0 -mx-4 px-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">
                        {format(new Date(day.dateKey + 'T12:00:00'), 'MMMM d, yyyy')}
                      </h2>
                      <span className="text-[13px] font-bold tabular-nums text-foreground">
                        {formatNumber(day.total)} <span className="text-[10px] text-muted-foreground font-medium">cal</span>
                      </span>
                    </div>
                  </div>

                  {/* Meal groups */}
                  <div className="space-y-2.5">
                    {day.meals.map((mealGroup, mealIdx) => {
                      const mealTotal = mealGroup.entries.reduce(
                        (s, e) => s + Math.round(e.calories * e.servingSize), 0
                      )
                      return (
                        <motion.div
                          key={mealGroup.meal}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: mealIdx * 0.04,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="rounded-2xl bg-card shadow-premium-sm border border-border/50 overflow-hidden"
                        >
                          {/* Meal header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{MEAL_EMOJIS[mealGroup.meal]}</span>
                              <div>
                                <h3 className="text-[13px] font-semibold text-foreground leading-tight">
                                  {MEAL_LABELS[mealGroup.meal]}
                                </h3>
                                <span className="text-[10px] text-muted-foreground tabular-nums font-medium leading-tight">
                                  {mealTotal} cal
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Food items */}
                          <div className="divide-y divide-border/10">
                            {mealGroup.entries.map((entry, foodIdx) => {
                              const isFav = favorites.includes(entry.id)
                              return (
                                <motion.div
                                  key={entry.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2, delay: foodIdx * 0.02 }}
                                  onClick={() => onViewMeal?.(entry.id)}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group cursor-pointer active:scale-[0.99]"
                                >
                                  {/* Thumbnail */}
                                  <div className="shrink-0">
                                    {entry.source === 'photo' ? (
                                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center border border-primary/10">
                                        <Image className="h-5 w-5 text-primary" />
                                      </div>
                                    ) : (
                                      <div className="h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center">
                                        <span className="text-[10px] font-bold tabular-nums text-muted-foreground/60">
                                          {Math.round(entry.calories * entry.servingSize)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-[14px] font-medium text-foreground truncate leading-tight">
                                        {entry.name}
                                      </p>
                                      {entry.source === 'photo' && (
                                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                                      )}
                                      {entry.aiConfidence !== null && entry.aiConfidence < 70 && (
                                        <span className="text-[9px] text-amber-500 font-medium shrink-0 bg-amber-500/10 px-1 rounded">Est.</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">
                                        P {Math.round(entry.protein * entry.servingSize)}g
                                      </span>
                                      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">
                                        C {Math.round(entry.carbs * entry.servingSize)}g
                                      </span>
                                      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">
                                        F {Math.round(entry.fat * entry.servingSize)}g
                                      </span>
                                      {entry.servingSize !== 1 && (
                                        <>
                                          <span className="text-muted-foreground/30">|</span>
                                          <span className="text-[10px] text-muted-foreground">×{entry.servingSize}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                                        {formatTime(entry.timestamp)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Calories + Favorite */}
                                  <div className="flex items-center gap-1.5">
                                    <div className="text-right">
                                      <span className="text-[15px] font-bold tabular-nums text-foreground leading-none block">
                                        {Math.round(entry.calories * entry.servingSize)}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground font-medium">cal</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggleFavorite(entry.id)
                                      }}
                                      className={cn(
                                        'h-8 w-8 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0',
                                        isFav
                                          ? 'bg-amber-500/10 text-amber-500'
                                          : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10'
                                      )}
                                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                      <Star className={cn('h-4 w-4', isFav && 'fill-amber-500')} />
                                    </button>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
