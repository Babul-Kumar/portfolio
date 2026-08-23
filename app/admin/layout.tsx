import type { Metadata } from 'next'
import AdminLayoutShell from '@/components/admin/AdminLayoutShell'

export const metadata: Metadata = {
  title: 'Admin Dashboard — Babul Kumar',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>
}
