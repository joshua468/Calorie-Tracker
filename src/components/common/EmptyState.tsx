import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
        {icon || <UtensilsCrossed className="h-7 w-7 text-muted-foreground/60" />}
      </div>
      <h3 className="text-base font-semibold text-foreground/80">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-[220px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
