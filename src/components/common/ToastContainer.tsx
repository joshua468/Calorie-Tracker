import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store/toastStore'

const bgMap: Record<string, string> = {
  success: 'bg-green-50 dark:bg-green-950 border-green-500/20',
  info: 'bg-blue-50 dark:bg-blue-950 border-blue-500/20',
  error: 'bg-red-50 dark:bg-red-950 border-red-500/20',
}

const iconMap: Record<string, string> = {
  success: 'text-green-600 dark:text-green-400',
  info: 'text-blue-600 dark:text-blue-400',
  error: 'text-red-600 dark:text-red-400',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => removeToast(toast.id)}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm cursor-pointer',
              bgMap[toast.type]
            )}
          >
            <span className={cn('text-sm font-medium', iconMap[toast.type])}>
              {toast.message}
            </span>
            <X className={cn('h-4 w-4 shrink-0', iconMap[toast.type])} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
