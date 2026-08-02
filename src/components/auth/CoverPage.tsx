'use client'

import { motion } from 'framer-motion'

interface CoverPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export function CoverPage({ onGetStarted, onSignIn }: CoverPageProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col overflow-hidden">
      {/* Full-bleed hero image */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[58%] w-full bg-[#DFF3E4]"
      >
        <img
          src="/images/calorie image.jpeg"
          alt="Fresh, colorful food"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </motion.div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-white px-6 pb-8 pt-7"
      >
        <h1 className="mb-2 text-[26px] font-extrabold leading-tight tracking-tight text-[#0E1B33]">
          Scan it. Know it. Track it.
        </h1>
        <p className="mb-6 text-[14.5px] leading-relaxed text-[#66718A]">
          Point your camera at any meal and get instant calories and macros.
          No manual searching, no guesswork.
        </p>

        <button
          onClick={onGetStarted}
          className="mb-3 w-full rounded-2xl bg-[#2FAE60] py-4 text-[16px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(47,174,96,0.55)] transition active:scale-[0.98]"
        >
          Get started
        </button>

        <button
          onClick={onSignIn}
          className="mb-5 w-full rounded-2xl bg-[#F3F5F8] py-4 text-[16px] font-bold text-[#0E1B33] transition active:scale-[0.98]"
        >
          Login
        </button>

        <p className="text-center text-[12px] text-[#A6AFC2]">
          <span className="underline cursor-default">Terms of Service</span>
          {' | '}
          <span className="underline cursor-default">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  )
}
