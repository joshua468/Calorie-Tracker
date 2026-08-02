import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { useStore } from '@/store/useStore'
import type { AppScreen } from '@/lib/types'

interface AppLayoutProps {
  children: React.ReactNode
  screen: AppScreen
}

const screenVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export function AppLayout({ children, screen }: AppLayoutProps) {
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="flex h-full flex-col bg-background">
      <main className="flex-1 overflow-y-auto ios-scroll no-scrollbar min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={screen} onSelect={setScreen} />
    </div>
  )
}
