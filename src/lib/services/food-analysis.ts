import type { DetectedFood } from '@/lib/types'

type ImageSource = File | Blob | string

async function compressToJpegBlob(
  source: ImageSource,
  maxDim = 640,
  quality = 0.7,
): Promise<Blob> {
  let objectUrl: string | null = null
  let bitmap: ImageBitmap | null = null

  try {
    if (source instanceof Blob) {
      objectUrl = URL.createObjectURL(source)
    }

    const decodeViaImg = async (url: string): Promise<HTMLImageElement> => {
      const el = new Image()
      await new Promise<void>((resolve, reject) => {
        el.onload = () => resolve()
        el.onerror = () => reject(new Error('Unable to read this photo'))
        el.src = url
      })
      return el
    }

    const drawAndCompress = async (
      element: CanvasImageSource,
      width: number,
      height: number,
    ): Promise<Blob> => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, maxDim / Math.max(width, height))
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Unable to read this photo')
      ctx.drawImage(element, 0, 0, canvas.width, canvas.height)
      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Unable to compress photo'))), 'image/jpeg', quality)
      })
    }

    if (source instanceof Blob) {
      try {
        bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
        return await drawAndCompress(bitmap, bitmap.width, bitmap.height)
      } catch {
        const el = await decodeViaImg(objectUrl as string)
        return await drawAndCompress(el, el.width, el.height)
      }
    }

    const el = await decodeViaImg(source)
    const scale = Math.min(1, maxDim / Math.max(el.width, el.height))
    if (scale >= 1) return blobFromDataUrl(source)
    return await drawAndCompress(el, el.width, el.height)
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    if (bitmap) bitmap.close()
  }
}

function blobFromDataUrl(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(',')
  const mime = head.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to encode photo'))
    reader.readAsDataURL(blob)
  })
}

export async function analyzeFoodImage(source: ImageSource): Promise<DetectedFood[]> {
  if (!source) {
    throw new Error('Invalid image')
  }

  const blob = await compressToJpegBlob(source)
  const compressed = await blobToDataUrl(blob)
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
