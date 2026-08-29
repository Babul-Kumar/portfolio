'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormValues } from '@/lib/validations'
import { ArrowUpRight, CheckCircle2, Loader2, Mail, Database } from 'lucide-react'

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

import type { Profile } from '@/types'
import { FALLBACK_PROFILE } from '@/lib/data'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

interface ContactSectionProps {
  profile?: Profile | null
}

export default function ContactSection({ profile }: ContactSectionProps = {}) {
  const githubUrl = profile?.github_url || FALLBACK_PROFILE.github_url || 'https://github.com/babul-kumar'
  const linkedinUrl = profile?.linkedin_url || FALLBACK_PROFILE.linkedin_url || 'https://linkedin.com/in/babul-kumar'
  const kaggleUrl = profile?.kaggle_url || FALLBACK_PROFILE.kaggle_url || 'https://kaggle.com/babul-kumar'
  const email = profile?.email || FALLBACK_PROFILE.email || 'bk7321634@gmail.com'
  const emailHref = email.startsWith('mailto:') ? email : `mailto:${email}`

  const socialLinks = [
    {
      label: 'GitHub',
      href: githubUrl,
      meta: 'Open Source & Repositories',
      icon: GitHubIcon,
    },
    {
      label: 'LinkedIn',
      href: linkedinUrl,
      meta: 'Professional Network',
      icon: LinkedInIcon,
    },
    {
      label: 'Kaggle',
      href: kaggleUrl,
      meta: 'ML Notebooks & Datasets',
      icon: Database,
    },
    {
      label: 'Email',
      href: emailHref,
      meta: email,
      icon: Mail,
    },
  ]
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormValues) {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section" style={{ position: 'relative', paddingBottom: 'clamp(48px, 6vw, 80px)' }}>
      <AmbientSectionEnvironment variant="communication" intensity={0.35} accentMode="orange" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* =========================================================================
            Two-Column Shared Grid (Left ~44%, Right ~56%)
            ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 44fr) minmax(0, 56fr)',
            gap: 'clamp(36px, 5vw, 64px)',
            alignItems: 'start',
          }}
          className="contact-layout"
        >
          {/* ----------------- LEFT COLUMN: HEADING & SOCIAL CARDS ----------------- */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              {'// COMMUNICATION_TERMINAL'}
            </div>

            {/* Availability Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10B981',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                marginBottom: '16px',
                width: 'fit-content',
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
              <span>Available for SDE &amp; AI/ML opportunities</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(30px, 3.8vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                color: 'var(--color-text)',
                marginBottom: '16px',
                maxWidth: '620px',
              }}
            >
              HAVE A VISION?<br />
              <span style={{ color: 'var(--color-accent)' }}>LET&apos;S BUILD IT.</span>
            </h2>

            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '28px',
                maxWidth: '560px',
              }}
            >
              I am open to software engineering internships, AI/ML research collaborations,
              and open-source projects. Feel free to reach out directly.
            </p>

            {/* Direct Connect Vertical Stack (Full Width of Left Column) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {socialLinks.map(({ label, href, meta, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card contact-social-card"
                  style={{
                    height: '68px',
                    padding: '0 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    transition: 'all 0.22s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-accent)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          lineHeight: 1.3,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {meta}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s, transform 0.2s',
                    }}
                    className="card-arrow"
                  >
                    <ArrowUpRight size={18} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: CONTACT FORM CARD ----------------- */}
          <div
            className="glass-card"
            style={{
              padding: 'clamp(28px, 4vw, 40px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-card-bg)',
              boxShadow: 'var(--shadow-card)',
              width: '100%',
            }}
          >
            {status === 'success' ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <CheckCircle2 size={26} />
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '8px',
                  }}
                >
                  Message Transmitted Successfully
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                    maxWidth: '420px',
                  }}
                >
                  Thank you for reaching out. I have received your message and will review your inquiry shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="btn-secondary"
                  style={{
                    padding: '10px 22px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Send Another Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Field 1: Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="contact-name"
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    {...register('name')}
                    placeholder="e.g. Alex Morgan"
                    className="contact-form-input"
                    style={{
                      width: '100%',
                      height: '48px',
                      background: 'var(--color-surface)',
                      border: errors.name ? '1px solid #EF4444' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 16px',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  {errors.name && (
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Field 2: Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="contact-email"
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}
                  >
                    Your Email Address
                  </label>
                  <input
                    id="contact-email"
                    {...register('email')}
                    type="email"
                    placeholder="alex@company.com"
                    className="contact-form-input"
                    style={{
                      width: '100%',
                      height: '48px',
                      background: 'var(--color-surface)',
                      border: errors.email ? '1px solid #EF4444' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 16px',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  {errors.email && (
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Field 3: Message */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="contact-message"
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}
                  >
                    Project / Message Details
                  </label>
                  <textarea
                    id="contact-message"
                    {...register('message')}
                    rows={5}
                    placeholder="Tell me about your project, engineering challenge, or collaboration idea..."
                    className="contact-form-input"
                    style={{
                      width: '100%',
                      minHeight: '130px',
                      background: 'var(--color-surface)',
                      border: errors.message ? '1px solid #EF4444' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 16px',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.2s ease',
                      lineHeight: 1.6,
                    }}
                  />
                  {errors.message && (
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Error Notice with 1-Click Fallback */}
                {status === 'error' && (
                  <div
                    style={{
                      marginBottom: '20px',
                      fontSize: '12.5px',
                      color: 'var(--color-text)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginBottom: '4px' }}>
                      {'// TRANSMISSION_FAILED'}
                    </div>
                    <div>
                      Network submission could not be completed. Use the 1-click email client fallback or message directly.
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <a
                        href={`mailto:${email}?subject=${encodeURIComponent(
                          'Contact via Portfolio from ' + (getValues('name') || 'Visitor')
                        )}&body=${encodeURIComponent(
                          `Hi Babul,\n\n${getValues('message') || ''}\n\nFrom: ${getValues('name') || ''} (${getValues('email') || ''})`
                        )}`}
                        className="btn-primary"
                        style={{ fontSize: '11px', padding: '6px 14px', textDecoration: 'none' }}
                      >
                        OPEN MAIL CLIENT ↗
                      </a>
                      <a
                        href={emailHref}
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--color-accent)',
                          textDecoration: 'underline',
                        }}
                      >
                        Direct Copy ({email})
                      </a>
                    </div>
                  </div>
                )}

                {/* Primary CTA Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="contact-submit-btn"
                  style={{
                    width: '100%',
                    height: '50px',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-accent)',
                    transition: 'all 0.2s ease',
                    opacity: status === 'loading' ? 0.75 : 1,
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Transmitting Message…</span>
                    </>
                  ) : (
                    <span>SEND MESSAGE →</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-social-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-accent-border) !important;
          box-shadow: 0 6px 20px rgba(255, 138, 61, 0.08) !important;
        }
        .contact-social-card:hover .card-arrow {
          color: var(--color-accent) !important;
          transform: translate(2px, -2px);
        }
        .contact-form-input:focus {
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 12px var(--color-accent-glow) !important;
        }
        .contact-submit-btn {
          position: relative;
          overflow: hidden;
        }
        .contact-submit-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .contact-submit-btn:hover::after {
          left: 140%;
        }
        .contact-submit-btn:hover:not(:disabled) {
          background: #EA580C !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255, 138, 61, 0.35) !important;
        }
        .contact-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}
