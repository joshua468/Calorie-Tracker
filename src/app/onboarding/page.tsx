// Onboarding page — app/onboarding/page.tsx
'use client'

import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

interface OnboardingPageProps {
  onComplete?: (profile: any) => void
}

export function OnboardingPage({ onComplete = () => {} }: OnboardingPageProps) {
  return <OnboardingFlow onComplete={onComplete} />
}

export default OnboardingPage
