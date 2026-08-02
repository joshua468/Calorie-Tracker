// Main app layout — app/(app)/layout.tsx
// Wraps authenticated app screens with StatusBar + BottomNav
'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useStore } from '@/store/useStore'
import type { AppScreen } from '@/lib/types'

interface AppGroupLayoutProps {
  children: React.ReactNode
}

export function AppGroupLayout({ children }: AppGroupLayoutProps) {
  const screen = useStore((s) => s.screen)
  return <AppLayout screen={screen}>{children}</AppLayout>
}

export default AppGroupLayout
