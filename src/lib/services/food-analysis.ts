import type { DetectedFood } from '@/lib/types'

async function compressImage(
  dataUrl: string,
  maxDim = 1024,
  quality = 0.8,
): Promise<string> {
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('decode failed'))
      img.src = dataUrl
    })
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
    if (scale >= 1) return dataUrl

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return dataUrl
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return dataUrl
  }
}

export async function analyzeFoodImage(imageUri: string): Promise<DetectedFood[]> {
  if (typeof imageUri !== 'string' || !imageUri) {
    throw new Error('Invalid image data')
  }
  const compressed = await compressImage(imageUri)
  const body = JSON.stringify({ image: compressed })
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
