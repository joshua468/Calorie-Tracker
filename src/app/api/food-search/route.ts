import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

interface FoodResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
  servingWeight: number
  source: 'nigerian_foods' | 'spoonacular' | 'usda'
  sourceId?: string
}

const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY || ''
const USDA_KEY = process.env.USDA_API_KEY || ''

async function searchNigerianFoods(q: string): Promise<FoodResult[]> {
  const { data } = await supabase
    .from('nigerian_foods')
    .select('*')
    .ilike('dish_name', `%${q}%`)
    .limit(5)

  return (data || []).map((f: any) => ({
    name: f.dish_name,
    calories: f.calories,
    protein: f.protein_g,
    carbs: f.carbs_g,
    fat: f.fat_g,
    servingSize: `${f.serving_size_g}g`,
    servingWeight: f.serving_size_g,
    source: 'nigerian_foods' as const,
    sourceId: f.id,
  }))
}

async function searchSpoonacular(q: string): Promise<FoodResult[]> {
  if (!SPOONACULAR_KEY) return []

  const searchRes = await fetch(
    `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(q)}&apiKey=${SPOONACULAR_KEY}&number=5`,
    { signal: AbortSignal.timeout(5000) },
  )
  if (!searchRes.ok) return []

  const searchData = await searchRes.json()
  const results: FoodResult[] = []

  for (const item of (searchData.results || []).slice(0, 3)) {
    try {
      const infoRes = await fetch(
        `https://api.spoonacular.com/food/ingredients/${item.id}/information?amount=1&apiKey=${SPOONACULAR_KEY}`,
        { signal: AbortSignal.timeout(3000) },
      )
      if (!infoRes.ok) continue
      const info = await infoRes.json()
      const nutrition = info.nutrition || {}
      const per100 = nutrition.nutrients || []
      const getNutrient = (name: string) =>
        Math.round((per100.find((n: any) => n.name === name)?.amount || 0) * (info.amount || 1) / 100)

      results.push({
        name: item.name,
        calories: getNutrient('Calories'),
        protein: getNutrient('Protein'),
        carbs: getNutrient('Carbohydrates'),
        fat: getNutrient('Fat'),
        servingSize: `${info.amount || 100}g`,
        servingWeight: info.amount || 100,
        source: 'spoonacular',
        sourceId: String(item.id),
      })
    } catch {
      continue
    }
  }

  return results
}

async function searchUsda(q: string): Promise<FoodResult[]> {
  if (!USDA_KEY) return []

  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&api_key=${USDA_KEY}&pageSize=5`,
    { signal: AbortSignal.timeout(5000) },
  )
  if (!res.ok) return []

  const data = await res.json()
  return (data.foods || []).map((f: any) => {
    const nutrients = f.foodNutrients || []
    const getVal = (id: number) => {
      const n = nutrients.find((n: any) => n.nutrientId === id)
      return n ? Math.round((n.value || 0)) : 0
    }

    return {
      name: f.description || 'Unknown Food',
      calories: getVal(1008),
      protein: getVal(1003),
      carbs: getVal(1005),
      fat: getVal(1004),
      servingSize: '100g',
      servingWeight: 100,
      source: 'usda' as const,
      sourceId: String(f.fdcId),
    }
  })
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  if (q.trim().length < 2) {
    return NextResponse.json({ foods: [] })
  }

  const [nigerian, spoonacular, usda] = await Promise.allSettled([
    searchNigerianFoods(q),
    searchSpoonacular(q),
    searchUsda(q),
  ])

  const foods: FoodResult[] = [
    ...(nigerian.status === 'fulfilled' ? nigerian.value : []),
    ...(spoonacular.status === 'fulfilled' ? spoonacular.value : []),
    ...(usda.status === 'fulfilled' ? usda.value : []),
  ]

  const seen = new Set<string>()
  const deduped = foods.filter((f) => {
    const key = f.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return NextResponse.json({ foods: deduped })
}
