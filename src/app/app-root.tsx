'use client'

import { useStore } from '@/store/useStore'
import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import * as storage from '@/lib/storage'
import { OnboardingPage } from './onboarding/page'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from './(app)/home/page'
import { DiaryPage } from './(app)/diary/page'
import { SearchPage } from './(app)/search/page'
import { ProgressPage } from './(app)/progress/page'
import { ProfilePage } from './(app)/profile/page'
import { HistoryPage } from './(app)/history/page'
import { MealDetailsScreen } from '@/components/meal-details/MealDetailsScreen'
import { NotificationScreen } from '@/components/notifications/NotificationScreen'
import { AddFoodModal } from '@/components/diary/AddFoodModal'
import { ExerciseModal } from '@/components/exercise/ExerciseModal'
import { SavePrompt } from '@/components/auth/SavePrompt'
import { GdprConsent } from '@/components/auth/GdprConsent'
import { AuthScreen } from '@/components/auth/AuthScreen'
import { CoverPage } from '@/components/auth/CoverPage'
import { SplashScreen } from '@/components/auth/SplashScreen'
import { ToastContainer } from '@/components/common/ToastContainer'
import { useToastStore } from '@/store/toastStore'
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext'
import type { MealType, LogSource } from '@/lib/types'

export function AppRoot() {
  return (
    <AuthProvider>
      <AppRootInner />
    </AuthProvider>
  )
}

