import { supabase } from './client'

const BUCKETS = {
  AVATARS: 'avatars',
  MEALS: 'meal-photos',
  PROGRESS: 'progress-photos',
} as const

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKETS.AVATARS)
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(BUCKETS.AVATARS)
        .getPublicUrl(path)

      return urlData.publicUrl
    } catch {
      const dataUrl = await fileToDataUrl(file)
      return dataUrl
    }
  },

  async uploadMealPhoto(userId: string, file: File): Promise<string> {
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.MEALS)
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(BUCKETS.MEALS)
      .getPublicUrl(path)

    return urlData.publicUrl
  },

  async uploadProgressPhoto(userId: string, file: File): Promise<string> {
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.PROGRESS)
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(BUCKETS.PROGRESS)
      .getPublicUrl(path)

    return urlData.publicUrl
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    if (error) throw error
  },

  async listFiles(bucket: string, prefix: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix)
    if (error) throw error
    return data
  },
}

export { BUCKETS }
