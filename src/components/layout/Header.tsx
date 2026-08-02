import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'

export function Header() {
  const setScreen = useStore((s) => s.setScreen)

  return (
    <header className="shrink-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-14">
        <span className="text-lg font-bold text-foreground">Diary</span>
        <Button variant="ghost" size="icon" onClick={() => setScreen('home')} aria-label="Close diary" className="h-9 w-9 rounded-xl">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
