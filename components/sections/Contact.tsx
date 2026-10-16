'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormValues } from '@/lib/validations'
import { ArrowUpRight, Loader2, Mail, Database } from 'lucide-react'
import PigeonDeliveryAnimation, { type ContactMessageData } from '@/components/contact/PigeonDeliveryAnimation'
import type { Profile } from '@/types'
import { FALLBACK_PROFILE } from '@/lib/data'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

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

interface ContactSectionProps {
  profile?: Profile | null
}

export default function ContactSection({ profile }: ContactSectionProps = {}) {
  const githubUrl = profile?.github_url || FALLBACK_PROFILE.github_url || 'https://github.com/babul-kumar'
  const linkedinUrl =
    profile?.linkedin_url || FALLBACK_PROFILE.linkedin_url || 'https://www.linkedin.com/in/babul-kumar2007/'
  const kaggleUrl = profile?.kaggle_url || FALLBACK_PROFILE.kaggle_url || 'https://www.kaggle.com/babulkumar07'
  const email = profile?.email || FALLBACK_PROFILE.email || 'babulkumar0220@gmail.com'
  const emailHref = email.startsWith('mailto:') ? email : `mailto:${email}`

  const socialLinks = [
    {
      label: 'GitHub',
      href: githubUrl,
      meta: 'github.com/babul-kumar',
      icon: GitHubIcon,
    },
    {
      label: 'LinkedIn',
      href: linkedinUrl,
      meta: 'linkedin.com/in/babul-kumar2007',
      icon: LinkedInIcon,
    },
    {
      label: 'Kaggle',
      href: kaggleUrl,
      meta: 'kaggle.com/babulkumar07',
      icon: Database,
    },
    {
      label: 'Email',
      href: emailHref,
      meta: email,
      icon: Mail,
    },
  ]

  const [status, setStatus] = useState<'idle' | 'submitting' | 'animating' | 'error'>('idle')
  const [submittedMessageData, setSubmittedMessageData] = useState<ContactMessageData | null>(null)

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
    if (status === 'submitting') return
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to deliver message')

      setSubmittedMessageData({
        name: data.name,
        email: data.email,
        message: data.message,
      })
      setStatus('animating')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: 'clamp(24px, 4vw, 48px)',
      }}
    >
      <AmbientSectionEnvironment variant="communication" intensity={0.18} accentMode="orange" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* =========================================================================
            Balanced Centered Two-Column Grid: Left (Links) | Right (Form)
            ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
            gap: 'clamp(28px, 4vw, 52px)',
            alignItems: 'start',
            width: '100%',
            maxWidth: '1060px',
            margin: '0 auto',
          }}
          className="contact-layout"
        >
          {/* ----------------- LEFT COLUMN: HEADING & CONTACT LINKS ----------------- */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Subtle Availability Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.22)',
                color: '#10B981',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                marginBottom: '20px',
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
              <span>Available for opportunities</span>
            </div>

            {/* Clean Main Heading */}
            <h1
              style={{
                fontSize: 'clamp(34px, 4vw, 50px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                color: 'var(--color-text)',
                marginBottom: '16px',
              }}
            >
              Get in touch
            </h1>

            {/* Professional Supporting Copy */}
            <p
              style={{
                fontSize: '15.5px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '520px',
              }}
            >
              I&apos;m open to software engineering opportunities, AI/ML research collaborations, and open-source
              projects. Feel free to reach out.
            </p>

            {/* Contact Options Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {socialLinks.map(({ label, href, meta, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className="glass-card contact-social-card"
                  style={{
                    height: '64px',
                    padding: '0 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  aria-label={`${label}: ${meta}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
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
                    <div style={{ minWidth: 0 }}>
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
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
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
                      flexShrink: 0,
                      marginLeft: '12px',
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

          {/* ----------------- RIGHT COLUMN: CONTACT FORM ----------------- */}
          <div
            className="glass-card"
            style={{
              padding: 'clamp(24px, 4vw, 36px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-card-bg)',
              boxShadow: 'var(--shadow-card)',
              width: '100%',
              maxWidth: '560px',
              margin: '0 auto',
              boxSizing: 'border-box',
              overflow: status === 'animating' ? 'visible' : undefined,
              contain: status === 'animating' ? 'none' : undefined,
            }}
          >
            {status === 'animating' && submittedMessageData ? (
              <PigeonDeliveryAnimation
                data={submittedMessageData}
                onReset={() => {
                  setStatus('idle')
                  setSubmittedMessageData(null)
                  reset()
                }}
              />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Field 1: Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="contact-name"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      display: 'block',
                      marginBottom: '8px',
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
                      height: '46px',
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
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Field 2: Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="contact-email"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      display: 'block',
                      marginBottom: '8px',
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
                      height: '46px',
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
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Field 3: Message */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="contact-message"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    {...register('message')}
                    rows={5}
                    placeholder="Write your message here..."
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
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Error Notice with Email Fallback */}
                {status === 'error' && (
                  <div
                    style={{
                      marginBottom: '20px',
                      fontSize: '13px',
                      color: 'var(--color-text)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-accent)', marginBottom: '4px' }}>
                      Unable to send message
                    </div>
                    <div>
                      Something went wrong delivering your message. You can reach out directly via email.
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <a
                        href={`mailto:${email}?subject=${encodeURIComponent(
                          'Contact via Portfolio from ' + (getValues('name') || 'Visitor')
                        )}&body=${encodeURIComponent(
                          `Hi Babul,\n\n${getValues('message') || ''}\n\nFrom: ${getValues('name') || ''} (${getValues('email') || ''})`
                        )}`}
                        className="btn-primary"
                        style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}
                      >
                        Open Email Client
                      </a>
                      <a
                        href={emailHref}
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-accent)',
                          textDecoration: 'underline',
                        }}
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="contact-submit-btn"
                  style={{
                    width: '100%',
                    height: '48px',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-accent)',
                    transition: 'all 0.2s ease',
                    opacity: status === 'submitting' ? 0.75 : 1,
                  }}
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
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
        .contact-social-card:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        .contact-form-input:focus {
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 10px var(--color-accent-glow) !important;
        }
        .contact-submit-btn:hover:not(:disabled) {
          background: #EA580C !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 138, 61, 0.3) !important;
        }
        .contact-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .contact-submit-btn:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
            max-width: 580px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </section>
  )
}