function AppRootInner() {
  const screen = useStore((s) => s.screen)
  const setScreen = useStore((s) => s.setScreen)
  const profile = useStore((s) => s.profile)
  const addEntry = useStore((s) => s.addEntry)
  const deleteAllData = useStore((s) => s.deleteAllData)
  const showSavePrompt = useStore((s) => s.showSavePrompt)
  const showGdprConsent = useStore((s) => s.showGdprConsent)
  const dismissSavePrompt = useStore((s) => s.dismissSavePrompt)
  const acceptGdpr = useStore((s) => s.acceptGdpr)
  const updateProfile = useStore((s) => s.updateProfile)

  const { user, loading: authLoading } = useAuth()
  const setUserId = useStore((s) => s.setUserId)
  const syncToSupabase = useStore((s) => s.syncToSupabase)
  const loadFromSupabase = useStore((s) => s.loadFromSupabase)

  const [showSplash, setShowSplash] = useState(true)
  const [oauthReturning, setOauthReturning] = useState(false)
  const [showCover, setShowCover] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAuth, setShowAuth] = useState(true)
  const [authComplete, setAuthComplete] = useState(false)
  const [showAddFood, setShowAddFood] = useState(false)
  const [showExercise, setShowExercise] = useState(false)
  const [addFoodMeal, setAddFoodMeal] = useState<MealType | undefined>()
  const [initialized, setInitialized] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const [viewingMealId, setViewingMealId] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const userRef = useRef(user)
  userRef.current = user
  const oauthReturnRef = useRef(false)

  useLayoutEffect(() => {
    const isOauthReturn =
      sessionStorage.getItem('ct_oauth_return') === '1' ||
      new URLSearchParams(window.location.search).has('oauth_return')
    if (isOauthReturn) {
      sessionStorage.removeItem('ct_oauth_return')
      window.history.replaceState({}, '', window.location.pathname)
      oauthReturnRef.current = true
      setShowSplash(false)
      setOauthReturning(true)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await new Promise((r) => setTimeout(r, 100))
      const params = new URLSearchParams(window.location.search)
      if (params.has('error') || params.has('error_code') || params.has('error_description')) {
        window.history.replaceState({}, '', window.location.pathname)
      }
      if (params.has('fresh')) {
        storage.clearAllData()
        localStorage.clear()
        sessionStorage.clear()
        const { supabase } = await import('@/lib/supabase/client')
        await supabase.auth.signOut()
        window.history.replaceState({}, '', window.location.pathname)
      }
      const prevVersion = localStorage.getItem('ct_data_version')
      if (prevVersion !== '2') {
        storage.clearAllData()
        localStorage.setItem('ct_data_version', '2')
      }
      setInitialized(true)
    }
    init()
  }, [])

  useEffect(() => {
    if (user) {
      setUserId(user.id)
      setLoadingProfile(true)
      loadFromSupabase(user.id)
        .catch(() => {})
        .finally(() => setLoadingProfile(false))
    } else {
      setUserId(null)
      setLoadingProfile(false)
    }
  }, [user, setUserId, loadFromSupabase])

  useEffect(() => {
    if (!initialized || authLoading || loadingProfile) return

    setOauthReturning(false)

    if (user) {
      setShowAuth(false)
      setAuthComplete(true)

      if (oauthReturnRef.current) {
        oauthReturnRef.current = false
        setShowCover(false)
      }

      if (!profile.onboardingCompleted || !profile.name) {
        setShowOnboarding(true)
      } else {
        setShowOnboarding(false)
      }

      const stored = storage.loadProfile()
      if (user.email && !stored.email) {
        const updated = { ...stored, email: user.email }
        storage.saveProfile(updated)
        updateProfile({ email: user.email })
      }
    } else {
      setAuthComplete(false)
      setShowOnboarding(false)
      if (!showCover) {
        setShowAuth(true)
      }
    }
  }, [user, authLoading, initialized, loadingProfile, showCover, profile.onboardingCompleted, profile.name])

  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Home',
      diary: 'Diary',
      search: 'Search Food',
      progress: 'Progress',
      profile: 'Profile',
      history: 'History',
    }
    document.title = titles[screen] ? `${titles[screen]} — Tally Health` : 'Tally Health — Your Personal Nutrition Companion'
  }, [screen])

  const handleAuthComplete = () => {
    setShowAuth(false)
    setAuthComplete(true)
    const u = userRef.current
    const stored = storage.loadProfile()
    if (u?.email) {
      const updated = { ...stored, email: u.email }
      storage.saveProfile(updated)
      updateProfile({ email: u.email })
    }
    if (!stored.onboardingCompleted || !stored.name) {
      setShowOnboarding(true)
    }
  }

  const handleOnboardingComplete = (data: any) => {
    const updated = {
      ...profile,
      name: data.name,
      sex: data.sex,
      age: data.age,
      height: data.height,
      weight: data.weight,
      activityLevel: data.activityLevel,
      goalDirection: data.goalDirection,
      dietaryPreferences: data.dietaryPreferences,
      goals: {
        ...profile.goals,
        calorieGoal: data.calories || 2000,
      },
      onboardingCompleted: true,
    }
    updateProfile(updated)
    storage.saveProfile(updated)
    setShowOnboarding(false)
  }

  const handleAddFood = (meal?: string) => {
    setAddFoodMeal(meal as MealType)
    setShowAddFood(true)
  }

  const handleLogExercise = () => {
    setShowExercise(true)
  }

  const handleSearchAdd = (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; source?: LogSource }) => {
    addEntry({ ...data, source: data.source ?? 'search' })
    const mealLabel = data.meal.charAt(0).toUpperCase() + data.meal.slice(1)
    useToastStore.getState().addToast(`Added to ${mealLabel} — ${data.calories} kcal`)
  }

  const handleViewMeal = (entryId: string) => {
    setViewingMealId(entryId)
  }

  const handleSignOut = async () => {
    deleteAllData()
    const { supabase } = await import('@/lib/supabase/client')
    await supabase.auth.signOut()
    setShowCover(true)
  }

  if (oauthReturning) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-background">
        <svg className="animate-spin h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (showCover) {
    return (
      <CoverPage
        onGetStarted={() => setShowCover(false)}
        onSignIn={() => { setShowCover(false); setShowAuth(true) }}
      />
    )
  }

  if (showOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />
  }

  if (showAuth) {
    return <AuthScreen onComplete={handleAuthComplete} onBack={() => { setShowAuth(false); setShowCover(true) }} />
  }

  if (showNotifications) {
    return <NotificationScreen onBack={() => setShowNotifications(false)} />
  }

  if (viewingMealId) {
    return <MealDetailsScreen entryId={viewingMealId} onBack={() => setViewingMealId(null)} />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomePage onAddFood={handleAddFood} onLogExercise={handleLogExercise} onViewMeal={handleViewMeal} onGoToProfile={() => setScreen('profile')} onNotificationClick={() => setShowNotifications(true)} />
      case 'diary': return <DiaryPage onGoToSearch={() => setScreen('search')} onAddFood={handleAddFood} />
      case 'search': return <SearchPage onAddFood={handleSearchAdd} onOpenModal={handleAddFood} />
      case 'progress': return <ProgressPage />
      case 'profile': return <ProfilePage onSignOut={handleSignOut} />
      case 'history': return <HistoryPage onViewMeal={handleViewMeal} />
      default: return <HomePage onAddFood={handleAddFood} onViewMeal={handleViewMeal} onGoToProfile={() => setScreen('profile')} />
    }
  }

  return (
    <>
      <AppLayout screen={screen}>
        {renderScreen()}
      </AppLayout>

      <AddFoodModal isOpen={showAddFood} onClose={() => setShowAddFood(false)} defaultMeal={addFoodMeal} />
      <ExerciseModal isOpen={showExercise} onClose={() => setShowExercise(false)} />
      <SavePrompt
        isOpen={showSavePrompt}
        onClose={dismissSavePrompt}
        onSignUp={() => { dismissSavePrompt(); setShowAuth(true) }}
        onSignIn={() => { dismissSavePrompt(); setShowAuth(true) }}
      />
      <GdprConsent isOpen={showGdprConsent} onAccept={acceptGdpr} />
      <ToastContainer />
    </>
  )
}
