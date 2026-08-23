'use client'

import AdminSidebar from './Sidebar'
import { usePathname } from 'next/navigation'

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <div className="admin-body" style={{ minHeight: '100vh' }}>{children}</div>
  }

  return (
    <div
      className="admin-body"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0F0F0F',
        color: '#F5F5F5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          maxWidth: '100%',
        }}
      >
        {children}
      </main>
    </div>
  )
}
