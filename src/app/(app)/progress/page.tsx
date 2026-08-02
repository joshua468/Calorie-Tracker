// Progress page — app/(app)/progress/page.tsx
'use client'

import { useEffect } from 'react'
import { ProgressScreen } from '@/components/progress/ProgressScreen'
import { useStore } from '@/store/useStore'

export function ProgressPage() {
  const setScreen = useStore((s) => s.setScreen)
  useEffect(() => { setScreen('progress') }, [setScreen])
  return <ProgressScreen />
}

export default ProgressPage
