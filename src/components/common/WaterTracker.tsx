import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getDateKey } from '@/lib/utils'

interface WaterTrackerProps {
  className?: string
}

export function WaterTracker({ className }: WaterTrackerProps) {
  const dateKey = getDateKey(new Date())
  const [glasses, setGlasses] = useState(0)

  useEffect(() => {
    try {
      const val = localStorage.getItem(`ct_water_${dateKey}`)
      setGlasses(val ? parseInt(val) : 0)
    } catch {
      setGlasses(0)
    }
  }, [dateKey])

  const updateWater = (delta: number) => {
    const next = Math.max(0, Math.min(12, glasses + delta))
    setGlasses(next)
    localStorage.setItem(`ct_water_${dateKey}`, String(next))
  }

  return (
    <div className={cn('glass rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Water</span>
        <span className="text-sm font-medium text-muted-foreground">{glasses} / 8 glasses</span>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => updateWater(-1)} disabled={glasses === 0} className="h-10 w-10 rounded-xl">
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {Array.from({ length: Math.min(glasses, 8) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30, delay: i * 0.03 }}
              >
                <Droplets className="h-5 w-5 text-blue-500 fill-blue-500/30" />
              </motion.div>
            ))}
          </AnimatePresence>
          {glasses === 0 && (
            <span className="text-xs text-muted-foreground px-2">No water logged</span>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => updateWater(1)} disabled={glasses >= 12} className="h-10 w-10 rounded-xl">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
