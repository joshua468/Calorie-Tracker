import { create } from 'zustand'
import type { FoodEntry, ExerciseEntry, MealType, UserProfile, AppScreen, NutritionTotals, LogSource, StreakData, SyncStatus, ExerciseType, Intensity } from '@/lib/types'
import { getDateKey, generateId, getDaysBetween } from '@/lib/utils'
import { DEFAULT_GOALS, DEFAULT_STREAK, DEFAULT_PROFILE, calculateTargets } from '@/lib/constants'
import * as storage from '@/lib/storage'
import { supabase } from '@/lib/supabase/client'

interface AddExerciseData {
  type: ExerciseType
  duration: number
  intensity: Intensity
  caloriesBurned: number
}

interface AddEntryData {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meal: MealType
  servingSize?: number
  source?: LogSource
  aiConfidence?: number | null
}

interface AppState {
  screen: AppScreen
  currentDate: Date
  profile: UserProfile
  entries: Record<string, FoodEntry[]>
  exerciseEntries: Record<string, ExerciseEntry[]>
  theme: 'light' | 'dark' | 'system'
  streak: StreakData
  showSavePrompt: boolean
  showGdprConsent: boolean
  syncStatus: SyncStatus
  userId: string | null
  supabaseTablesExist: boolean | undefined

  setScreen: (screen: AppScreen) => void
  setCurrentDate: (date: Date) => void
  navigateDate: (offset: number) => void
  updateProfile: (partial: Partial<UserProfile>) => void
  addEntry: (data: AddEntryData) => void
  addExerciseEntry: (data: AddExerciseData) => void
  deleteEntry: (id: string) => void
  clearDayEntries: (dateKey: string) => void
  clearAllEntries: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setUserId: (userId: string | null) => void
  getEntriesForDate: (date: Date) => FoodEntry[]
  getExerciseEntriesForDate: (date: Date) => ExerciseEntry[]
  getTotalsForDate: (date: Date) => NutritionTotals
  getWaterForDate: (date: Date) => number
  addWater: () => void
  removeWater: () => void
  getWeeklyData: () => Array<{ day: string; calories: number; dateKey: string }>
  recalculateGoals: () => void
  updateStreak: () => void
  dismissSavePrompt: () => void
  acceptGdpr: () => void
  exportData: () => string
  deleteAllData: () => void
  syncToSupabase: (userId: string) => Promise<void>
  loadFromSupabase: (userId: string) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  screen: 'home',
  currentDate: new Date(),
  profile: storage.loadProfile(),
  entries: storage.loadEntries(),
  exerciseEntries: storage.loadExerciseEntries(),
  theme: storage.loadTheme(),
  streak: storage.loadStreak(),
  showSavePrompt: false,
  showGdprConsent: !storage.loadProfile().gdprConsent,
  syncStatus: { lastSyncedAt: null, isSyncing: false, pendingChanges: false },
  userId: null,
  supabaseTablesExist: undefined,

  setScreen: (screen) => set({ screen }),

  setCurrentDate: (date) => set({ currentDate: date }),

  navigateDate: (offset) =>
    set((state) => {
      const d = new Date(state.currentDate)
      d.setDate(d.getDate() + offset)
      return { currentDate: d }
    }),

  updateProfile: (partial) =>
    set((state) => {
      const updated = { ...state.profile, ...partial }
      storage.saveProfile(updated)
      const result: Partial<AppState> = { profile: updated }
      if ('theme' in partial) result.theme = updated.theme
      if (state.userId) {
        setTimeout(() => get().syncToSupabase(state.userId!), 0)
      }
      return result as AppState
    }),

  addEntry: (data) =>
    set((state) => {
      const key = getDateKey(state.currentDate)
      const entry: FoodEntry = {
        id: generateId(),
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        servingSize: data.servingSize ?? 1,
        servingUnit: 'serving',
        meal: data.meal,
        source: data.source ?? 'search',
        aiConfidence: data.aiConfidence ?? null,
        userEdited: data.source === 'photo' ? true : false,
        timestamp: Date.now(),
      }
      const existing = state.entries[key] || []
      const updated = { ...state.entries, [key]: [...existing, entry] }
      storage.saveEntries(updated)

      const needsPrompt = !state.profile.email && !state.showSavePrompt
      const result: Partial<AppState> = { entries: updated, syncStatus: { ...state.syncStatus, pendingChanges: true } }

      if (needsPrompt) {
        result.showSavePrompt = true
      }

      setTimeout(() => get().updateStreak(), 0)
      if (state.userId) {
        get().syncToSupabase(state.userId)
      }

      return result as AppState
    }),

  addExerciseEntry: (data) =>
    set((state) => {
      const key = getDateKey(state.currentDate)
      const entry: ExerciseEntry = {
        id: generateId(),
        type: data.type,
        duration: data.duration,
        intensity: data.intensity,
        caloriesBurned: data.caloriesBurned,
        timestamp: Date.now(),
      }
      const existing = state.exerciseEntries[key] || []
      const updated = { ...state.exerciseEntries, [key]: [...existing, entry] }
      storage.saveExerciseEntries(updated)
      return { exerciseEntries: updated }
    }),

