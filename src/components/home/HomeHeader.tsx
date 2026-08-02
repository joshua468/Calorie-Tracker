'use client'

import { useState } from 'react'

interface HomeHeaderProps {
  userName: string
  avatarUrl?: string
  hasUnreadNotifications?: boolean
  date?: Date
  onProfileClick?: () => void
  onNotificationClick?: () => void
}

export default function HomeHeader({
  userName,
  avatarUrl,
  hasUnreadNotifications = false,
  date = new Date(),
  onProfileClick,
  onNotificationClick,
}: HomeHeaderProps) {
  const [imgError, setImgError] = useState(false)

  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="flex items-center justify-between px-5 pb-5 pt-3">
      <button onClick={onProfileClick} className="flex items-center gap-3">
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={userName}
            onError={() => setImgError(true)}
            className="h-11 w-11 rounded-full border-2 border-black/10 object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black/10 bg-black/5 text-lg font-bold text-foreground">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-left">
          <div className="text-[17px] font-bold leading-tight text-foreground">
            Hi {userName}
          </div>
          <div className="text-[13px] font-medium text-muted-foreground">
            {dateLabel}
          </div>
        </div>
      </button>

      <button
        onClick={onNotificationClick}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-foreground transition active:scale-95"
      >
        <BellIcon />
        {hasUnreadNotifications && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF5A5F] ring-2 ring-white" />
        )}
      </button>
    </header>
  )
}

function BellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}