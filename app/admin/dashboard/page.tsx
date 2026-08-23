import Link from 'next/link'
import {
  getAdminDashboardStats,
  getAdminProjects,
  getAdminCertificates,
} from '@/lib/data'
import {
  Plus,
  FolderKanban,
  ScrollText,
  Award,
  GraduationCap,
  Briefcase,
  Wrench,
  Mail,
  Sparkles,
  ExternalLink,
  Pencil,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const cardStyle = {
  background: '#1A1A1A',
  border: '1px solid #222',
  borderRadius: '10px',
  padding: '20px 24px',
}

const labelStyle = {
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#666',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export default async function AdminDashboardPage() {
  const [stats, projects, certs] = await Promise.all([
    getAdminDashboardStats(),
    getAdminProjects(),
    getAdminCertificates(),
  ])

  const statCards = [
    { label: 'Projects', value: stats.projects, href: '/admin/projects', icon: FolderKanban },
    { label: 'Certificates', value: stats.certificates, href: '/admin/certificates', icon: ScrollText },
    { label: 'Achievements', value: stats.achievements, href: '/admin/achievements', icon: Award },
    { label: 'Education', value: stats.education, href: '/admin/education', icon: GraduationCap },
    { label: 'Experience', value: stats.experience, href: '/admin/experience', icon: Briefcase },
    { label: 'Skills', value: stats.skills, href: '/admin/skills', icon: Wrench },
    { label: 'Unread Messages', value: stats.messages, href: '/admin/settings', icon: Mail },
  ]

  const quickActions = [
    { label: 'Add Project', href: '/admin/projects/new', icon: Plus },
    { label: 'Add Certificate with AI', href: '/admin/certificates/new', icon: Sparkles, highlight: true },
    { label: 'Add Achievement', href: '/admin/achievements', icon: Plus },
    { label: 'Edit Profile & Bio', href: '/admin/profile', icon: Pencil },
  ]

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Portfolio CMS Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#666' }}>
            Single source of truth for your public portfolio and credentials
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1E1E1E',
              border: '1px solid #2C2C2C',
              color: '#DDD',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              transition: 'all 0.15s',
            }}
          >
            <ExternalLink size={13} /> View Live Website
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '36px',
        }}
      >
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
              <div
                className="admin-stat-card"
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '100%',
                }}
              >
                <div style={labelStyle}>
                  <span>{stat.label}</span>
                  <Icon size={14} style={{ color: '#555' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#F5F5F5', lineHeight: 1, fontFamily: 'monospace' }}>
                  {stat.value.toString().padStart(2, '0')}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions + Recent Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1fr) minmax(400px, 2fr)',
          gap: '24px',
        }}
      >
        {/* Quick Actions */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '16px' }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickActions.map((action) => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="admin-link-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: action.highlight ? 'rgba(228, 93, 44, 0.1)' : '#141414',
                    border: action.highlight ? '1px solid rgba(228, 93, 44, 0.3)' : '1px solid #222',
                    textDecoration: 'none',
                    color: action.highlight ? '#E45D2C' : '#DDD',
                    fontSize: '13px',
                    fontWeight: action.highlight ? 500 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  <ActionIcon size={15} style={{ color: action.highlight ? '#E45D2C' : '#B65C3A' }} />
                  {action.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Live Records in CMS */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '16px' }}>
            <span>Active Content Overview</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Projects list */}
            <div>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Projects ({projects.length})</span>
                <Link href="/admin/projects" style={{ color: '#E45D2C', fontSize: '11px', textDecoration: 'none' }}>
                  Manage →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {projects.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/projects/${p.id}`}
                    className="admin-link-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: '#141414',
                      border: '1px solid #1F1F1F',
                      textDecoration: 'none',
                      color: '#AAA',
                      fontSize: '12px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: p.published ? '#4A7C59' : '#555',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Certificates list */}
            <div>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Certificates ({certs.length})</span>
                <Link href="/admin/certificates" style={{ color: '#E45D2C', fontSize: '11px', textDecoration: 'none' }}>
                  Manage →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {certs.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/certificates/${c.id}`}
                    className="admin-link-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: '#141414',
                      border: '1px solid #1F1F1F',
                      textDecoration: 'none',
                      color: '#AAA',
                      fontSize: '12px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: c.published ? '#4A7C59' : '#555',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-stat-card:hover {
          border-color: #383838 !important;
          background: #202020 !important;
        }
        .admin-link-hover:hover {
          color: #FFF !important;
          border-color: #383838 !important;
        }
      `}</style>
    </div>
  )
}
