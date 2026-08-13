import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = 'https://tallyhealth.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tally Health — Your Personal Nutrition Companion',
    template: '%s — Tally Health',
  },
  description:
    'Track your meals, monitor calories, and reach your health goals with Tally Health — the smart calorie tracker powered by AI food recognition.',
  keywords: [
    'calorie tracker',
    'food diary',
    'nutrition tracker',
    'weight loss',
    'meal tracking',
    'AI food recognition',
    'health app',
    'diet planner',
    'macronutrients',
    'Nigerian food',
  ],
  authors: [{ name: 'Tally Health' }],
  creator: 'Tally Health',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Tally Health',
    title: 'Tally Health — Your Personal Nutrition Companion',
    description:
      'Track your meals, monitor calories, and reach your health goals with Tally Health — the smart calorie tracker powered by AI food recognition.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tally Health — Smart Calorie Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tally Health — Your Personal Nutrition Companion',
    description:
      'Track your meals, monitor calories, and reach your health goals with Tally Health.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tally Health',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F7F8FA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}
