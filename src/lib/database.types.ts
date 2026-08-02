export interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  age: number | null
  gender: string | null
  height: number | null
  weight: number | null
  activity_level: string | null
  created_at: string
}

export interface UserUpdate {
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
  age?: number | null
  gender?: string | null
  height?: number | null
  weight?: number | null
  activity_level?: string | null
}

export interface MealRow {
  id: string
  user_id: string
  meal_name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  meal_type: string
  created_at: string
}

export interface MealInsert {
  id?: string
  user_id: string
  meal_name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  meal_type: string
  created_at?: string
}

export interface GoalRow {
  id: string
  user_id: string
  goal_type: string
  target_weight: number | null
  target_calories: number | null
  created_at: string
}

export interface GoalInsert {
  id?: string
  user_id: string
  goal_type: string
  target_weight?: number | null
  target_calories?: number | null
  created_at?: string
}

export interface ExerciseRow {
  id: string
  user_id: string
  exercise_name: string
  calories_burned: number
  duration: number
  created_at: string
}

export interface ExerciseInsert {
  id?: string
  user_id: string
  exercise_name: string
  calories_burned: number
  duration: number
  created_at?: string
}

export interface WaterIntakeRow {
  id: string
  user_id: string
  glasses: number
  created_at: string
}

export interface WaterIntakeInsert {
  id?: string
  user_id: string
  glasses: number
  created_at?: string
}

export interface WeightLogRow {
  id: string
  user_id: string
  weight: number
  created_at: string
}

export interface WeightLogInsert {
  id?: string
  user_id: string
  weight: number
  created_at?: string
}

export interface NotificationRow {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface NotificationInsert {
  id?: string
  user_id: string
  type: string
  title: string
  body: string
  read?: boolean
  created_at?: string
}
