import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-muted/60', className)}
      {...props}
    />
  )
}

export function CalorieRingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <Skeleton className="h-[200px] w-[200px] rounded-full" />
      <div className="flex gap-8">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

export function MacroBarsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  )
}

export function MealsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 flex-1 rounded-xl" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <CalorieRingSkeleton />
      <MacroBarsSkeleton />
      <MealsSkeleton />
    </div>
  )
}

export { Skeleton }
