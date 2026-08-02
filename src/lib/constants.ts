import type { QuickFood, UserGoals, UserProfile, StreakData, CalorieTargets, ActivityLevel, Sex, GoalDirection } from './types'

export const DEFAULT_GOALS: UserGoals = {
  calorieGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 250,
  fatGoal: 65,
  waterGoal: 8,
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  sex: 'other',
  age: 30,
  height: 170,
  heightUnit: 'cm',
  weight: 70,
  weightUnit: 'kg',
  unitSystem: 'metric',
  activityLevel: 'moderate',
  goalDirection: 'maintain',
  goalRate: 0.5,
  dietaryPreferences: [],
  allergies: [],
  goals: { ...DEFAULT_GOALS },
  onboardingCompleted: false,
  theme: 'system',
  language: 'en',
  notificationsEnabled: true,
  isPremium: false,
  addExerciseToBudget: false,
  avatarUrl: undefined,
  gdprConsent: false,
  consentedAt: null,
}

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  freezeTokensUsed: 0,
  freezeTokenDate: null,
}

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
}

export const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍿',
}

export const EXERCISE_LABELS: Record<string, string> = {
  walking: 'Walking',
  running: 'Running',
  gym: 'Gym / Weights',
  football: 'Football',
  cycling: 'Cycling',
  swimming: 'Swimming',
  dancing: 'Dancing',
  other: 'Other',
}

export const EXERCISE_EMOJIS: Record<string, string> = {
  walking: '🚶',
  running: '🏃',
  gym: '🏋️',
  football: '⚽',
  cycling: '🚴',
  swimming: '🏊',
  dancing: '💃',
  other: '🎯',
}

export const INTENSITY_LABELS: Record<string, string> = {
  light: 'Light',
  moderate: 'Moderate',
  intense: 'Intense',
}

export const EXERCISE_MET_VALUES: Record<string, Record<string, number>> = {
  walking: { light: 2.5, moderate: 3.5, intense: 5.0 },
  running: { light: 6.0, moderate: 8.0, intense: 10.0 },
  gym: { light: 3.0, moderate: 5.0, intense: 6.0 },
  football: { light: 5.0, moderate: 7.0, intense: 9.0 },
  cycling: { light: 4.0, moderate: 6.0, intense: 8.0 },
  swimming: { light: 5.0, moderate: 7.0, intense: 9.5 },
  dancing: { light: 3.0, moderate: 4.5, intense: 6.5 },
  other: { light: 3.0, moderate: 5.0, intense: 7.0 },
}

export const QUICK_FOODS: QuickFood[] = [
  { name: 'Banana', emoji: '🍌', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, meal: 'snacks' },
  { name: 'Chicken Breast', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, meal: 'lunch' },
  { name: 'White Rice', emoji: '🍚', calories: 206, protein: 4.3, carbs: 45, fat: 0.4, meal: 'lunch' },
  { name: 'Scrambled Eggs', emoji: '🥚', calories: 182, protein: 12, carbs: 2, fat: 14, meal: 'breakfast' },
  { name: 'Greek Yogurt', emoji: '🥛', calories: 130, protein: 17, carbs: 6, fat: 4.5, meal: 'breakfast' },
  { name: 'Protein Shake', emoji: '🥤', calories: 150, protein: 30, carbs: 5, fat: 2, meal: 'snacks' },
  { name: 'Salmon Fillet', emoji: '🐟', calories: 280, protein: 34, carbs: 0, fat: 15, meal: 'dinner' },
  { name: 'Avocado Toast', emoji: '🥑', calories: 290, protein: 7, carbs: 30, fat: 17, meal: 'breakfast' },
  { name: 'Oatmeal', emoji: '🥣', calories: 154, protein: 5.4, carbs: 27, fat: 3.2, meal: 'breakfast' },
  { name: 'Apple', emoji: '🍎', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, meal: 'snacks' },
  { name: 'Mixed Nuts', emoji: '🥜', calories: 173, protein: 5, carbs: 6, fat: 16, meal: 'snacks' },
  { name: 'Sweet Potato', emoji: '🍠', calories: 103, protein: 2.3, carbs: 24, fat: 0.2, meal: 'dinner' },
]

export const ACTIVITY_LEVELS = [
  { value: 'sedentary' as ActivityLevel, label: 'Sedentary', description: 'Little or no exercise', tdeeMultiplier: 1.2 },
  { value: 'light' as ActivityLevel, label: 'Lightly Active', description: '1-3 days per week', tdeeMultiplier: 1.375 },
  { value: 'moderate' as ActivityLevel, label: 'Moderately Active', description: '3-5 days per week', tdeeMultiplier: 1.55 },
  { value: 'very' as ActivityLevel, label: 'Very Active', description: '6-7 days per week', tdeeMultiplier: 1.725 },
  { value: 'super' as ActivityLevel, label: 'Super Active', description: 'Intense daily exercise', tdeeMultiplier: 1.9 },
] as const

const ACTIVITY_ALIASES: Record<string, ActivityLevel> = {
  active: 'very',
  very_active: 'super',
}

export function getActivityLabel(activityLevel: string): string {
  const resolved = ACTIVITY_ALIASES[activityLevel] ?? (activityLevel as ActivityLevel)
  return ACTIVITY_LEVELS.find((a) => a.value === resolved)?.label ?? activityLevel
}

