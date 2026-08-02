import type { DetectedFood } from '@/lib/types'

export async function analyzeFoodImage(imageUri: string): Promise<DetectedFood[]> {
  if (typeof imageUri !== 'string' || !imageUri) {
    throw new Error('Invalid image data')
  }
  const body = JSON.stringify({ image: imageUri })
  const response = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || `Analysis failed (${response.status})`)
  }

  return (data.foods || []).map((f: any, i: number) => ({
    id: `ai-${Date.now()}-${i}`,
    name: f.name || 'Unknown Food',
    confidence: f.confidence || 0,
    calories: f.calories || 0,
    protein: f.protein || 0,
    carbs: f.carbs || 0,
    fat: f.fat || 0,
    fiber: f.fiber || 0,
    sugar: f.sugar || 0,
    sodium: f.sodium || 0,
    servingSize: f.servingSize || '1 serving',
    servingWeight: f.servingWeight || 100,
  }))
}
