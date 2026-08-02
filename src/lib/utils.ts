import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MealType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString()
}

export function formatCalories(cal: number): string {
  return `${formatNumber(cal)} cal`
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function getDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getRelativeDayLabel(date: Date): string {
  const today = new Date()
  if (isSameDay(date, today)) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function getMacroColor(type: 'protein' | 'carbs' | 'fat'): string {
  const colors = {
    protein: 'bg-nutrient-protein',
    carbs: 'bg-nutrient-carbs',
    fat: 'bg-nutrient-fat',
  }
  return colors[type]
}

export function getMacroLabelColor(type: 'protein' | 'carbs' | 'fat'): string {
  const colors = {
    protein: 'text-nutrient-protein',
    carbs: 'text-nutrient-carbs',
    fat: 'text-nutrient-fat',
  }
  return colors[type]
}

export function getSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    search: '🔍',
    barcode: '📷',
    photo: '📸',
    quick_add: '✏️',
  }
  return icons[source] || '📝'
}

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    search: 'Searched',
    barcode: 'Scanned',
    photo: 'Photo AI',
    quick_add: 'Quick Add',
  }
  return labels[source] || source
}

export function getDaysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.floor((utcA - utcB) / msPerDay)
}

export function defaultMealByTime(): MealType {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 17 && h < 21) return 'dinner'
  return 'snacks'
}
