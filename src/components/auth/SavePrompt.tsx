import { motion, AnimatePresence } from 'framer-motion'
import { X, Apple, UserPlus, Cloud, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface SavePromptProps {
  isOpen: boolean
  onClose: () => void
  onSignUp?: () => void
  onSignIn?: () => void
}

export function SavePrompt({ isOpen, onClose, onSignUp, onSignIn }: SavePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    setTimeout(() => {
      setDismissed(false)
      onClose()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && !dismissed && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 pt-6 pb-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Apple className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Save your progress</h2>
                    <p className="text-xs text-muted-foreground">Create a free account</p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is currently saved only on this device. Create an account to sync across devices and never lose your logs.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <Cloud className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">Cloud sync across all your devices</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">Secure backup with Supabase</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="green" size="lg" className="w-full h-12 rounded-2xl" onClick={onSignUp}>
                  <UserPlus className="h-4 w-4" />
                  Create Free Account
                </Button>
                <Button variant="ghost" size="sm" className="w-full h-10 text-muted-foreground" onClick={onSignIn}>
                  Already have an account? Sign in
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
