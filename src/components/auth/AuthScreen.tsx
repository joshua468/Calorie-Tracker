import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { useAuth } from '@/lib/auth/AuthContext'
import { cn } from '@/lib/utils'

interface AuthScreenProps {
  onComplete: () => void
  onBack?: () => void
}

type AuthView = 'login' | 'signup' | 'forgot' | 'verify' | 'check-email'

export function AuthScreen({ onComplete, onBack }: AuthScreenProps) {
  const { signUp, signIn, signInWithOAuth, resetPassword } = useAuth()
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailRegex.test(email)
  const isPasswordValid = password.length >= 8
  const isSignupValid = isEmailValid && isPasswordValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (view === 'signup') {
        const result = await signUp(email, password, name)
        if (result.user?.identities?.length === 0) {
          setError('An account with this email already exists.')
        } else if (result.user?.email_confirmed_at) {
          onComplete()
        } else {
          setView('check-email')
        }
      } else if (view === 'login') {
        const result = await signIn(email, password)
        if (result.user) {
          onComplete()
        }
      } else if (view === 'forgot') {
        await resetPassword(email)
        setView('check-email')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      if (message.includes('Email not confirmed')) {
        setView('verify')
      } else if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (message.includes('User already registered')) {
        setError('An account with this email already exists.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: view === 'login' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === 'login' ? -50 : 50 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col px-6"
        >
          <div className="pt-10 pb-8">
            {view === 'login' && onBack && (
              <>
                <BackButton onClick={onBack} ariaLabel="Back to cover" />
                <div className="h-10" />
              </>
            )}
            {view !== 'login' && view !== 'check-email' && view !== 'verify' && (
              <>
                <BackButton onClick={() => setView('login')} />
                <div className="h-10" />
              </>
            )}
            {(view === 'check-email' || view === 'verify') && (
              <>
                <BackButton onClick={() => setView('login')} />
                <div className="h-10" />
              </>
            )}
            {view === 'check-email' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-green-soft flex items-center justify-center">
                    <Mail className="h-6 w-6 text-brand-green" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Check your email</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  We sent a link to <span className="font-medium text-foreground">{email}</span>.
                  Please check your inbox and follow the instructions.
                </p>
              </>
            ) : view === 'verify' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Email not verified</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Please verify your email address before signing in. Check your inbox for the verification link.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create account' : 'Reset password'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {view === 'login'
                    ? 'Sign in to keep your streak going.'
                    : view === 'signup'
                    ? 'Start your nutrition journey today'
                    : "Enter your email and we'll send you a reset link"}
                </p>
              </>
            )}
          </div>

          {view !== 'check-email' && view !== 'verify' && (
            <>
              <div className="flex flex-col gap-3 mb-6">
                <button
                  type="button"
                  disabled={oauthLoading !== null}
                  onClick={async () => {
                    setError(null)
                    setOauthLoading('google')
                    const popup = window.open('', 'oauth-popup', 'width=390,height=640')
                    try {
                      await signInWithOAuth('google', popup)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Google sign-in failed')
                      popup?.close()
                    } finally {
                      setOauthLoading(null)
                    }
                  }}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Continue with Google
                </button>
                <button
                  type="button"
                  disabled={oauthLoading !== null}
                  onClick={async () => {
                    setError(null)
                    setOauthLoading('apple')
                    const popup = window.open('', 'oauth-popup', 'width=390,height=640')
                    try {
                      await signInWithOAuth('apple', popup)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Apple sign-in failed')
                      popup?.close()
                    } finally {
                      setOauthLoading(null)
                    }
                  }}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-foreground text-sm font-medium text-background hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {oauthLoading === 'apple' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  )}
                  Continue with Apple
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or use email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {view !== 'check-email' && view !== 'verify' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'signup' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-12 text-base"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 text-base"
                  required
                />
              </div>
              {view !== 'forgot' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                      className="h-12 text-base pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {view === 'login' && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setError(null) }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                variant="green"
                size="lg"
                className="w-full h-[52px] rounded-xl mt-2 disabled:bg-[#E6E8E4] disabled:text-[#5B6B64] disabled:cursor-not-allowed disabled:opacity-100 disabled:scale-100"
                disabled={loading || (view === 'signup' && !isSignupValid)}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : view === 'login' ? (
                  'Sign in'
                ) : view === 'signup' ? (
                  'Create Account'
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}

          {view === 'check-email' && (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Didn't receive the email? Check your spam folder or
                {' '}
                <button
                  onClick={handleSubmit}
                  className="text-primary font-medium hover:underline"
                  disabled={loading}
                >
                  resend
                </button>
              </p>
            </div>
          )}

          {view === 'verify' && (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <button
                onClick={async () => {
                  setLoading(true)
                  setError(null)
                  try {
                    await signIn(email, password)
                  } catch {
                    setError('Please verify your email first, then sign in.')
                  } finally {
                    setLoading(false)
                  }
                }}
                className="text-primary font-medium hover:underline text-sm"
                disabled={loading}
              >
                {loading ? 'Checking...' : 'I\'ve verified, sign me in'}
              </button>
            </div>
          )}

          <div className="py-6 text-left">
            <p className="text-sm text-muted-foreground">
              {view === 'login' ? (
                <>
                  New to Tally Health?{' '}
                  <button onClick={() => { setView('signup'); setError(null) }} className="font-medium text-ink hover:underline">
                    Create account
                  </button>
                </>
              ) : view === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setView('login'); setError(null) }} className="font-medium text-ink hover:underline">
                    Sign in
                  </button>
                </>
              ) : view !== 'check-email' && view !== 'verify' ? (
                <button onClick={() => { setView('login'); setError(null) }} className="font-medium text-ink hover:underline">
                  Back to sign in
                </button>
              ) : null}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
