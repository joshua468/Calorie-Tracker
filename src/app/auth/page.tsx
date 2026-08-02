// Auth page — app/auth/page.tsx
'use client'

import { AuthScreen } from '@/components/auth/AuthScreen'
import { AuthProvider } from '@/lib/auth/AuthContext'

interface AuthPageProps {
  onComplete?: () => void
}

export function AuthPage({ onComplete = () => {} }: AuthPageProps) {
  return (
    <AuthProvider>
      <AuthScreen onComplete={onComplete} />
    </AuthProvider>
  )
}

export default AuthPage
