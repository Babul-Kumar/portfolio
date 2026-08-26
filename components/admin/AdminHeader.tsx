'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ExternalLink,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void
}

function getBreadcrumbInfo(pathname: string) {
  if (pathname === '/admin' || pathname === '/admin/dashboard') {
    return { section: 'Overview', title: 'Dashboard' }
  }
  if (pathname === '/admin/projects') {
    return { section: 'Content', title: 'Projects' }
  }
  if (pathname === '/admin/projects/new') {
    return { section: 'Projects', title: 'Create Project' }
  }
  if (pathname.startsWith('/admin/projects/')) {
    return { section: 'Projects', title: 'Edit Project' }
  }
  if (pathname === '/admin/certificates') {
    return { section: 'Content', title: 'Certificates & Credentials' }
  }
  if (pathname === '/admin/certificates/new') {
    return { section: 'Certificates', title: 'Add with Gemini AI' }
  }
  if (pathname.startsWith('/admin/certificates/')) {
    return { section: 'Certificates', title: 'Edit Certificate' }
  }
  if (pathname === '/admin/training') {
    return { section: 'Content', title: 'Training & Workshops' }
  }
  if (pathname === '/admin/training/new') {
    return { section: 'Training', title: 'Add Training Program' }
  }
  if (pathname.startsWith('/admin/training/')) {
    return { section: 'Training', title: 'Edit Training Program' }
  }
  if (pathname === '/admin/co-curricular') {
    return { section: 'Content', title: 'Co-Curricular Activities' }
  }
  if (pathname === '/admin/co-curricular/new') {
    return { section: 'Co-Curricular', title: 'Add Activity' }
  }
  if (pathname.startsWith('/admin/co-curricular/')) {
    return { section: 'Co-Curricular', title: 'Edit Activity' }
  }
  if (pathname === '/admin/achievements') {
    return { section: 'Content', title: 'Achievements & Awards' }
  }
  if (pathname === '/admin/education') {
    return { section: 'Content', title: 'Education & Academics' }
  }
  if (pathname === '/admin/experience') {
    return { section: 'Content', title: 'Work Experience' }
  }
  if (pathname === '/admin/skills') {
    return { section: 'Content', title: 'Technical Skills' }
  }
  if (pathname === '/admin/profile') {
    return { section: 'Account', title: 'Profile & Bio' }
  }
  if (pathname === '/admin/settings') {
    return { section: 'System', title: 'Settings & Inquiries' }
  }
  return { section: 'Admin', title: 'Management' }
}

export default function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { section, title } = getBreadcrumbInfo(pathname)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Signout fallback
    }
    router.push('/admin/login')
  }

  return (
    <header
      style={{
        height: '60px',
        background: 'rgba(10, 12, 16, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden"
          style={{
            background: '#13171F',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '6px',
            color: '#F5F5F5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Contextual Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B7280',
              fontWeight: 500,
            }}
          >
            {section}
          </span>
          <span style={{ color: '#4B5563', fontSize: '12px' }}>/</span>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#F5F5F5',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Right Actions & User Profile Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live System Status Pill */}
        <div
          className="hidden sm:flex"
          style={{
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.22)',
            fontSize: '11px',
            color: '#10B981',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #10B981',
            }}
          />
          Live Portfolio
        </div>

        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#13171F',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#D1D5DB',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = '#D1D5DB'
          }}
        >
          <span>View Site</span>
          <ExternalLink size={12} style={{ color: '#9CA3AF' }} />
        </Link>

        {/* Admin Profile Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '4px 8px 4px 6px',
              cursor: 'pointer',
              color: '#F5F5F5',
              transition: 'all 0.15s',
            }}
            aria-expanded={userDropdownOpen}
            aria-label="Admin user menu"
          >
            {/* Avatar Initials */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              BK
            </div>
            <span
              className="hidden md:inline"
              style={{ fontSize: '12px', fontWeight: 500, color: '#E5E7EB' }}
            >
              Babul Kumar
            </span>
            <ChevronDown size={13} style={{ color: '#6B7280' }} />
          </button>

          {/* Dropdown Panel */}
          {userDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '220px',
                background: '#13171F',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.8)',
                padding: '6px',
                zIndex: 50,
                animation: 'headerDropdown 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '8px 10px 10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '4px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5' }}>
                  Babul Kumar
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  bk7321634@gmail.com
                </div>
              </div>

              <Link
                href="/admin/profile"
                onClick={() => setUserDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  color: '#D1D5DB',
                  textDecoration: 'none',
                  fontSize: '12px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1E232E')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={14} style={{ color: '#9CA3AF' }} />
                Profile & Bio
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setUserDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  color: '#D1D5DB',
                  textDecoration: 'none',
                  fontSize: '12px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1E232E')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Settings size={14} style={{ color: '#9CA3AF' }} />
                Settings & Inquiries
              </Link>

              <div
                style={{
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  margin: '4px 0',
                }}
              />

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes headerDropdown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}
