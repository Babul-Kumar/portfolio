'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Code2,
  GraduationCap,
  Award,
  Users,
  Send,
  FileText,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Terminal,
  ExternalLink,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react'
import { sound } from '@/lib/audio'

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export interface PaletteItem {
  id: string
  title: string
  subtitle: string
  category: 'NAVIGATION' | 'PROJECTS' | 'SYSTEM ACTIONS'
  icon: typeof Search
  action: () => void
  shortcut?: string
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenTerminal,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenTerminal?: () => void
}) {
  const router = useRouter()
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [sfxActive, setSfxActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSfxActive(sound.isEnabled())
  }, [isOpen])

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      sound.playChirp()
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Toggle Theme Helper
  const handleToggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    sound.playClick(840)
    onClose()
  }, [onClose])

  // Toggle Audio Helper
  const handleToggleAudio = useCallback(() => {
    const next = sound.toggle()
    setSfxActive(next)
  }, [])

  // Copy Email Helper
  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText('babulkumar.dev@gmail.com').catch(() => {})
    sound.playChirp()
    onClose()
  }, [onClose])

  // Static Registry of Palette Items
  const items: PaletteItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-about',
        title: 'About Babul Kumar',
        subtitle: 'Profile, Lovely Professional University education & engineering philosophy',
        category: 'NAVIGATION',
        icon: GraduationCap,
        action: () => {
          router.push('/about')
          onClose()
        },
      },
      {
        id: 'nav-work',
        title: 'Work & Flagship Projects',
        subtitle: 'Production code, AST-aware agents, ML models & interactive case studies',
        category: 'NAVIGATION',
        icon: Code2,
        action: () => {
          router.push('/work')
          onClose()
        },
      },
      {
        id: 'nav-certs',
        title: 'Verified Certificates Gallery',
        subtitle: 'Authentic credentials in AI/ML, Cloud, and Software Engineering',
        category: 'NAVIGATION',
        icon: Award,
        action: () => {
          router.push('/certificates')
          onClose()
        },
      },
      {
        id: 'nav-training',
        title: 'Industrial Training Programs',
        subtitle: 'Specialized bootcamps & institutional technical training',
        category: 'NAVIGATION',
        icon: Users,
        action: () => {
          router.push('/training')
          onClose()
        },
      },
      {
        id: 'nav-cocurr',
        title: 'Co-Curricular & Hackathons',
        subtitle: 'National conclaves, competitive programming & student leadership',
        category: 'NAVIGATION',
        icon: Sparkles,
        action: () => {
          router.push('/co-curricular')
          onClose()
        },
      },
      {
        id: 'nav-resume',
        title: 'Curriculum Vitae / Resume',
        subtitle: 'Inspect credentials or download verified PDF format',
        category: 'NAVIGATION',
        icon: FileText,
        action: () => {
          router.push('/resume')
          onClose()
        },
      },
      {
        id: 'nav-contact',
        title: 'Contact Dispatch Terminal',
        subtitle: 'Send direct dispatch for SDE & Applied AI/ML opportunities',
        category: 'NAVIGATION',
        icon: Send,
        action: () => {
          router.push('/contact')
          onClose()
        },
      },

      // Flagship Projects
      {
        id: 'proj-botbro',
        title: 'BotBro: Local AI Desktop Orchestrator',
        subtitle: '18 Win32 subsystem bindings & AST code guardrails',
        category: 'PROJECTS',
        icon: Terminal,
        action: () => {
          router.push('/work/botbro-local-ai-desktop-orchestration-system')
          onClose()
        },
      },
      {
        id: 'proj-flight',
        title: 'Flight Delay Prediction System',
        subtitle: '94.2% ROC-AUC gradient-boosted ensemble ML pipeline',
        category: 'PROJECTS',
        icon: Code2,
        action: () => {
          router.push('/work/flight-delay-prediction-system')
          onClose()
        },
      },
      {
        id: 'proj-monitor',
        title: 'Smart System Monitor & Paging Profiler',
        subtitle: 'Low-overhead real-time hardware telemetry and memory paging engine',
        category: 'PROJECTS',
        icon: Code2,
        action: () => {
          router.push('/work/smart-system-monitor')
          onClose()
        },
      },
      {
        id: 'proj-steg',
        title: 'Steganography Detector & Forensic Vision',
        subtitle: 'Image artifact deep forensic analysis & hidden bit extraction',
        category: 'PROJECTS',
        icon: Code2,
        action: () => {
          router.push('/work/steganography-detector')
          onClose()
        },
      },

      // System Actions
      {
        id: 'act-terminal',
        title: 'Open Interactive Cyber Shell',
        subtitle: 'Execute live interactive terminal commands (whoami, help, projects, skills)',
        category: 'SYSTEM ACTIONS',
        icon: Terminal,
        shortcut: 'T',
        action: () => {
          onClose()
          if (onOpenTerminal) onOpenTerminal()
        },
      },
      {
        id: 'act-theme',
        title: 'Toggle Theme (Dark / Light)',
        subtitle: 'Switch between Obsidian Dark and Warm Swiss Paper mode',
        category: 'SYSTEM ACTIONS',
        icon: Moon,
        shortcut: 'M',
        action: handleToggleTheme,
      },
      {
        id: 'act-audio',
        title: `Toggle Synthesized Micro-Haptics (${sfxActive ? 'ENABLED' : 'MUTED'})`,
        subtitle: 'Native Web Audio mechanical clicks and interface feedback',
        category: 'SYSTEM ACTIONS',
        icon: sfxActive ? Volume2 : VolumeX,
        shortcut: 'S',
        action: handleToggleAudio,
      },
      {
        id: 'act-email',
        title: 'Copy Email to Clipboard',
        subtitle: 'babulkumar.dev@gmail.com',
        category: 'SYSTEM ACTIONS',
        icon: Send,
        action: handleCopyEmail,
      },
    ],
    [router, onClose, onOpenTerminal, handleToggleTheme, handleToggleAudio, handleCopyEmail, sfxActive]
  )

  // Filter items matching query
  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [items, query])

  // Keyboard navigation inside menu
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = (i + 1) % filtered.length
          sound.playHover(600)
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = (i - 1 + filtered.length) % filtered.length
          sound.playHover(600)
          return next
        })
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          sound.playClick(720)
          filtered[selectedIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Navigation Menu"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: isLight ? 'rgba(18, 17, 16, 0.42)' : 'rgba(5, 7, 10, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(60px, 14vh, 120px)',
        paddingLeft: '16px',
        paddingRight: '16px',
        animation: 'paletteFadeIn 180ms ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md, 10px)',
          boxShadow: isLight
            ? '0 20px 50px rgba(18, 17, 16, 0.12), 0 0 1px rgba(18, 17, 16, 0.18), 0 0 24px rgba(212, 72, 28, 0.08)'
            : '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(228, 93, 44, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            background: isLight ? 'var(--color-surface-2)' : 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <Search size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command or search portfolio..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-text)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: '8px',
            flex: 1,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              No matching commands or routes found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    sound.playClick(720)
                    item.action()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: isSelected
                      ? isLight
                        ? 'rgba(212, 72, 28, 0.07)'
                        : 'var(--color-surface-2)'
                      : 'transparent',
                    border: isSelected ? '1px solid var(--color-border-hover)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    marginBottom: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: isSelected
                          ? 'var(--color-accent-bg)'
                          : isLight
                            ? 'var(--color-surface-2)'
                            : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isSelected ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)',
                          marginBottom: '2px',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.shortcut && (
                      <kbd
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isLight ? 'var(--color-surface-3)' : 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '9.5px',
                        letterSpacing: '0.06em',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      size={13}
                      color={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                      style={{
                        transform: isSelected ? 'translateX(2px)' : 'none',
                        transition: 'transform 150ms ease',
                      }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid var(--color-border)',
            background: isLight ? 'var(--color-surface-2)' : 'rgba(0, 0, 0, 0.25)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: sfxActive ? '#10B981' : '#6B7280',
              }}
            />
            <span>SFX: {sfxActive ? 'ON' : 'MUTED'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes paletteFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
