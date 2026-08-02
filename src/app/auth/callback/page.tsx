'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const attempts = useRef(0)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)

        const errorParam = params.get('error') || params.get('error_code')
        if (errorParam) {
          const desc = params.get('error_description') || 'Authentication was cancelled or failed.'
          setError(desc)
          window.history.replaceState({}, '', window.location.pathname)
          return
        }

        const code = params.get('code')
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(sessionError.message)
          return
        }
        if (data.session) {
          if (window.opener) {
            window.close()
          } else {
            router.replace('/?oauth_return=1')
          }
        } else if (attempts.current < 5) {
          attempts.current++
          setTimeout(handleCallback, 500)
        } else {
          setError('Sign-in could not be completed. Please try again.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to handle callback session')
      }
    }
    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => router.push('/')} className="mt-4 text-sm text-primary hover:underline">
            Go home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <svg className="animate-spin h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  )
}
