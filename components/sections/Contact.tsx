'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormValues } from '@/lib/validations'

const inputStyle = {
  width: '100%',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '14px 16px',
  color: 'var(--color-text)',
  fontSize: '15px',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
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

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/babul-kumar', meta: 'Open Source & Repositories' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/babul-kumar', meta: 'Professional Network' },
    { label: 'Kaggle', href: 'https://kaggle.com/babul-kumar', meta: 'ML Notebooks & Datasets' },
    { label: 'Email', href: 'mailto:bk7321634@gmail.com', meta: 'bk7321634@gmail.com' },
  ]

  return (
    <section id="contact" className="section">
      <div className="container">
        {/* Asymmetric Contact Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'start',
          }}
          className="contact-layout"
        >
          {/* Left Column: Direct Outreach & Socials */}
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              07 / High-Impact Collaboration
            </div>
            <h2
              style={{
                fontSize: 'clamp(34px, 4.8vw, 60px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
                color: 'var(--color-text)',
                marginBottom: '20px',
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
                marginBottom: '40px',
                maxWidth: '380px',
              }}
            >
              I am open to software engineering internships, AI/ML research collaborations,
              and open-source projects. Feel free to reach out directly.
            </p>

            {/* Direct Connect Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {socialLinks.map(({ label, href, meta }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card"
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {meta}
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--color-accent)' }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="glass-card" style={{ padding: 'clamp(28px, 5vw, 48px)' }}>
            {status === 'success' ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    margin: '0 auto 20px',
                  }}
                >
                  ✓
                </div>
                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: '8px',
                  }}
                >
                  Message Sent Successfully
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '28px',
                  }}
                >
                  Thank you for reaching out. I will get back to you shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-secondary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    {...register('name')}
                    style={inputStyle}
                    placeholder="Jane Doe"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 12px var(--color-accent-glow)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.name && (
                    <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '6px' }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                    }}
                  >
                    Your Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    style={inputStyle}
                    placeholder="jane@example.com"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 12px var(--color-accent-glow)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.email && (
                    <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '6px' }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                    }}
                  >
                    Project / Message Details
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                    placeholder="Tell me about your project, idea, or collaboration..."
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 12px var(--color-accent-glow)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.message && (
                    <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '6px' }}>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <div
                    style={{
                      marginBottom: '20px',
                      fontSize: '13px',
                      color: 'var(--color-accent)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                    }}
                  >
                    Failed to send message. Please try again or email directly at bk7321634@gmail.com.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px' }}
                >
                  {status === 'loading' ? 'Sending Message…' : 'Transmit Message →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  )
}
