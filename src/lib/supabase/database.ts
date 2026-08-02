import { supabase } from './client'
import type {
  MealRow,
  MealInsert,
  GoalRow,
  GoalInsert,
  ExerciseRow,
  ExerciseInsert,
  WaterIntakeRow,
  WaterIntakeInsert,
  WeightLogRow,
  WeightLogInsert,
  NotificationRow,
  NotificationInsert,
  UserUpdate,
} from '@/lib/database.types'

export const databaseService = {
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateUser(userId: string, updates: UserUpdate) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
    if (error) throw error
  },

  async getMeals(userId: string, date?: string): Promise<MealRow[]> {
    let query = supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (date) {
      const startOfDay = `${date}T00:00:00Z`
      const endOfDay = `${date}T23:59:59Z`
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createMeal(meal: MealInsert): Promise<MealRow> {
    const { data, error } = await supabase
      .from('meals')
      .insert(meal)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateMeal(id: string, updates: Partial<MealInsert>) {
    const { error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async deleteMeal(id: string) {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getGoals(userId: string): Promise<GoalRow[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createGoal(goal: GoalInsert): Promise<GoalRow> {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateGoal(id: string, updates: Partial<GoalInsert>) {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async getExercises(userId: string, date?: string): Promise<ExerciseRow[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (date) {
      const startOfDay = `${date}T00:00:00Z`
      const endOfDay = `${date}T23:59:59Z`
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createExercise(exercise: ExerciseInsert): Promise<ExerciseRow> {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteExercise(id: string) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getWaterIntake(userId: string, date: string): Promise<WaterIntakeRow | null> {
    const startOfDay = `${date}T00:00:00Z`
    const endOfDay = `${date}T23:59:59Z`
    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async upsertWaterIntake(water: WaterIntakeInsert): Promise<WaterIntakeRow> {
    const { data, error } = await supabase
      .from('water_intake')
      .insert(water)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWaterIntake(id: string, updates: Partial<WaterIntakeInsert>) {
    const { error } = await supabase
      .from('water_intake')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async getWeightLogs(userId: string): Promise<WeightLogRow[]> {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createWeightLog(log: WeightLogInsert): Promise<WeightLogRow> {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert(log)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getNotifications(userId: string): Promise<NotificationRow[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createNotification(notification: NotificationInsert): Promise<NotificationRow> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async markNotificationRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
    if (error) throw error
  },

  async markAllNotificationsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    if (error) throw error
  },
}
