import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  onClick: () => void
  ariaLabel?: string
}

export function BackButton({ onClick, ariaLabel = 'Back' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer bg-[#E9F8EE] text-[#2FAE60] transition active:scale-90 before:absolute before:inset-[-5px] before:content-['']"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
  )
}
