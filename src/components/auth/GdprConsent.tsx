import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GdprConsentProps {
  isOpen: boolean
  onAccept: () => void
}

export function GdprConsent({ isOpen, onAccept }: GdprConsentProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 pt-6 pb-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Privacy Consent</h2>
                  <p className="text-xs text-muted-foreground">We take your data seriously</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Tally Health collects and stores the following data to provide you with accurate nutrition tracking:
                </p>
                <ul className="space-y-2">
                  {[
                    'Biometric data (age, height, weight, sex) for calorie calculations',
                    'Food logs and meal photos you choose to upload',
                    'Usage data to improve the app experience',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  Your data is encrypted in transit and at rest. We never sell or share your personal data with third parties.
                  You can request a full data export or delete your account at any time from Settings.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/30 p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  By tapping "Accept", you consent to the collection and processing of your data as described.
                  You can withdraw consent at any time by deleting your account.
                </p>
              </div>

              <Button variant="green" size="lg" className="w-full h-12 rounded-2xl gap-2" onClick={onAccept}>
                <Check className="h-4 w-4" />
                Accept & Continue
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
