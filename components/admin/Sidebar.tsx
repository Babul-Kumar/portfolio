'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderKanban,
  ScrollText,
  BookOpen,
  Trophy,
  Award,
  GraduationCap,
  Briefcase,
  Wrench,
  User,
  Settings,
  LogOut,
  ChevronRight,
  X,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CONTENT MANAGEMENT',
    items: [
      { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { href: '/admin/certificates', label: 'Certificates', icon: ScrollText, badge: 'AI ✨' },
      { href: '/admin/training', label: 'Training', icon: BookOpen },
      { href: '/admin/co-curricular', label: 'Co-Curricular', icon: Trophy },
      { href: '/admin/achievements', label: 'Achievements', icon: Award },
      { href: '/admin/education', label: 'Education', icon: GraduationCap },
      { href: '/admin/experience', label: 'Experience', icon: Briefcase },
      { href: '/admin/skills', label: 'Skills', icon: Wrench },
    ],
  },
  {
    title: 'ACCOUNT & SYSTEM',
    items: [
      { href: '/admin/profile', label: 'Profile & Bio', icon: User },
      { href: '/admin/settings', label: 'Settings & Inquiries', icon: Settings },
    ],
  },
]

interface SidebarContentProps {
  pathname: string
  onClose?: () => void
  onLogout: () => void
}

function SidebarContent({ pathname, onClose, onLogout }: SidebarContentProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#090B0E',
        color: '#F5F5F5',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/admin/dashboard"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.04em',
              boxShadow: '0 0 16px rgba(228, 93, 44, 0.3)',
            }}
          >
            BK
          </div>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#F5F5F5',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans, system-ui)',
              }}
            >
              BABUL KUMAR
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#E45D2C',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: 'var(--font-mono, monospace)',
                marginTop: '1px',
              }}
            >
              PORTFOLIO CMS
            </div>
          </div>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {navSections.map((section) => (
          <div key={section.title}>
            <div
              style={{
                padding: '0 10px 8px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.12em',
                color: '#4B5563',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(({ href, label, icon: Icon, badge }) => {
                const active =
                  pathname === href ||
                  (href !== '/admin/dashboard' && pathname.startsWith(href))

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#FFFFFF' : '#9CA3AF',
                      background: active ? 'rgba(228, 93, 44, 0.14)' : 'transparent',
                      border: active
                        ? '1px solid rgba(228, 93, 44, 0.32)'
                        : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#13171F'
                        e.currentTarget.style.color = '#F5F5F5'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#9CA3AF'
                      }
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: active ? '#E45D2C' : '#6B7280',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>

                    {badge && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          background: 'rgba(228, 93, 44, 0.2)',
                          color: '#FF8A3D',
                          border: '1px solid rgba(228, 93, 44, 0.35)',
                        }}
                      >
                        {badge}
                      </span>
                    )}

                    {active && !badge && (
                      <ChevronRight size={13} style={{ color: '#E45D2C' }} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pinned Bottom Account / Status Area */}
      <div
        style={{
          padding: '16px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#07080B',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Status Indicator Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            background: '#101318',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
          }}
        >
          <span style={{ color: '#6B7280', fontWeight: 500 }}>Portfolio Status</span>
          <span
            style={{
              color: '#10B981',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10B981',
              }}
            />
            Live
          </span>
        </div>

        {/* User Card with Logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#F5F5F5',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Babul Kumar
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#6B7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              bk7321634@gmail.com
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9CA3AF'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.background = 'transparent'
            }}
            aria-label="Sign out"
            title="Sign out of admin session"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface AdminSidebarProps {
  mobileOpen?: boolean
  onToggleMobile?: () => void
}

export default function AdminSidebar({
  mobileOpen = false,
  onToggleMobile,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Sign out fallback
    }
    router.push('/admin/login')
  }

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 40,
        }}
        className="hidden lg:block"
      >
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer Navigation with Slide Over & Backdrop */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            animation: 'fadeInOverlay 0.2s ease-out',
          }}
          onClick={onToggleMobile}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.82)',
            }}
          />

          {/* Drawer Sidebar */}
          <aside
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              position: 'relative',
              zIndex: 101,
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '8px 0 32px rgba(0, 0, 0, 0.9)',
              animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              pathname={pathname}
              onClose={onToggleMobile}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
