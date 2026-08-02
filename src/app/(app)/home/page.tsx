// Home page — app/(app)/home/page.tsx
'use client'

import { HomeScreen } from '@/components/home/HomeScreen'

interface HomePageProps {
  onAddFood: (meal?: string) => void
  onLogExercise?: () => void
  onViewMeal?: (entryId: string) => void
  onGoToProfile?: () => void
  onNotificationClick?: () => void
}

export function HomePage(props: HomePageProps) {
  return <HomeScreen {...props} />
}

export default HomePage