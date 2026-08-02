import type { FoodEntry, ExerciseEntry, UserGoals, UserProfile, StreakData } from './types'
import { DEFAULT_GOALS, DEFAULT_PROFILE, DEFAULT_STREAK } from './constants'

const KEYS = {
  entries: 'ct_entries',
  exerciseEntries: 'ct_exercise_entries',
  profile: 'ct_profile',
  goals: 'ct_goals',
  theme: 'ct_theme',
  streak: 'ct_streak',
} as const

export function loadEntries(): Record<string, FoodEntry[]> {
  try {
    const raw = localStorage.getItem(KEYS.entries)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveEntries(entries: Record<string, FoodEntry[]>): void {
  localStorage.setItem(KEYS.entries, JSON.stringify(entries))
}

export function loadExerciseEntries(): Record<string, ExerciseEntry[]> {
  try {
    const raw = localStorage.getItem(KEYS.exerciseEntries)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveExerciseEntries(entries: Record<string, ExerciseEntry[]>): void {
  localStorage.setItem(KEYS.exerciseEntries, JSON.stringify(entries))
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.profile)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_PROFILE, ...parsed, goals: { ...DEFAULT_GOALS, ...(parsed.goals || {}) } }
    }
  } catch {}
  return { ...DEFAULT_PROFILE }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export function loadGoals(): UserGoals {
  try {
    const raw = localStorage.getItem(KEYS.goals)
    if (raw) return { ...DEFAULT_GOALS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_GOALS }
}

export function saveGoals(goals: UserGoals): void {
  localStorage.setItem(KEYS.goals, JSON.stringify(goals))
}

export function loadTheme(): 'light' | 'dark' | 'system' {
  try {
    const val = localStorage.getItem(KEYS.theme)
    if (val === 'light' || val === 'dark' || val === 'system') return val
  } catch {}
  return 'system'
}

export function saveTheme(theme: 'light' | 'dark' | 'system'): void {
  localStorage.setItem(KEYS.theme, theme)
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(KEYS.streak)
    if (raw) return { ...DEFAULT_STREAK, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_STREAK }
}

export function saveStreak(streak: StreakData): void {
  localStorage.setItem(KEYS.streak, JSON.stringify(streak))
}

export function saveSyncTimestamp(timestamp: string): void {
  localStorage.setItem('ct_sync_timestamp', timestamp)
}

export function loadSyncTimestamp(): string | null {
  return localStorage.getItem('ct_sync_timestamp')
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem('ct_sync_timestamp')
  localStorage.removeItem('ct_data_version')
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith('ct_water_')) keysToRemove.push(k)
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  Object.values(KEYS).forEach((key) => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) data[key] = JSON.parse(raw)
    } catch {}
  })
  const syncTs = loadSyncTimestamp()
  if (syncTs) data.syncTimestamp = syncTs
  return JSON.stringify(data, null, 2)
}
