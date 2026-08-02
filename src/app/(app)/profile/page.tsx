// Profile page — app/(app)/profile/page.tsx
'use client'

import { useEffect } from 'react'
import { ProfileScreen } from '@/components/profile/ProfileScreen'
import { useStore } from '@/store/useStore'

export function ProfilePage({ onSignOut }: { onSignOut?: () => void }) {
  const setScreen = useStore((s) => s.setScreen)
  useEffect(() => { setScreen('profile') }, [setScreen])
  return <ProfileScreen onSignOut={onSignOut} />
}

export default ProfilePage
