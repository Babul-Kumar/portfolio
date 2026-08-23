import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  const links = [
    { href: 'https://github.com/babul-kumar', label: 'GitHub' },
    { href: 'https://linkedin.com/in/babul-kumar', label: 'LinkedIn' },
    { href: 'https://kaggle.com/babul-kumar', label: 'Kaggle' },
    { href: '/contact', label: 'Email' },
  ]

  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      padding: '60px var(--container-pad) 40px',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}>
        {/* Name */}
        <div>
          <div style={{
            fontSize: 'clamp(28px, 5vw, 56px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: 'var(--color-text)',
          }}>
            BABUL<br />KUMAR
          </div>
          <div style={{
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            marginTop: '12px',
          }}>
            AI / ML · Full Stack · Computer Science
          </div>
        </div>

        {/* Links + copyright */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {links.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="hover-text-primary"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                }}
              >
                {label} ↗
              </a>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            © {year} Babul Kumar. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
