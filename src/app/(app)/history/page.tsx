// History page — app/(app)/history/page.tsx
'use client'

import { useEffect } from 'react'
import { HistoryScreen } from '@/components/history/HistoryScreen'
import { useStore } from '@/store/useStore'

interface HistoryPageProps {
  onViewMeal?: (entryId: string) => void
}

export function HistoryPage(props: HistoryPageProps) {
  const setScreen = useStore((s) => s.setScreen)
  useEffect(() => { setScreen('history') }, [setScreen])
  return <HistoryScreen {...props} />
}

export default HistoryPage