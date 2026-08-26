import Link from 'next/link'
import {
  getAdminDashboardStats,
  getAdminProjects,
  getAdminCertificates,
  getAdminTrainings,
  getAdminCoCurricularActivities,
  getAdminAchievements,
  getAdminExperience,
  getAdminSkills,
  getAdminProfile,
} from '@/lib/data'
import {
  Plus,
  FolderKanban,
  ScrollText,
  BookOpen,
  Trophy,
  Award,
  Briefcase,
  Wrench,
  Mail,
  Sparkles,
  Pencil,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Activity,
} from 'lucide-react'
import StatusBadge from '@/components/admin/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [stats, projects, certs, trainings, coCurricular, achievements, experience, skills, profile] =
    await Promise.all([
      getAdminDashboardStats(),
      getAdminProjects(),
      getAdminCertificates(),
      getAdminTrainings(),
      getAdminCoCurricularActivities(),
      getAdminAchievements(),
      getAdminExperience(),
      getAdminSkills(),
      getAdminProfile(),
    ])

  const publishedProjects = projects.filter((p) => p.published).length
  const publishedCerts = certs.filter((c) => c.published).length
  const publishedTrainings = trainings.filter((t) => t.published).length
  const publishedCoCurr = coCurricular.filter((a) => a.published).length
  const featuredProjects = projects.filter((p) => p.featured).length
  const featuredCerts = certs.filter((c) => c.featured).length
  const featuredTrainings = trainings.filter((t) => t.featured).length
  const featuredCoCurr = coCurricular.filter((a) => a.featured).length

  // Calculate dynamic Portfolio Health Score (0 - 100)
  let healthScore = 0
  if (profile?.name && profile?.bio) healthScore += 20
  if (projects.length >= 4) healthScore += 20
  if (certs.length >= 4) healthScore += 20
  if (skills.length >= 10) healthScore += 15
  if (experience.length >= 1) healthScore += 15
  if (achievements.length >= 1) healthScore += 10

  const statCards = [
    {
      label: 'Projects',
      value: stats.projects,
      subValue: `${publishedProjects} Live · ${featuredProjects} Featured`,
      href: '/admin/projects',
      icon: FolderKanban,
      accent: '#E45D2C',
      trend: '+100% Live',
    },
    {
      label: 'Certificates',
      value: stats.certificates,
      subValue: `${publishedCerts} Published · ${featuredCerts} Featured`,
      href: '/admin/certificates',
      icon: ScrollText,
      accent: '#FF8A3D',
      trend: 'AI Verified',
    },
    {
      label: 'Training',
      value: stats.trainings ?? trainings.length,
      subValue: `${publishedTrainings} Active · ${featuredTrainings} Featured`,
      href: '/admin/training',
      icon: BookOpen,
      accent: '#14B8A6',
      trend: 'Verified',
    },
    {
      label: 'Co-Curricular',
      value: stats.coCurricular ?? coCurricular.length,
      subValue: `${publishedCoCurr} Published · ${featuredCoCurr} Featured`,
      href: '/admin/co-curricular',
      icon: Trophy,
      accent: '#F59E0B',
      trend: 'Active',
    },
    {
      label: 'Technical Skills',
      value: stats.skills,
      subValue: 'Frontend, Backend, AI/ML',
      href: '/admin/skills',
      icon: Wrench,
      accent: '#3B82F6',
      trend: 'Active',
    },
    {
      label: 'Experience',
      value: stats.experience,
      subValue: 'Production roles & leadership',
      href: '/admin/experience',
      icon: Briefcase,
      accent: '#10B981',
      trend: 'Verified',
    },
    {
      label: 'Achievements',
      value: stats.achievements,
      subValue: 'Awards, Hackathons & Honors',
      href: '/admin/achievements',
      icon: Award,
      accent: '#EC4899',
      trend: 'Top Tier',
    },
    {
      label: 'Inquiries & Messages',
      value: stats.messages,
      subValue: stats.messages === 0 ? 'All messages read' : 'Unread contact forms',
      href: '/admin/settings',
      icon: Mail,
      accent: stats.messages > 0 ? '#EF4444' : '#6B7280',
      trend: stats.messages > 0 ? 'Needs Attention' : 'Clean',
    },
  ]

  const quickActions = [
    {
      title: 'Add Certificate with AI',
      desc: 'Instant multimodal Gemini parsing from PDF/Image',
      href: '/admin/certificates/new',
      icon: Sparkles,
      highlight: true,
      accent: '#C084FC',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.3)',
    },
    {
      title: 'Create Project',
      desc: 'Add case study with technologies and live preview',
      href: '/admin/projects/new',
      icon: Plus,
      highlight: false,
      accent: '#E45D2C',
      bg: 'rgba(228, 93, 44, 0.08)',
      border: 'rgba(228, 93, 44, 0.25)',
    },
    {
      title: 'Add Achievement',
      desc: 'Record hackathon wins and credentials',
      href: '/admin/achievements',
      icon: Award,
      highlight: false,
      accent: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    {
      title: 'Edit Profile & Bio',
      desc: 'Update avatar, title, social links, and bio',
      href: '/admin/profile',
      icon: Pencil,
      highlight: false,
      accent: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.08)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Welcome Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'rgba(228, 93, 44, 0.12)',
              border: '1px solid rgba(228, 93, 44, 0.28)',
              fontSize: '11px',
              color: '#E45D2C',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            <Zap size={12} /> System Command Center
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#F5F5F5',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Good day, Babul 👋
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#9CA3AF',
              marginTop: '6px',
              lineHeight: 1.5,
              margin: '6px 0 0',
            }}
          >
            Your portfolio CMS is fully synchronized with Supabase Storage and PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/certificates/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(228, 93, 44, 0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <Sparkles size={15} /> Add Certificate with AI
          </Link>

          <Link
            href="/admin/projects/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F5F5F5',
              textDecoration: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'border-color 0.15s',
            }}
          >
            <Plus size={15} /> Add Project
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics 6-Card Grid */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#6B7280',
            fontWeight: 600,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Activity size={13} style={{ color: '#E45D2C' }} /> Key Metrics & Live Records
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="admin-hover-card"
                  style={{
                    background: '#101318',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {stat.label}
                    </span>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.accent,
                      }}
                    >
                      <Icon size={15} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#F5F5F5',
                        lineHeight: 1,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      {stat.value.toString().padStart(2, '0')}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#10B981',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                      }}
                    >
                      {stat.trend}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6B7280',
                      marginTop: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stat.subValue}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 3. Quick Actions Hub + Portfolio Health Score */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Quick Action Tiles */}
        <div
          style={{
            background: '#101318',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8A8F98',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Fast Management Actions</span>
            <Sparkles size={13} style={{ color: '#C084FC' }} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {quickActions.map((action) => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="admin-quick-action-tile"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '8px',
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    textDecoration: 'none',
                    minHeight: '100px',
                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <ActionIcon size={18} style={{ color: action.accent }} />
                    <ArrowUpRight size={14} style={{ color: '#6B7280' }} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#F5F5F5',
                        marginBottom: '2px',
                      }}
                    >
                      {action.title}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#9CA3AF',
                        lineHeight: 1.3,
                      }}
                    >
                      {action.desc}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Portfolio Completeness & Health Meter */}
        <div
          style={{
            background: '#101318',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#8A8F98',
                  fontWeight: 600,
                }}
              >
                Portfolio Health & Completeness
              </span>
              <StatusBadge type="published" label={`${healthScore}% Complete`} />
            </div>

            {/* Health Bar */}
            <div
              style={{
                height: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${healthScore}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                  borderRadius: '9999px',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            {/* Component Checks Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#D1D5DB',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Projects Inventory
                </span>
                <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{projects.length} Active</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#D1D5DB',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Credentials & Certificates
                </span>
                <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{certs.length} Verified</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#D1D5DB',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Tech Skills & Matrix
                </span>
                <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{skills.length} Items</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#D1D5DB',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Work Experience & Academics
                </span>
                <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{experience.length + achievements.length} Records</span>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#8A8F98',
            }}
          >
            <span>Public Visibility: <strong>100% Live</strong></span>
            <Link
              href="/admin/profile"
              style={{ color: '#E45D2C', textDecoration: 'none', fontWeight: 600 }}
            >
              Update Profile Details →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Live Content Management Tables (Projects & Certificates) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Projects Preview Table */}
        <div
          style={{
            background: '#101318',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
                Featured Projects
              </h3>
              <p style={{ fontSize: '11px', color: '#8A8F98', marginTop: '2px', margin: 0 }}>
                {projects.length} projects in database
              </p>
            </div>
            <Link
              href="/admin/projects"
              style={{
                color: '#E45D2C',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Manage All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="admin-list-row-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#0D1015',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#F5F5F5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6B7280',
                      fontFamily: 'var(--font-mono, monospace)',
                      marginTop: '2px',
                    }}
                  >
                    /{p.slug} · {p.category}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <StatusBadge
                    type={p.published ? 'published' : 'draft'}
                    size="sm"
                  />
                  {p.featured && <StatusBadge type="featured" size="sm" />}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Certificates Preview Table */}
        <div
          style={{
            background: '#101318',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
                Certificates & Credentials
              </h3>
              <p style={{ fontSize: '11px', color: '#8A8F98', marginTop: '2px', margin: 0 }}>
                {certs.length} verified credentials
              </p>
            </div>
            <Link
              href="/admin/certificates"
              style={{
                color: '#E45D2C',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Manage All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certs.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/admin/certificates/${c.id}`}
                className="admin-list-row-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#0D1015',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#F5F5F5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6B7280',
                      marginTop: '2px',
                    }}
                  >
                    {c.issuer} · {c.category}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <StatusBadge
                    type={c.published ? 'published' : 'draft'}
                    size="sm"
                  />
                  {c.featured && <StatusBadge type="featured" size="sm" />}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .admin-hover-card:hover {
          border-color: rgba(255, 255, 255, 0.22) !important;
          background: #141822 !important;
          transform: translateY(-2px);
        }
        .admin-quick-action-tile:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }
        .admin-list-row-item:hover {
          border-color: rgba(255, 255, 255, 0.18) !important;
          background: #151922 !important;
        }
      `}</style>
    </div>
  )
}
