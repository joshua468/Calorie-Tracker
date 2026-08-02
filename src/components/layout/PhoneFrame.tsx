import React from 'react'

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <div className="flex-1 flex flex-col overflow-hidden ios-scroll no-scrollbar relative">
        {children}
      </div>
    </div>
  )
}