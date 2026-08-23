import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://babul.dev'

export const metadata: Metadata = {
  title: {
    default: 'Babul Kumar — Digital Archive',
    template: '%s — Babul Kumar',
  },
  description:
    'B.Tech Computer Science & Engineering student at Lovely Professional University. Exploring AI, Machine Learning, and Full-Stack Development.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'Babul Kumar — Digital Archive',
    title: 'Babul Kumar — Digital Archive',
    description: 'Computer Science student — AI / ML · Full Stack · Software Engineering',
    url: siteUrl,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Babul Kumar Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Babul Kumar — Digital Archive',
    description: 'Computer Science student — AI / ML · Full Stack',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') ?? 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch {}
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
