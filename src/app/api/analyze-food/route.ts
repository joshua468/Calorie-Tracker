import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

function extractBase64(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) throw new Error('Invalid image data URL')
  return { mimeType: match[1], data: match[2] }
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided', foods: [] }, { status: 400 })
    }

    const { mimeType, data } = extractBase64(image)

    const geminiResponse = await Promise.race([
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: 'You are a professional nutritionist AI. Analyze the food in this image and return accurate nutritional data. For each food item detected, provide: name (specific dish/food name), confidence (0-100, how sure you are), calories (kcal per serving), protein (grams), carbs (grams), fat (grams), fiber (grams), sugar (grams), sodium (mg), servingSize (descriptive like "1 cup" or "6 oz"), servingWeight (grams). Be precise with calorie and macro estimates. Only return valid JSON array — no markdown, no explanation. Example format: [{"name":"Grilled Chicken Breast","confidence":95,"calories":284,"protein":53,"carbs":0,"fat":6,"fiber":0,"sugar":0,"sodium":130,"servingSize":"6 oz","servingWeight":170}]',
                },
                { inline_data: { mime_type: mimeType, data } },
              ],
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseModalities: ['TEXT'] },
          }),
        },
      ),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timed out')), 25000)
      ),
    ])

    const result = await geminiResponse.json()

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Gemini API error', foods: [] }, { status: 500 })
    }

    if (!result.candidates?.[0]?.content?.parts) {
      return NextResponse.json({ error: 'No food detected in image', foods: [] }, { status: 200 })
    }

    const parts = result.candidates[0].content.parts
    const textPart = parts.find((p: any) => p.text && !p.thought)
    if (!textPart?.text) {
      return NextResponse.json({ error: 'No food detected in image', foods: [] }, { status: 200 })
    }

    const text = textPart.text
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const foods = JSON.parse(cleaned)

    return NextResponse.json({ foods })
  } catch {
    return NextResponse.json(
      { error: 'AI analysis unavailable. Please enter details manually.', foods: [] },
      { status: 200 },
    )
  }
}
