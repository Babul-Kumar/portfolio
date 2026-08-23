'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderKanban,
  Award,
  GraduationCap,
  Briefcase,
  Wrench,
  User,
  Settings,
  LogOut,
  ScrollText,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/certificates', label: 'Certificates', icon: ScrollText },
  { href: '/admin/achievements', label: 'Achievements', icon: Award },
  { href: '/admin/education', label: 'Education', icon: GraduationCap },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase },
  { href: '/admin/skills', label: 'Skills', icon: Wrench },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface SidebarContentProps {
  pathname: string
  onClose?: () => void
  onLogout: () => void
}

function SidebarContent({ pathname, onClose, onLogout }: SidebarContentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1E1E1E' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase' }}>
          BABUL KUMAR
        </div>
        <div
          style={{
            fontSize: '10px',
            color: '#444',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          CMS Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '6px',
                marginBottom: '2px',
                fontSize: '13px',
                color: active ? '#F5F5F5' : '#666',
                background: active ? '#1A1A1A' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                borderLeft: active ? '2px solid #E45D2C' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#F5F5F5'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#666'
              }}
            >
              <Icon size={15} style={{ color: active ? '#E45D2C' : 'inherit' }} />
              {label}
              {active && <ChevronRight size={12} style={{ marginLeft: 'auto', color: '#E45D2C' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1E1E1E' }}>
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#555',
            textDecoration: 'none',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '12px' }}>↗</span> View Site
        </Link>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#555',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E45D2C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: '220px',
          minWidth: '220px',
          background: '#111',
          borderRight: '1px solid #1E1E1E',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
        className="admin-sidebar-desktop"
      >
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          background: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          color: '#F5F5F5',
          display: 'none',
        }}
        className="admin-sidebar-toggle"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            style={{
              width: '240px',
              background: '#111',
              height: '100%',
              borderRight: '1px solid #1E1E1E',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </>
  )
}
