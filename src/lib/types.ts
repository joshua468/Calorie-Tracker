export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'
export type LogSource = 'search' | 'barcode' | 'photo' | 'quick_add'
export type ExerciseType = 'walking' | 'running' | 'gym' | 'football' | 'cycling' | 'swimming' | 'dancing' | 'other'
export type Intensity = 'light' | 'moderate' | 'intense'
export type GoalDirection = 'lose' | 'maintain' | 'gain'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'super'
export type Sex = 'male' | 'female' | 'other'
export type AppScreen = 'home' | 'diary' | 'search' | 'progress' | 'profile' | 'camera' | 'analysis' | 'meal-details' | 'history'
export type AuthView = 'login' | 'signup' | 'forgot'

export interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
  servingUnit: string
  meal: MealType
  source: LogSource
  aiConfidence: number | null
  userEdited: boolean
  timestamp: number
}

export interface ExerciseEntry {
  id: string
  type: ExerciseType
  duration: number
  intensity: Intensity
  caloriesBurned: number
  timestamp: number
}

export interface DailyLog {
  dateKey: string
  entries: FoodEntry[]
  waterGlasses: number
}

export interface UserGoals {
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
  waterGoal: number
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  sex: Sex
  age: number
  height: number
  heightUnit: 'cm' | 'ft'
  weight: number
  weightUnit: 'kg' | 'lbs'
  unitSystem: 'metric' | 'imperial'
  activityLevel: ActivityLevel
  goalDirection: GoalDirection
  goalRate: number
  dietaryPreferences: string[]
  allergies: string[]
  goals: UserGoals
  onboardingCompleted: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  notificationsEnabled: boolean
  isPremium: boolean
  addExerciseToBudget: boolean
  avatarUrl?: string
  gdprConsent: boolean
  consentedAt: string | null
}

export interface WeeklyData {
  day: string
  calories: number
  protein: number
  carbs: number
  fat: number
  dateKey: string
}

export interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastLogDate: string | null
  freezeTokensUsed: number
  freezeTokenDate: string | null
}

export interface QuickFood {
  name: string
  emoji: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meal?: MealType
  barcode?: string
}

export interface LogPrompt {
  visible: boolean
  meal?: MealType
}

export interface CalorieTargets {
  bmr: number
  tdee: number
  targetCalories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface DetectedFood {
  id: string
  name: string
  confidence: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  servingSize: string
  servingWeight: number
  vitamins?: { name: string; amount: string; dailyValue: number }[]
  healthScore?: number
}

export interface AiAnalysisResult {
  imageUri: string
  foods: DetectedFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export type HistoryFilter = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'favorites'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  progress: number
  total: number
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface SyncStatus {
  lastSyncedAt: string | null
  isSyncing: boolean
  pendingChanges: boolean
}
