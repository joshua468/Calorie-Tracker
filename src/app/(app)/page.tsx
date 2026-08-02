// App root — redirects to home
'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

export function AppRedirect() {
  const setScreen = useStore((s) => s.setScreen)
  useEffect(() => { setScreen('home') }, [setScreen])
  return null
}

export default AppRedirect
