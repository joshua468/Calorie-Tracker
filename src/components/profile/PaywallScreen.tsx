import { motion } from 'framer-motion'
import { useState } from 'react'
import { Crown, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FEATURES = [
  'AI food analysis',
  'Trend insights',
  'Progress analytics',
  'Personalised insights',
  'More coming soon',
]

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Full access, cancel anytime',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$59.99',
    period: '/year',
    description: '2 months free',
    popular: true,
    badge: 'Best value',
  },
]

export function PaywallScreen({ onClose, onSubscribe }: { onClose: () => void; onSubscribe?: (plan: string) => void }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 pb-6 text-center bg-gradient-to-b from-primary/5 to-card">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Unlock Premium</h2>
          <p className="text-sm text-muted-foreground/80 mt-1.5 max-w-xs mx-auto">
            Get the most out of your calorie tracking with premium features
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30">
                <div className="p-0.5 rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((plan) => (
              <motion.button
                key={plan.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  'relative rounded-2xl p-4 border-2 transition-all duration-200 text-left',
                  selectedPlan === plan.id
                    ? 'border-primary bg-primary/[0.04] shadow-sm shadow-primary/10'
                    : 'border-border/60 bg-card hover:border-muted-foreground/30',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}
                <div className={cn(plan.badge && 'mt-1.5')}>
                  <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">{plan.name}</div>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-[10px] font-medium text-muted-foreground/60">{plan.period}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground/60 mt-1">{plan.description}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="space-y-2.5 pt-1">
            <Button
              variant="green"
              size="xl"
              className="w-full rounded-2xl"
              onClick={() => onSubscribe?.(selectedPlan)}
            >
              Start Free Trial
            </Button>
            <p className="text-[10px] text-center text-muted-foreground/50 px-4 leading-relaxed">
              Free trial for 7 days, then {selectedPlan === 'yearly' ? '$59.99/year' : '$9.99/month'}. Cancel anytime.
            </p>
            <button
              onClick={onClose}
              className="w-full text-center text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