export const GOAL_RATES = [
  { value: 0.25, label: 'Mild', description: '0.25 kg/week', deficit: 275 },
  { value: 0.5, label: 'Moderate', description: '0.5 kg/week', deficit: 550 },
  { value: 0.75, label: 'Aggressive', description: '0.75 kg/week', deficit: 825 },
  { value: 1, label: 'Maximum', description: '1 kg/week', deficit: 1100 },
] as const

export function calculateBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  if (sex === 'male') return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
  if (sex === 'female') return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78)
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const resolved = ACTIVITY_ALIASES[activityLevel] ?? (activityLevel as ActivityLevel)
  const level = ACTIVITY_LEVELS.find((a) => a.value === resolved)
  return Math.round(bmr * (level?.tdeeMultiplier ?? 1.55))
}

export function calculateTargets(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel,
  goalDirection: GoalDirection,
  goalRate: number,
): CalorieTargets {
  const bmr = calculateBMR(sex, weightKg, heightCm, age)
  const tdee = calculateTDEE(bmr, activityLevel)

  let targetCalories: number
  if (goalDirection === 'lose') {
    const deficit = GOAL_RATES.find((r) => r.value === goalRate)?.deficit ?? 550
    targetCalories = Math.max(tdee - deficit, 1200)
  } else if (goalDirection === 'gain') {
    const surplus = GOAL_RATES.find((r) => r.value === goalRate)?.deficit ?? 550
    targetCalories = tdee + surplus
  } else {
    targetCalories = tdee
  }

  const proteinG = Math.round(weightKg * 1.8)
  const fatG = Math.round((targetCalories * 0.25) / 9)
  const carbsG = Math.round((targetCalories - proteinG * 4 - fatG * 9) / 4)

  return {
    bmr,
    tdee,
    targetCalories,
    proteinG: Math.max(proteinG, 50),
    carbsG: Math.max(carbsG, 50),
    fatG: Math.max(fatG, 20),
  }
}

export const NAV_ITEMS = [
  { screen: 'home' as const, label: 'Home', icon: 'LayoutDashboard' },
  { screen: 'diary' as const, label: 'Diary', icon: 'NotebookText' },
  { screen: 'search' as const, label: 'Search', icon: 'Search' },
  { screen: 'progress' as const, label: 'Progress', icon: 'TrendingUp' },
  { screen: 'profile' as const, label: 'Profile', icon: 'User' },
]

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const CIRCUMFERENCE = 2 * Math.PI * 85

export const NIGERIAN_FOODS_FALLBACK: QuickFood[] = [
  { name: 'Jollof Rice', emoji: '🍛', calories: 380, protein: 8, carbs: 65, fat: 10 },
  { name: 'Egusi Soup', emoji: '🥣', calories: 290, protein: 15, carbs: 8, fat: 22 },
  { name: 'Pounded Yam', emoji: '🍠', calories: 210, protein: 2, carbs: 48, fat: 0.5 },
  { name: 'Fried Rice', emoji: '🍚', calories: 360, protein: 9, carbs: 55, fat: 12 },
  { name: 'Beans & Plantain', emoji: '🫘', calories: 340, protein: 14, carbs: 52, fat: 8 },
  { name: 'Grilled Fish', emoji: '🐟', calories: 200, protein: 32, carbs: 0, fat: 8 },
  { name: 'Moi Moi', emoji: '🫘', calories: 180, protein: 12, carbs: 18, fat: 8 },
  { name: 'Suya (Beef)', emoji: '🥩', calories: 250, protein: 28, carbs: 2, fat: 15 },
  { name: 'Akara & Pap', emoji: '🫓', calories: 280, protein: 10, carbs: 35, fat: 12 },
  { name: 'Pepper Soup', emoji: '🍜', calories: 150, protein: 18, carbs: 5, fat: 6 },
]

export const RECENT_FOODS: QuickFood[] = [
  { name: 'Scrambled Eggs', emoji: '🥚', calories: 182, protein: 12, carbs: 2, fat: 14 },
  { name: 'Oatmeal', emoji: '🥣', calories: 154, protein: 5.4, carbs: 27, fat: 3.2 },
  { name: 'Coffee with Milk', emoji: '☕', calories: 30, protein: 1.5, carbs: 3, fat: 1.5 },
]

export const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo',
  'Mediterranean', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher',
] as const

export function generateBarcodeMockName(barcode: string): string | null {
  const mockDb: Record<string, QuickFood> = {
    '4901234567890': { name: 'Soy Sauce', emoji: '🫘', calories: 10, protein: 1, carbs: 1, fat: 0 },
    '5901234567890': { name: 'Coca-Cola 330ml', emoji: '🥤', calories: 139, protein: 0, carbs: 35, fat: 0 },
    '6901234567890': { name: 'Green Tea', emoji: '🫖', calories: 2, protein: 0, carbs: 0, fat: 0 },
    '7891234567890': { name: 'Whole Wheat Bread', emoji: '🍞', calories: 120, protein: 4, carbs: 22, fat: 1.5 },
    '8901234567890': { name: 'Almond Milk', emoji: '🥛', calories: 60, protein: 1, carbs: 8, fat: 2.5 },
  }
  const match = mockDb[barcode]
  return match ? match.name : null
}
