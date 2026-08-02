'use client'

import type { AppScreen } from '@/lib/types'

const NAV_ITEMS: Array<{ key: AppScreen; label: string; icon: React.ComponentType<{ active: boolean }> }> = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'history', label: 'History', icon: HistoryIcon },
  { key: 'search', label: 'Search', icon: SearchIcon },
  { key: 'progress', label: 'Progress', icon: ProgressIcon },
  { key: 'profile', label: 'Profile', icon: ProfileIcon },
]

interface BottomNavProps {
  active: AppScreen
  onSelect: (screen: AppScreen) => void
}

export function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-40 flex w-full border-t border-black/5 bg-white dark:bg-gray-950 dark:border-white/5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex w-full max-w-lg items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
            >
              <Icon active={isActive} />
              <span
                className={`text-[10.5px] font-semibold ${
                  isActive ? 'text-[#2FAE60]' : 'text-[#8890A3]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-[#2FAE60]" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function iconProps(active: boolean) {
  return {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: active ? '#2FAE60' : '#8890A3',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}
