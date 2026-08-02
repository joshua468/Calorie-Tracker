import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
        },
        brand: {
          green: '#1F7A4D',
          'green-hover': '#186139',
          'green-soft': '#E8F3EC',
        },
        ink: '#0E1512',
        'ink-muted': '#5B6B64',
        state: {
          ontrack: '#1F7A4D',
          watch: '#C98A2B',
          over: '#B4442E',
        },
        nutrient: {
          protein: '#1F7A4D',
          carbs: '#C98A2B',
          fat: '#5B6B64',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['Satoshi', 'Inter Tight', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'token-xs': 'var(--spacing-extra-small-spacing)',
        'token-sm': 'var(--spacing-small-spacing)',
        'token-md': 'var(--spacing-medium-spacing)',
        'token-base': 'var(--spacing-base-spacing)',
        'token-lg': 'var(--spacing-large-spacing)',
        'token-xl': 'var(--spacing-extra-large-spacing)',
        'token-2xl': 'var(--spacing-very-large-spacing)',
      },
      boxShadow: {
        'token-soft': 'var(--effect-soft-shadow)',
        'token-medium': 'var(--effect-medium-shadow)',
        'token-hard': 'var(--effect-hard-shadow)',
      },
      fontSize: {
        'display-lg': ['var(--typography-display-large-fontsize, 64px)', { lineHeight: 'var(--typography-display-large-lineheight, 96px)', letterSpacing: 'var(--typography-display-large-letterspacing, -4px)', fontWeight: 'var(--typography-display-large-fontweight, 500)' }],
        'display-md': ['var(--typography-display-medium-fontsize, 50px)', { lineHeight: 'var(--typography-display-medium-lineheight, 75px)', letterSpacing: 'var(--typography-display-medium-letterspacing, -3px)', fontWeight: 'var(--typography-display-medium-fontweight, 500)' }],
        'display-sm': ['var(--typography-display-small-fontsize, 40px)', { lineHeight: 'var(--typography-display-small-lineheight, 60px)', letterSpacing: 'var(--typography-display-small-letterspacing, -2.5px)', fontWeight: 'var(--typography-display-small-fontweight, 500)' }],
        'headline-lg': ['var(--typography-headline-large-fontsize, 32px)', { lineHeight: 'var(--typography-headline-large-lineheight, 48px)', letterSpacing: 'var(--typography-headline-large-letterspacing, -1px)', fontWeight: 'var(--typography-headline-large-fontweight, 500)' }],
        'headline-md': ['var(--typography-headline-medium-fontsize, 28px)', { lineHeight: 'var(--typography-headline-medium-lineheight, 42px)', letterSpacing: 'var(--typography-headline-medium-letterspacing, -1px)', fontWeight: 'var(--typography-headline-medium-fontweight, 500)' }],
        'headline-sm': ['var(--typography-headline-small-fontsize, 24px)', { lineHeight: 'var(--typography-headline-small-lineheight, 36px)', letterSpacing: 'var(--typography-headline-small-letterspacing, -1px)', fontWeight: 'var(--typography-headline-small-fontweight, 500)' }],
        'title-lg': ['var(--typography-title-large-fontsize, 16px)', { lineHeight: 'var(--typography-title-large-lineheight, 24px)', letterSpacing: 'var(--typography-title-large-letterspacing, -0.85px)', fontWeight: 'var(--typography-title-large-fontweight, 500)' }],
        'title-md': ['var(--typography-title-medium-fontsize, 16px)', { lineHeight: 'var(--typography-title-medium-lineheight, 24px)', letterSpacing: 'var(--typography-title-medium-letterspacing, -1px)', fontWeight: 'var(--typography-title-medium-fontweight, 600)' }],
        'title-sm': ['var(--typography-title-small-fontsize, 14px)', { lineHeight: 'var(--typography-title-small-lineheight, 21px)', letterSpacing: 'var(--typography-title-small-letterspacing, -0.75px)', fontWeight: 'var(--typography-title-small-fontweight, 600)' }],
        'body-lg': ['var(--typography-body-large-fontsize, 14px)', { lineHeight: 'var(--typography-body-large-lineheight, 21px)', letterSpacing: 'var(--typography-body-large-letterspacing, -0.8px)', fontWeight: 'var(--typography-body-large-fontweight, 500)' }],
        'body-sm': ['var(--typography-body-small-fontsize, 12px)', { lineHeight: 'var(--typography-body-small-lineheight, 18px)', letterSpacing: 'var(--typography-body-small-letterspacing, -0.8px)', fontWeight: 'var(--typography-body-small-fontweight, 500)' }],
        'label-lg': ['var(--typography-labe-large-fontsize, 14px)', { lineHeight: 'var(--typography-labe-large-lineheight, 21px)', letterSpacing: 'var(--typography-labe-large-letterspacing, -0.9px)', fontWeight: 'var(--typography-labe-large-fontweight, 500)' }],
        'label-md': ['var(--typography-label-medium-fontsize, 12px)', { lineHeight: 'var(--typography-label-medium-lineheight, 18px)', letterSpacing: 'var(--typography-label-medium-letterspacing, -0.9px)', fontWeight: 'var(--typography-label-medium-fontweight, 500)' }],
        'label-sm': ['var(--typography-label-small-fontsize, 11px)', { lineHeight: 'var(--typography-label-small-lineheight, 16.5px)', letterSpacing: 'var(--typography-label-small-letterspacing, -0.9px)', fontWeight: 'var(--typography-label-small-fontweight, 500)' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        },
        'ring-fill': {
          from: { strokeDashoffset: '534.07' },
          to: { strokeDashoffset: 'var(--ring-offset)' },
        },
        'number-count': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1) both',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
