import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://babul.dev'

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Babul Kumar — AI / ML & Full-Stack Software Engineer',
    template: '%s — Babul Kumar',
  },
  description:
    'Computer Science & Engineering student at Lovely Professional University. Crafting intelligent AI/ML systems, developer tooling, and modern full-stack architectures.',
  metadataBase: new URL(siteUrl),
  keywords: [
    'Babul Kumar',
    'AI Engineer',
    'Machine Learning',
    'Full Stack Developer',
    'Deep Learning',
    'Next.js',
    'Python',
    'TypeScript',
    'Software Engineer Portfolio',
  ],
  authors: [{ name: 'Babul Kumar', url: siteUrl }],
  creator: 'Babul Kumar',
  openGraph: {
    type: 'website',
    siteName: 'Babul Kumar — Portfolio',
    title: 'Babul Kumar — AI / ML & Full-Stack Software Engineer',
    description: 'Computer Science & Engineering — AI / ML · Full Stack · Software Engineering',
    url: siteUrl,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Babul Kumar Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Babul Kumar — AI / ML & Full-Stack Software Engineer',
    description: 'Computer Science student — AI / ML · Full Stack · Software Architecture',
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
                const theme = localStorage.getItem('theme') ?? 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch {}

              // Guard against third-party/extension/DevTools performance observer instrumentation bugs (e.g. web-vitals reportAllChanges 'startTime')
              if (typeof window !== 'undefined') {
                if (typeof window.PerformanceObserver === 'function') {
                  try {
                    const OrigPO = window.PerformanceObserver;
                    window.PerformanceObserver = class SafePerformanceObserver extends OrigPO {
                      constructor(callback) {
                        super(function(list, observer) {
                          try {
                            callback(list, observer);
                          } catch (err) {
                            if (err && (err.message || '').includes('startTime')) {
                              return;
                            }
                            throw err;
                          }
                        });
                      }
                    };
                    window.PerformanceObserver.prototype = OrigPO.prototype;
                  } catch {}
                }

                window.addEventListener('error', function(event) {
                  if (
                    event &&
                    event.message &&
                    (event.message.includes('startTime') || event.message.includes('reportAllChanges'))
                  ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
              }
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
