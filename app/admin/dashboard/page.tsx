import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  const [
    { count: projects },
    { count: certificates },
    { count: achievements },
    { count: messages },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
    supabase.from('achievements').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
  ])
  return { projects, certificates, achievements, messages }
}

async function getRecentActivity() {
  const supabase = await createClient()
  const [{ data: recentProjects }, { data: recentCerts }] = await Promise.all([
    supabase.from('projects').select('id, title, created_at, published').order('created_at', { ascending: false }).limit(5),
    supabase.from('certificates').select('id, title, created_at, published').order('created_at', { ascending: false }).limit(5),
  ])
  return { recentProjects: recentProjects ?? [], recentCerts: recentCerts ?? [] }
}

const cardStyle = {
  background: '#1A1A1A',
  border: '1px solid #222',
  borderRadius: '10px',
  padding: '24px',
}

const labelStyle = {
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#555',
  marginBottom: '8px',
}

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()])

  const statCards = [
    { label: 'Projects', value: stats.projects ?? 0, href: '/admin/projects' },
    { label: 'Certificates', value: stats.certificates ?? 0, href: '/admin/certificates' },
    { label: 'Achievements', value: stats.achievements ?? 0, href: '/admin/achievements' },
    { label: 'Unread Messages', value: stats.messages ?? 0, href: '/admin/settings' },
  ]

  const quickActions = [
    { label: 'Add Project', href: '/admin/projects/new' },
    { label: 'Add Certificate', href: '/admin/certificates/new' },
    { label: 'Add Achievement', href: '/admin/achievements/new' },
    { label: 'Edit Profile', href: '/admin/profile' },
  ]

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#555' }}>
          Manage your portfolio content
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            <div
              className="admin-stat-card"
              style={{
                ...cardStyle,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={labelStyle}>{stat.label}</div>
              <div style={{ fontSize: '36px', fontWeight: 500, color: '#F5F5F5', lineHeight: 1 }}>
                {stat.value.toString().padStart(2, '0')}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
      }}>
        {/* Quick Actions */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '16px' }}>Quick Actions</div>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="admin-link-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 0',
                borderBottom: '1px solid #1E1E1E',
                textDecoration: 'none',
                color: '#888',
                fontSize: '13px',
                transition: 'color 0.15s',
              }}
            >
              <Plus size={14} style={{ color: '#B65C3A' }} />
              {action.label}
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '16px' }}>Recent Uploads</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>Projects</div>
              {activity.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/projects/${p.id}`}
                  className="admin-link-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 0',
                    borderBottom: '1px solid #1E1E1E',
                    textDecoration: 'none',
                    color: '#888',
                    fontSize: '12px',
                    transition: 'color 0.15s',
                  }}
                >
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: p.published ? '#4A7C59' : '#555',
                    flexShrink: 0,
                  }} />
                  {p.title}
                </Link>
              ))}
              {activity.recentProjects.length === 0 && (
                <p style={{ fontSize: '12px', color: '#444' }}>No projects yet</p>
              )}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>Certificates</div>
              {activity.recentCerts.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/certificates/${c.id}`}
                  className="admin-link-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 0',
                    borderBottom: '1px solid #1E1E1E',
                    textDecoration: 'none',
                    color: '#888',
                    fontSize: '12px',
                    transition: 'color 0.15s',
                  }}
                >
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: c.published ? '#4A7C59' : '#555',
                    flexShrink: 0,
                  }} />
                  {c.title}
                </Link>
              ))}
              {activity.recentCerts.length === 0 && (
                <p style={{ fontSize: '12px', color: '#444' }}>No certificates yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-stat-card:hover {
          border-color: #333 !important;
        }
        .admin-link-hover:hover {
          color: #F5F5F5 !important;
        }
      `}</style>
    </div>
  )
}
