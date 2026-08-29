import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
  Globe,
  ExternalLink,
} from 'lucide-react'
import StatusBadge from '@/components/admin/StatusBadge'
import VisitorContactInquiries from '@/components/admin/VisitorContactInquiries'
import SyncNowButton from '@/components/admin/SyncNowButton'
import {
  FAKE_TRAINING_SLUGS,
  FAKE_CO_CURRICULAR_SLUGS,
  FAKE_ACHIEVEMENT_SLUGS,
  REAL_PORTFOLIO_PROJECTS,
} from '@/lib/data'
import type { ContactMessage } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Permanently remove duplicate short slugs and fake seed records
  try {
    await Promise.allSettled([
      supabase.from('projects').delete().in('slug', ['botbro', 'flight-delay-prediction']),
      supabase.from('training').delete().in('slug', FAKE_TRAINING_SLUGS),
      supabase.from('co_curricular_activities').delete().in('slug', FAKE_CO_CURRICULAR_SLUGS),
      supabase.from('achievements').delete().in('slug', FAKE_ACHIEVEMENT_SLUGS),
    ])
  } catch {
    // Non-blocking cleanup
  }

  // 2. Ensure all genuine portfolio projects are restored in Supabase if missing
  try {
    const { data: currentProjects } = await supabase.from('projects').select('slug')
    const currentSlugs = new Set((currentProjects ?? []).map((p) => p.slug))

    for (const proj of REAL_PORTFOLIO_PROJECTS) {
      if (!currentSlugs.has(proj.slug)) {
        const copy = { ...proj } as Record<string, unknown>
        delete copy.id
        delete copy.created_at
        delete copy.updated_at
        await supabase.from('projects').insert(copy)
      }
    }

    // Synchronize profile resume_url with site_settings if missing
    const { data: resumeSetting } = await supabase.from('site_settings').select('value').eq('key', 'resume_url').maybeSingle()
    if (resumeSetting?.value) {
      await supabase.from('profiles').update({ resume_url: resumeSetting.value }).is('resume_url', null)
    }
  } catch {
    // Non-blocking restoration
  }

  // 2. Fetch live data directly from database in parallel with exact fields
  const [
    { data: rawProjects },
    { data: rawCerts },
    { data: rawTrainings },
    { data: rawCoCurr },
    { data: rawAchievements },
    { data: rawExperience },
    { data: rawSkills },
    { data: rawProfile },
    { data: messagesData },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, slug, category, published, featured, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('certificates')
      .select('id, title, issuer, category, published, featured, issue_date')
      .order('issue_date', { ascending: false }),
    supabase
      .from('training')
      .select('id, title, slug, provider, organization, category, published, featured, display_order')
      .order('display_order', { ascending: true }),
    supabase
      .from('co_curricular_activities')
      .select('id, title, slug, organization, category, published, featured, display_order')
      .order('display_order', { ascending: true }),
    supabase
      .from('achievements')
      .select('id, title, slug, rank, category, published, featured, date')
      .order('date', { ascending: false }),
    supabase
      .from('experience')
      .select('id, company, role, published, is_current, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('skills')
      .select('id, name, category')
      .order('category'),
    supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  // 3. Ensure all 7 genuine projects are included
  const allProjects = [...(rawProjects ?? [])]
  for (const p of REAL_PORTFOLIO_PROJECTS) {
    if (!allProjects.some((ep) => ep.slug === p.slug)) {
      allProjects.push(p as unknown as typeof allProjects[0])
    }
  }
  const projects = allProjects.filter((p) => !['botbro', 'flight-delay-prediction'].includes(p.slug))
  const certs = rawCerts ?? []
  const trainings = (rawTrainings ?? []).filter((t) => !FAKE_TRAINING_SLUGS.includes(t.slug))
  const coCurricular = (rawCoCurr ?? []).filter((a) => !FAKE_CO_CURRICULAR_SLUGS.includes(a.slug))
  const achievements = (rawAchievements ?? []).filter((a) => !FAKE_ACHIEVEMENT_SLUGS.includes(a.slug))
  const experience = rawExperience ?? []
  const skills = rawSkills ?? []
  const profile = rawProfile ?? null
  const contactMessages = (messagesData as ContactMessage[]) ?? []

  const unreadMessagesCount = contactMessages.filter((m) => !m.read).length

  const publishedProjects = projects.filter((p) => p.published).length
  const publishedCerts = certs.filter((c) => c.published).length
  const publishedTrainings = trainings.filter((t) => t.published).length
  const publishedCoCurr = coCurricular.filter((a) => a.published).length
  const featuredProjects = projects.filter((p) => p.featured).length
  const featuredCerts = certs.filter((c) => c.featured).length
  const featuredTrainings = trainings.filter((t) => t.featured).length
  const featuredCoCurr = coCurricular.filter((a) => a.featured).length

  // Calculate dynamic Portfolio Health Score (0 - 100) based on genuine items
  let healthScore = 0
  if (profile?.name && profile?.bio) healthScore += 25
  if (projects.length >= 2) healthScore += 25
  if (certs.length >= 2) healthScore += 20
  if (skills.length >= 5) healthScore += 15
  if (trainings.length >= 1) healthScore += 10
  if (coCurricular.length >= 1) healthScore += 5

  const statCards = [
    {
      label: 'Projects',
      value: projects.length,
      subValue: `${publishedProjects} Live · ${featuredProjects} Featured`,
      href: '/admin/projects',
      icon: FolderKanban,
      accent: '#E45D2C',
      trend: publishedProjects > 0 ? `${publishedProjects} Live` : 'Draft',
    },
    {
      label: 'Certificates',
      value: certs.length,
      subValue: `${publishedCerts} Published · ${featuredCerts} Featured`,
      href: '/admin/certificates',
      icon: ScrollText,
      accent: '#FF8A3D',
      trend: 'AI Verified',
    },
    {
      label: 'Training',
      value: trainings.length,
      subValue: `${publishedTrainings} Active · ${featuredTrainings} Featured`,
      href: '/admin/training',
      icon: BookOpen,
      accent: '#14B8A6',
      trend: 'Verified',
    },
    {
      label: 'Co-Curricular',
      value: coCurricular.length,
      subValue: `${publishedCoCurr} Published · ${featuredCoCurr} Featured`,
      href: '/admin/co-curricular',
      icon: Trophy,
      accent: '#F59E0B',
      trend: 'Active',
    },
    {
      label: 'Technical Skills',
      value: skills.length,
      subValue: 'Frontend, Backend, AI/ML, Tools',
      href: '/admin/skills',
      icon: Wrench,
      accent: '#3B82F6',
      trend: 'Active',
    },
    {
      label: 'Experience',
      value: experience.length,
      subValue: experience.length > 0 ? `${experience.length} Verified Roles` : 'Add your work roles',
      href: '/admin/experience',
      icon: Briefcase,
      accent: '#10B981',
      trend: experience.length > 0 ? 'Verified' : 'Empty',
    },
    {
      label: 'Achievements',
      value: achievements.length,
      subValue: achievements.length > 0 ? `${achievements.length} Honors & Awards` : 'Add your hackathon awards',
      href: '/admin/achievements',
      icon: Award,
      accent: '#EC4899',
      trend: achievements.length > 0 ? 'Top Tier' : 'Empty',
    },
    {
      label: 'Inquiries & Messages',
      value: contactMessages.length,
      subValue: unreadMessagesCount === 0 ? 'All messages read' : `${unreadMessagesCount} unread contact forms`,
      href: '#inquiries-section',
      icon: Mail,
      accent: unreadMessagesCount > 0 ? '#EF4444' : '#10B981',
      trend: unreadMessagesCount > 0 ? `${unreadMessagesCount} New` : 'Clean',
    },
  ]

  const quickActions = [
    {
      title: 'Add Certificate with AI',
      desc: 'Instant multimodal Gemini parsing from PDF/Image',
      href: '/admin/certificates/new',
      icon: Sparkles,
      accent: '#C084FC',
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.25)',
    },
    {
      title: 'Create Project',
      desc: 'Add case study with technologies and live preview',
      href: '/admin/projects/new',
      icon: Plus,
      accent: '#E45D2C',
      bg: 'rgba(228, 93, 44, 0.08)',
      border: 'rgba(228, 93, 44, 0.25)',
    },
    {
      title: 'Add Experience',
      desc: 'Record professional roles and impact',
      href: '/admin/experience',
      icon: Briefcase,
      accent: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    {
      title: 'Edit Profile & Bio',
      desc: 'Update avatar, title, social links, and bio',
      href: '/admin/profile',
      icon: Pencil,
      accent: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.08)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* =========================================================================
          1. Welcome Header Section with Real-time Status & Sync Button
          ========================================================================= */}
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
              gap: '8px',
              padding: '4px 12px',
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
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <Zap size={12} /> System Command Center · PostgreSQL & Supabase Connected
          </div>

          <h1
            style={{
              fontSize: 'clamp(22px, 2.5vw, 28px)',
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
              fontSize: '13.5px',
              color: '#9CA3AF',
              marginTop: '6px',
              lineHeight: 1.5,
              margin: '6px 0 0',
            }}
          >
            Your portfolio CMS is synchronized live with Supabase Storage, PostgreSQL, and Gemini AI.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Live Sync Button */}
          <SyncNowButton />

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#D1D5DB',
              textDecoration: 'none',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontFamily: 'var(--font-mono, monospace)',
              transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
            }}
            className="admin-btn-secondary-hover"
          >
            <Globe size={14} style={{ color: '#38BDF8' }} />
            <span>Public Site</span>
            <ExternalLink size={11} style={{ opacity: 0.7 }} />
          </a>

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
              boxShadow: '0 4px 16px rgba(228, 93, 44, 0.3)',
              transition: 'filter 0.15s, transform 0.15s, box-shadow 0.15s',
            }}
            className="admin-primary-btn-hover"
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
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#F5F5F5',
              textDecoration: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
            }}
            className="admin-btn-secondary-hover"
          >
            <Plus size={15} /> Add Project
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. Key Metrics 8-Card Grid (100% Genuine Data)
          ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8A8F98',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
                    background: 'linear-gradient(180deg, #10141C 0%, #0B0E14 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.accent,
                      }}
                    >
                      <Icon size={16} />
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
                        color: stat.accent === '#EF4444' ? '#EF4444' : '#10B981',
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
                      color: '#8A8F98',
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

      {/* =========================================================================
          3. VISITOR CONTACT INQUIRIES (Requested Section)
          ========================================================================= */}
      <div id="inquiries-section">
        <VisitorContactInquiries initialMessages={contactMessages} />
      </div>

      {/* =========================================================================
          4. Quick Actions Hub + Portfolio Health Score
          ========================================================================= */}
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
            background: 'linear-gradient(180deg, #10141C 0%, #0A0D14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
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
                    <ArrowUpRight size={14} style={{ color: '#8A8F98' }} />
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
                        fontSize: '10.5px',
                        color: '#9CA3AF',
                        lineHeight: 1.35,
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
            background: 'linear-gradient(180deg, #10141C 0%, #0A0D14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
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

            {/* Health Bar with cyber glow */}
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
                  background: 'linear-gradient(90deg, #E45D2C 0%, #10B981 100%)',
                  borderRadius: '9999px',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
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
                  <CheckCircle2 size={13} style={{ color: projects.length > 0 ? '#10B981' : '#6B7280' }} /> Projects Inventory
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
                  <CheckCircle2 size={13} style={{ color: certs.length > 0 ? '#10B981' : '#6B7280' }} /> Credentials & Certificates
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
                  <CheckCircle2 size={13} style={{ color: skills.length > 0 ? '#10B981' : '#6B7280' }} /> Tech Skills & Matrix
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
                  <CheckCircle2 size={13} style={{ color: (trainings.length + coCurricular.length) > 0 ? '#10B981' : '#6B7280' }} /> Training & Co-Curricular
                </span>
                <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{trainings.length + coCurricular.length} Records</span>
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
              className="hover-accent-text"
            >
              Update Profile Details →
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. Live Content Management Tables (Projects & Certificates)
          ========================================================================= */}
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
            background: 'linear-gradient(180deg, #10141C 0%, #0A0D14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
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
                {projects.length} genuine projects in database
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
              className="hover-accent-text"
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
            background: 'linear-gradient(180deg, #10141C 0%, #0A0D14 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
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
              className="hover-accent-text"
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
                  willChange: 'border-color, background',
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

      {/* Optimized GPU-Accelerated Styles — No Stutter or Reflow Lag */}
      <style>{`
        .admin-hover-card {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s, box-shadow 0.15s;
          transform: translateZ(0);
        }
        .admin-hover-card:hover {
          border-color: rgba(228, 93, 44, 0.4) !important;
          transform: translateY(-2px) translateZ(0);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(228, 93, 44, 0.1) !important;
        }
        .admin-quick-action-tile {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s;
          transform: translateZ(0);
        }
        .admin-quick-action-tile:hover {
          filter: brightness(1.15);
          transform: translateY(-2px) translateZ(0);
        }
        .admin-list-row-item {
          transition: border-color 0.12s, background 0.12s;
        }
        .admin-list-row-item:hover {
          border-color: rgba(228, 93, 44, 0.35) !important;
          background: #141822 !important;
        }
        .admin-primary-btn-hover {
          transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
          transform: translateZ(0);
        }
        .admin-primary-btn-hover:hover {
          filter: brightness(1.1);
          transform: translateY(-1px) translateZ(0);
          box-shadow: 0 6px 20px rgba(228, 93, 44, 0.4) !important;
        }
        .admin-btn-secondary-hover {
          transition: border-color 0.15s, background 0.15s, transform 0.15s;
          transform: translateZ(0);
        }
        .admin-btn-secondary-hover:hover {
          border-color: rgba(255, 255, 255, 0.25) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          color: #FFFFFF !important;
          transform: translateY(-1px) translateZ(0);
        }
      `}</style>
    </div>
  )
}
