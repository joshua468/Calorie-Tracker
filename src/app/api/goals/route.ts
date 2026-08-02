// API route — app/api/goals/route.ts
// Next.js-style API route for goal calculation
// In Next.js this would be a serverless function

import { calculateTargets } from '@/lib/constants'
import type { Sex, ActivityLevel, GoalDirection } from '@/lib/types'

import { NextRequest, NextResponse } from 'next/server'

export interface GoalsRequest {
  sex: Sex
  weightKg: number
  heightCm: number
  age: number
  activityLevel: ActivityLevel
  goalDirection: GoalDirection
  goalRate: number
}

export interface GoalsResponse {
  bmr: number
  tdee: number
  targetCalories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export function calculateGoalsResponse(req: GoalsRequest): GoalsResponse {
  return calculateTargets(
    req.sex,
    req.weightKg,
    req.heightCm,
    req.age,
    req.activityLevel,
    req.goalDirection,
    req.goalRate,
  )
}

export async function POST(request: NextRequest) {
  try {
    const req = await request.json()
    const res = calculateGoalsResponse(req)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid request' }, { status: 400 })
  }
}
