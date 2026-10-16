'use client'

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, CornerDownLeft } from 'lucide-react'
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

interface TerminalHistoryItem {
  type: 'input' | 'output' | 'error' | 'system'
  text: string
}

const INITIAL_GREETING: TerminalHistoryItem[] = [
  { type: 'system', text: 'BABUL KUMAR // CYBERNETIC DEVELOPER SHELL v2.4.0' },
  { type: 'system', text: 'Type "help" to view supported commands, or click quick actions below.' },
]

export default function CyberTerminalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'
  const [history, setHistory] = useState<TerminalHistoryItem[]>(INITIAL_GREETING)
  const [inputVal, setInputVal] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [isMaximized, setIsMaximized] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      sound.playChirp()
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = useCallback(
    (rawCmd: string) => {
      const trimmed = rawCmd.trim()
      if (!trimmed) return

      sound.playClick(640)
      setCmdHistory((prev) => [trimmed, ...prev])
      setHistoryIndex(-1)

      const args = trimmed.split(' ')
      const command = args[0].toLowerCase()

      const newEntries: TerminalHistoryItem[] = [{ type: 'input', text: `babul@terminal:~$ ${trimmed}` }]

      switch (command) {
        case 'help':
          newEntries.push(
            { type: 'output', text: 'AVAILABLE SYSTEM COMMANDS:' },
            { type: 'output', text: '  whoami    - Displays engineer profile & academic foundation' },
            { type: 'output', text: '  projects  - Lists flagship engineering projects with links' },
            { type: 'output', text: '  skills    - Formatted matrix of core languages and tools' },
            { type: 'output', text: '  contact   - Dispatches communication channels & email' },
            { type: 'output', text: '  theme     - Toggles between Obsidian Dark and Swiss Light theme' },
            { type: 'output', text: '  sfx       - Toggles synthesized audio micro-haptics' },
            { type: 'output', text: '  date      - Displays current local time & time zone' },
            { type: 'output', text: '  clear     - Clears the terminal screen buffer' },
            { type: 'output', text: '  exit      - Closes the cyber terminal' }
          )
          break

        case 'whoami':
          newEntries.push(
            { type: 'output', text: 'IDENTITY: Babul Kumar' },
            { type: 'output', text: 'EDUCATION: B.Tech in Computer Science & Engineering (2024 — 2028)' },
            { type: 'output', text: 'INSTITUTION: Lovely Professional University (LPU), Punjab, India' },
            { type: 'output', text: 'FOCUS: Autonomous AI Agents, Machine Learning, Full-Stack Architecture' },
            { type: 'output', text: 'TARGET ROLES: Software Development Engineer (SDE) & Applied AI/ML' }
          )
          break

        case 'projects':
          newEntries.push(
            { type: 'output', text: 'FLAGSHIP PRODUCTION SYSTEMS:' },
            { type: 'output', text: '  [01] BotBro — Local AI Desktop Orchestration Engine (18 Win32 hooks)' },
            { type: 'output', text: '       URL: /work/botbro-local-ai-desktop-orchestration-system' },
            { type: 'output', text: '  [02] Flight Delay Prediction System (94.2% ROC-AUC Ensemble)' },
            { type: 'output', text: '       URL: /work/flight-delay-prediction-system' },
            { type: 'output', text: '  [03] Smart System Monitor (Kernel Paging Profiler, <1.2% CPU)' },
            { type: 'output', text: '       URL: /work/smart-system-monitor' },
            { type: 'output', text: '  [04] Steganography Detector & Forensic Vision' },
            { type: 'output', text: '       URL: /work/steganography-detector' },
            { type: 'output', text: '  [05] Efficient Page Replacement Algorithm Simulator' },
            { type: 'output', text: '       URL: /work/efficient-page-replacement-algorithm-simulator' }
          )
          break

        case 'skills':
          newEntries.push(
            { type: 'output', text: 'CORE CAPABILITIES MATRIX:' },
            { type: 'output', text: '  LANGUAGES:   Python, C++, JavaScript (ES2024), TypeScript, SQL' },
            { type: 'output', text: '  AI / ML:     Scikit-learn, XGBoost, Random Forests, Ollama, Prompt Engineering' },
            { type: 'output', text: '  WEB STACK:   Next.js 16 (App Router), React 19, FastAPI, Node.js' },
            { type: 'output', text: '  DATA & CLOUD:PostgreSQL, Supabase (RLS), Git/GitHub, Vercel' }
          )
          break

        case 'contact':
          newEntries.push(
            { type: 'output', text: 'CONTACT INFORMATION:' },
            { type: 'output', text: '  EMAIL:     babulkumar0220@gmail.com' },
            { type: 'output', text: '  GITHUB:    https://github.com/babul-kumar' },
            { type: 'output', text: '  LINKEDIN:  https://linkedin.com/in/babul-kumar2007' },
            { type: 'output', text: '  PAGE:      Visit /contact to get in touch' }
          )
          break

        case 'theme': {
          const current = document.documentElement.getAttribute('data-theme')
          const next = current === 'light' ? 'dark' : 'light'
          localStorage.setItem('theme', next)
          document.documentElement.setAttribute('data-theme', next)
          newEntries.push({ type: 'system', text: `Theme switched to: ${next.toUpperCase()}` })
          break
        }

        case 'sfx': {
          const enabled = sound.toggle()
          newEntries.push({ type: 'system', text: `Audio micro-haptics: ${enabled ? 'ENABLED' : 'MUTED'}` })
          break
        }

        case 'date': {
          const d = new Date()
          newEntries.push({ type: 'output', text: `LOCAL TIME: ${d.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})` })
          break
        }

        case 'clear':
          setHistory([])
          setInputVal('')
          return

        case 'exit':
          onClose()
          return

        default:
          newEntries.push({
            type: 'error',
            text: `command not found: "${trimmed}". Type "help" to list available commands.`,
          })
          break
      }

      setHistory((prev) => [...prev, ...newEntries])
      setInputVal('')
    },
    [onClose]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(inputVal)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const nextIndex = Math.min(cmdHistory.length - 1, historyIndex + 1)
        setHistoryIndex(nextIndex)
        setInputVal(cmdHistory[nextIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1
        setHistoryIndex(nextIndex)
        setInputVal(cmdHistory[nextIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputVal('')
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Developer Cyber Shell"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: isLight ? 'rgba(18, 17, 16, 0.45)' : 'rgba(5, 7, 10, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'terminalFadeIn 200ms ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMaximized ? '96vw' : '760px',
          height: isMaximized ? '92vh' : '520px',
          background: isLight ? '#FFFFFF' : '#070A0F',
          border: isLight ? '1px solid rgba(13, 122, 112, 0.35)' : '1px solid rgba(20, 184, 166, 0.35)',
          borderRadius: 'var(--radius-md, 10px)',
          boxShadow: isLight
            ? '0 25px 60px rgba(18, 17, 16, 0.18), 0 0 1px rgba(18, 17, 16, 0.25), 0 0 32px rgba(13, 122, 112, 0.1)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 32px rgba(20, 184, 166, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 220ms ease',
        }}
      >
        {/* Terminal Titlebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: isLight ? 'rgba(13, 122, 112, 0.08)' : 'rgba(20, 184, 166, 0.08)',
            borderBottom: isLight ? '1px solid rgba(13, 122, 112, 0.2)' : '1px solid rgba(20, 184, 166, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: isLight ? '#0D7A70' : '#14B8A6',
                fontWeight: 600,
                letterSpacing: '0.08em',
                marginLeft: '8px',
              }}
            >
              babul@portfolio:~ (zsh)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsMaximized((m) => !m)}
              aria-label="Toggle terminal maximize"
              style={{
                background: 'transparent',
                border: 'none',
                color: isLight ? '#4B5563' : '#9CA3AF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close terminal"
              style={{
                background: 'transparent',
                border: 'none',
                color: isLight ? '#4B5563' : '#9CA3AF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: isLight ? 'var(--color-surface-2)' : 'rgba(0, 0, 0, 0.3)',
            borderBottom: isLight ? '1px solid var(--color-border)' : '1px solid rgba(255, 255, 255, 0.05)',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isLight ? '#6B7280' : '#9CA3AF' }}>QUICK:</span>
          {['help', 'whoami', 'projects', 'skills', 'contact', 'date', 'clear'].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => executeCommand(cmd)}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10.5px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: isLight ? 'rgba(13, 122, 112, 0.08)' : 'rgba(20, 184, 166, 0.1)',
                border: isLight ? '1px solid rgba(13, 122, 112, 0.25)' : '1px solid rgba(20, 184, 166, 0.3)',
                color: isLight ? '#0D7A70' : '#14B8A6',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Output Console Buffer */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12.5px',
            lineHeight: 1.6,
            background: isLight ? '#FAF9F6' : '#070A0F',
            color: isLight ? '#121110' : '#E5E7EB',
          }}
        >
          {history.map((item, index) => {
            let color = isLight ? '#374151' : '#D1D5DB'
            if (item.type === 'input') color = isLight ? '#0369A1' : '#38BDF8'
            if (item.type === 'error') color = isLight ? '#DC2626' : '#F87171'
            if (item.type === 'system') color = isLight ? '#B45309' : '#F59E0B'
            return (
              <div key={index} style={{ color, marginBottom: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.text}
              </div>
            )
          })}
        </div>

        {/* Interactive CLI Input Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: isLight ? '#FFFFFF' : '#040609',
            borderTop: isLight ? '1px solid rgba(13, 122, 112, 0.25)' : '1px solid rgba(20, 184, 166, 0.2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12.5px',
              color: isLight ? '#0D7A70' : '#10B981',
              fontWeight: 700,
              marginRight: '8px',
              flexShrink: 0,
            }}
          >
            babul@portfolio:~$
          </span>

          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12.5px',
              color: isLight ? '#121110' : '#FFFFFF',
            }}
          />

          <button
            type="button"
            onClick={() => executeCommand(inputVal)}
            aria-label="Submit command"
            style={{
              background: 'transparent',
              border: 'none',
              color: isLight ? '#0D7A70' : '#14B8A6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes terminalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
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
