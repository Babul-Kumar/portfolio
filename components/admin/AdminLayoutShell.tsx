'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from './Sidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <div className="admin-body" style={{ minHeight: '100vh', background: '#08090C' }}>{children}</div>
  }

  return (
    <div
      className="admin-body"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#07080B',
        color: '#F5F5F5',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      {/* Sidebar (Desktop sticky & Mobile Drawer) */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#080A0E',
        }}
      >
        {/* Top Sticky Application Header */}
        <AdminHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main
          style={{
            flex: 1,
            padding: 'clamp(20px, 3.5vw, 36px)',
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
