// Search page — app/(app)/search/page.tsx
'use client'

import { SearchScreen } from '@/components/search/SearchScreen'
import type { MealType, LogSource } from '@/lib/types'

interface SearchPageProps {
  onAddFood: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; source?: LogSource }) => void
  onOpenModal?: (meal?: string) => void
}

export function SearchPage(props: SearchPageProps) {
  return <SearchScreen {...props} />
}

export default SearchPage
