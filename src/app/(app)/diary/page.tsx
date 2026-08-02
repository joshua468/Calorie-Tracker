// Diary page — app/(app)/diary/page.tsx
'use client'

import { DiaryScreen } from '@/components/diary/DiaryScreen'

interface DiaryPageProps {
  onGoToSearch: () => void
  onAddFood?: (meal?: string) => void
}

export function DiaryPage(props: DiaryPageProps) {
  return <DiaryScreen {...props} />
}

export default DiaryPage
