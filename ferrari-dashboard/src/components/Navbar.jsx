import { useState, useEffect } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import FerrariShield from './FerrariShield.jsx'
import { FERRARI_LOGO_SRC } from '../constants/ferrariAssets.js'
import { PAGES } from '../constants/pages.js'
import { useTheme } from '../hooks/useTheme.js'
import { NavLink } from "react-router";

const MotionHeader = motion.header
const MotionDiv = motion.div
const MotionButton = motion.button

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function MyAppNav() {
  return (
    <nav>
      <NavLink to="/results" end>
        Results      
      </NavLink>
    </nav>
  );
}

export default function Navbar({ page, setPage }) {
  const { theme, toggleTheme } = useTheme()
  const [logoOk, setLogoOk] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <MotionHeader
      className="navbar-header"
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        className={`navbar-shell${scrolled ? ' navbar-shell--scrolled' : ''}`}
        aria-label="Main"
      >
        <MotionButton
          type="button"
          className="navbar-brand-btn"
          aria-label="Scuderia Ferrari, home"
          onClick={() => setPage('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.8rem, 1.5vw, 1.1rem)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {logoOk ? (
            <img
              src={FERRARI_LOGO_SRC}
              alt="Scuderia Ferrari"
              style={{ height: 38, width: 'auto', maxWidth: 140, objectFit: 'contain', objectPosition: 'left center' }}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <FerrariShield size={38} />
          )}
        </MotionButton>

        <LayoutGroup id="main-nav">
          <ul className="navbar-links">
            {PAGES.map((link) => {
              const isActive = page === link.id
              return (
                <li key={link.id}>
                  {isActive && (
                    <MotionDiv
                      layoutId="navbar-active-line"
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        left: 4,
                        right: 4,
                        height: 2,
                        borderRadius: 1,
                        background: 'var(--f-red)',
                        zIndex: 2,
                      }}
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <MotionButton
                    type="button"
                    onClick={() => setPage(link.id)}
                    className={`navbar-link-btn${isActive ? ' navbar-link-btn--active' : ''}`}
                    whileTap={{ scale: 0.96 }}
                  >
                    {link.label}
                  </MotionButton>
                </li>
              )
            })}
          </ul>
        </LayoutGroup>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          <MotionButton
            type="button"
            className="navbar-cta"
            onClick={() => setPage('results')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Race Results
          </MotionButton>
        </div>
      </nav>
      <div className="navbar-tricolor" aria-hidden />
    </MotionHeader>
  )
}
