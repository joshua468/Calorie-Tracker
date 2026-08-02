import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { authService } from '@/lib/supabase/auth'
import type { UserRow } from '@/lib/database.types'
import { supabase } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserRow | null
  loading: boolean
  initialized: boolean
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; session: Session | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signInWithOAuth: (provider: 'google' | 'apple', target?: Window | null) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserRow>) => Promise<void>
  resendVerification: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
  })

  const refreshProfile = useCallback(async () => {
    const user = (await authService.getUser()) as User | null
    if (user) {
      try {
        const profile = await authService.getProfile(user.id)
        setState((prev) => ({ ...prev, profile, user }))
      } catch {
        setState((prev) => ({ ...prev, user }))
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const session = await authService.getSession()
        const user = session?.user ?? null
        let profile: UserRow | null = null

        if (user) {
          try {
            profile = await authService.getProfile(user.id)
          } catch {
            // Profile may not exist yet
          }
        }

        if (mounted) {
          setState({ user, session, profile, loading: false, initialized: true })
        }
      } catch {
        if (mounted) {
          setState({ user: null, session: null, profile: null, loading: false, initialized: true })
        }
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const user = session?.user ?? null
      let profile: UserRow | null = null

      if (user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        try {
          profile = await authService.getProfile(user.id)
        } catch {
          // Profile may not exist yet for new users
        }
      }

      setState({ user, session, profile, loading: false, initialized: true })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await authService.signUp(email, password, name)
    await refreshProfile()
    return result
  }, [refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    await refreshProfile()
    return result
  }, [refreshProfile])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple', target?: Window | null) => {
    await authService.signInWithOAuth(provider, target)
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setState({ user: null, session: null, profile: null, loading: false, initialized: true })
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email)
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    await authService.updatePassword(password)
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserRow>) => {
    if (!state.user) throw new Error('Not authenticated')
    await authService.updateProfile(state.user.id, updates)
    setState((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null,
    }))
  }, [state.user])

  const resendVerification = useCallback(async () => {
    if (!state.user?.email) throw new Error('No email on file')
    await authService.resendVerificationEmail(state.user.email)
  }, [state.user?.email])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        updateProfile,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { AuthContextValue }