  deleteEntry: (id) =>
    set((state) => {
      const key = getDateKey(state.currentDate)
      const entries = (state.entries[key] || []).filter((e) => e.id !== id)
      const updated = { ...state.entries, [key]: entries }
      if (entries.length === 0) delete updated[key]
      storage.saveEntries(updated)
      if (state.userId) {
        supabase.from('meals').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Failed to delete meal from Supabase:', error)
        })
      }
      return { entries: updated, syncStatus: { ...state.syncStatus, pendingChanges: true } }
    }),

  clearDayEntries: (dateKey) =>
    set((state) => {
      const entryUpdates = { ...state.entries }
      delete entryUpdates[dateKey]
      storage.saveEntries(entryUpdates)
      const exerciseUpdates = { ...state.exerciseEntries }
      delete exerciseUpdates[dateKey]
      storage.saveExerciseEntries(exerciseUpdates)
      return { entries: entryUpdates, exerciseEntries: exerciseUpdates, syncStatus: { ...state.syncStatus, pendingChanges: true } }
    }),

  clearAllEntries: () => {
    storage.saveEntries({})
    storage.saveExerciseEntries({})
    return set({ entries: {}, exerciseEntries: {}, syncStatus: { lastSyncedAt: null, isSyncing: false, pendingChanges: false } })
  },

  setUserId: (userId) => set({ userId }),

  setTheme: (theme) => {
    storage.saveTheme(theme)
    set((state) => {
      const updatedProfile = { ...state.profile, theme }
      storage.saveProfile(updatedProfile)
      return { theme, profile: updatedProfile }
    })
  },

  getEntriesForDate: (date) => {
    const key = getDateKey(date)
    return get().entries[key] || []
  },

  getExerciseEntriesForDate: (date) => {
    const key = getDateKey(date)
    return get().exerciseEntries[key] || []
  },

  getTotalsForDate: (date) => {
    const entries = get().getEntriesForDate(date)
    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories * e.servingSize,
        protein: acc.protein + e.protein * e.servingSize,
        carbs: acc.carbs + e.carbs * e.servingSize,
        fat: acc.fat + e.fat * e.servingSize,
        water: acc.water,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, water: get().getWaterForDate(date) }
    )
    return totals
  },

  getWaterForDate: (date) => {
    const key = getDateKey(date)
    try {
      const raw = localStorage.getItem(`ct_water_${key}`)
      return raw ? parseInt(raw) : 0
    } catch {
      return 0
    }
  },

  addWater: () => {
    const key = getDateKey(get().currentDate)
    const current = get().getWaterForDate(get().currentDate)
    localStorage.setItem(`ct_water_${key}`, String(current + 1))
  },

  removeWater: () => {
    const key = getDateKey(get().currentDate)
    const current = get().getWaterForDate(get().currentDate)
    localStorage.setItem(`ct_water_${key}`, String(Math.max(0, current - 1)))
  },

  getWeeklyData: () => {
    const anchor = get().currentDate
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(anchor)
      d.setDate(anchor.getDate() - (6 - idx))
      const totals = get().getTotalsForDate(d)
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: totals.calories,
        dateKey: getDateKey(d),
      }
    })
  },

  recalculateGoals: () => {
    const p = get().profile
    const targets = calculateTargets(
      p.sex,
      p.weightUnit === 'lbs' ? p.weight * 0.453592 : p.weight,
      p.heightUnit === 'ft' ? p.height * 30.48 : p.height,
      p.age,
      p.activityLevel,
      p.goalDirection,
      p.goalRate,
    )
    const goals = {
      calorieGoal: targets.targetCalories,
      proteinGoal: targets.proteinG,
      carbsGoal: targets.carbsG,
      fatGoal: targets.fatG,
      waterGoal: 8,
    }
    set((state) => {
      const updated = { ...state.profile, goals }
      storage.saveProfile(updated)
      return { profile: updated }
    })
  },

  updateStreak: () => {
    const today = getDateKey(new Date())
    const yesterday = getDateKey(new Date(Date.now() - 86400000))
    const streak = get().streak

    if (streak.lastLogDate === today) return

    const todayEntries = get().entries[today]
    const hasLogs = todayEntries && todayEntries.length > 0

    if (!hasLogs) return

    let newStreak: StreakData

    if (streak.lastLogDate === yesterday) {
      newStreak = {
        ...streak,
        currentStreak: streak.currentStreak + 1,
        longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
        lastLogDate: today,
        freezeTokensUsed: 0,
      }
    } else if (streak.lastLogDate === today) {
      return
    } else {
      const daysMissed = streak.lastLogDate
        ? getDaysBetween(new Date(today + 'T12:00:00'), new Date(streak.lastLogDate + 'T12:00:00')) - 1
        : 0

      if (daysMissed <= 1 && streak.freezeTokensUsed < 2) {
        newStreak = {
          ...streak,
          currentStreak: streak.currentStreak + 1,
          longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
          lastLogDate: today,
          freezeTokensUsed: streak.freezeTokensUsed + 1,
          freezeTokenDate: streak.freezeTokenDate || today,
        }
      } else {
        newStreak = {
          currentStreak: 1,
          longestStreak: streak.longestStreak,
          lastLogDate: today,
          freezeTokensUsed: 0,
          freezeTokenDate: null,
        }
      }
    }

    storage.saveStreak(newStreak)
    set({ streak: newStreak })
  },

  dismissSavePrompt: () => set({ showSavePrompt: false }),

  acceptGdpr: () => {
    const now = new Date().toISOString()
    set((state) => {
      const updated = { ...state.profile, gdprConsent: true, consentedAt: now }
      storage.saveProfile(updated)
      return { profile: updated, showGdprConsent: false }
    })
  },

  exportData: () => storage.exportAllData(),

  deleteAllData: () => {
    storage.clearAllData()
    set({
      entries: {},
      profile: { ...DEFAULT_PROFILE },
      streak: { ...DEFAULT_STREAK },
      showSavePrompt: false,
      syncStatus: { lastSyncedAt: null, isSyncing: false, pendingChanges: false },
      userId: null,
    })
  },

  syncToSupabase: async (userId: string) => {
    const state = get()
    if (state.supabaseTablesExist === false) {
      set({ syncStatus: { ...state.syncStatus, isSyncing: false } })
      return
    }
    set({ syncStatus: { ...state.syncStatus, isSyncing: true } })

    try {
      const entries = state.entries
      const profile = state.profile

      await supabase.from('users').upsert({
        id: userId,
        full_name: profile.name,
        email: profile.email,
        age: profile.age,
        gender: profile.sex,
        height: profile.height,
        weight: profile.weight,
        activity_level: profile.activityLevel,
        avatar_url: profile.avatarUrl,
      })

      for (const [dateKey, meals] of Object.entries(entries)) {
        for (const meal of meals) {
          await supabase.from('meals').upsert({
            id: meal.id,
            user_id: userId,
            meal_name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fat,
            meal_type: meal.meal,
            created_at: new Date(meal.timestamp).toISOString(),
          })
        }
      }

      const now = new Date().toISOString()
      storage.saveSyncTimestamp(now)
      set({ syncStatus: { lastSyncedAt: now, isSyncing: false, pendingChanges: false }, supabaseTablesExist: true })
    } catch (error) {
      console.error('Failed to sync to Supabase:', error)
      set({ syncStatus: { ...get().syncStatus, isSyncing: false }, supabaseTablesExist: false })
    }
  },

  loadFromSupabase: async (userId: string) => {
    set({ syncStatus: { ...get().syncStatus, isSyncing: true } })

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userData) {
        const hasOnboarded = !!(userData.age && userData.gender && userData.height && userData.weight)
        const updatedProfile = {
          ...get().profile,
          name: userData.full_name || get().profile.name,
          email: userData.email || get().profile.email,
          age: userData.age || get().profile.age,
          sex: (userData.gender as any) || get().profile.sex,
          height: userData.height || get().profile.height,
          weight: userData.weight || get().profile.weight,
          activityLevel: (userData.activity_level as any) || get().profile.activityLevel,
          avatarUrl: userData.avatar_url || get().profile.avatarUrl,
          onboardingCompleted: get().profile.onboardingCompleted || hasOnboarded,
        }
        storage.saveProfile(updatedProfile)
        set({ profile: updatedProfile })
      }

      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)

      if (meals && meals.length > 0) {
        const entries: Record<string, FoodEntry[]> = { ...get().entries }
        for (const meal of meals) {
          const dateKey = getDateKey(new Date(meal.created_at))
          const entry: FoodEntry = {
            id: meal.id,
            name: meal.meal_name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fats,
            servingSize: 1,
            servingUnit: 'serving',
            meal: meal.meal_type as MealType,
            source: 'search',
            aiConfidence: null,
            userEdited: false,
            timestamp: new Date(meal.created_at).getTime(),
          }
          if (!entries[dateKey]) entries[dateKey] = []
          entries[dateKey].push(entry)
        }
        storage.saveEntries(entries)
        set({ entries })
      }

      const now = new Date().toISOString()
      storage.saveSyncTimestamp(now)
      set({ syncStatus: { lastSyncedAt: now, isSyncing: false, pendingChanges: false }, supabaseTablesExist: true })
    } catch (error) {
      console.error('Failed to load from Supabase:', error)
      set({ syncStatus: { ...get().syncStatus, isSyncing: false }, supabaseTablesExist: false })
    }
  },
}))
