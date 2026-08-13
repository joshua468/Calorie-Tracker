import type { DetectedFood } from '@/lib/types'

async function compressImage(
  dataUrl: string,
  maxDim = 640,
  quality = 0.7,
): Promise<string> {
  const base64ToBlob = (url: string): Blob => {
    const [head, b64] = url.split(',')
    const mime = head.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], { type: mime })
  }

  const drawToCanvas = (source: CanvasImageSource, width: number, height: number) => {
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, maxDim / Math.max(width, height))
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  }

  try {
    const blob = base64ToBlob(dataUrl)
    const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' })
    const result = drawToCanvas(bitmap, bitmap.width, bitmap.height)
    bitmap.close()
    if (result) return result
  } catch {
    /* fall through to legacy path */
  }

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
  if (compressed.length > 4_500_000) {
    throw new Error('Image is too large to analyze. Please try a closer or smaller photo.')
  }
  const body = JSON.stringify({ image: compressed })
  const response = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error(response.ok ? 'Invalid response from server' : `Analysis failed (${response.status})`)
  }

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
