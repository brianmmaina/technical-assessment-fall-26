import { useState } from 'react'
import FerrariShield from './FerrariShield'
import { FERRARI_LOGO_SRC } from '../constants/ferrariAssets'

export default function Footer() {
  const [logoOk, setLogoOk] = useState(true)

  return (
    <footer
      style={{
        marginTop: 'auto',
        padding: '2.5rem 2rem',
        borderTop: '1px solid var(--f-border-subtle)',
        background: 'var(--f-footer-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {logoOk ? (
            <img
              src={FERRARI_LOGO_SRC}
              alt=""
              style={{ height: 26, width: 'auto', maxWidth: 110, objectFit: 'contain', objectPosition: 'left center' }}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <FerrariShield size={26} />
          )}
          <span
            style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--f-cream)',
              letterSpacing: '0.03em',
            }}
          >
            Scuderia Ferrari
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.25rem',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--f-muted)',
              margin: 0,
            }}
          >
            By Brian. im lowkey a redbull fan but ferrari's colors are so tuff
          </p>
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'var(--f-muted)',
              opacity: 0.7,
              margin: 0,
            }}
          >
            Data: Ergast (jolpica mirror)
          </p>
        </div>
      </div>
    </footer>
  )
}
