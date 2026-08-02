'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1400)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#2FAE60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-3xl font-extrabold tracking-tight text-white">
          Tally Health
        </span>
      </motion.div>
    </div>
  )
}
