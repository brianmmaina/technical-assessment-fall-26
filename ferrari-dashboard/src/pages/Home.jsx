// Home / landing page. Three main sections stacked top to bottom:
//   1. Hero with title, CTA buttons, and a looping video on the right
//   2. Stats strip (championships, wins, etc.) with count-up animations
//   3. A teaser for the 2026 grid that links into the Drivers page
//
// Most of the file is layout / styling. The two pieces worth reading are
// `useCountUp` (the number tickers) and the hero video logic that gracefully
// falls back to an image, then to a shield, if loading fails.

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import FerrariShield from '../components/FerrariShield'
import HeroButton from '../components/HeroButton'
import { useFadeIn } from '../hooks/useFadeIn'
import { HOME_FEATURE_SRC, HOME_HERO_SRC, HOME_HERO_VIDEO_SRC } from '../constants/ferrariAssets'

// Capitalized aliases so the linter sees these as JSX components.
const MotionDiv = motion.div
const MotionH1 = motion.h1
const MotionP = motion.p

// Some of the source clips are 8+ minute highlight reels and the loud parts
// at the end ruin the vibe of a calm hero. Cap playback at 4 min and snap
// back to the opening, so the loop always feels intentional.
const HERO_VIDEO_MAX_SECONDS = 4 * 60

// Hard-coded marketing numbers. These don't need to come from the API.
// They're stable historic totals.
const stats = [
  { label: 'Constructors Championships', value: 16 },
  { label: 'Race Wins', value: 242 },
  { label: 'Drivers Championships', value: 15 },
]

// Custom hook: animates an integer from 0 up to `target` over `duration` ms.
// Uses requestAnimationFrame instead of setInterval so it stays smooth and
// respects the browser's frame budget. The easing curve is "easeOutCubic":
// starts fast, slows down at the end. Feels nicer than a flat linear ramp.
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutCubic. Subtracting from 1 flips the curve so growth slows
      // toward the end instead of speeding up.
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

// One stat tile in the strip below the hero. Each tile gets a slightly
// longer count-up duration than the previous one (1200ms + 150ms per index)
// so they don't all finish counting at the exact same instant.
function AnimatedStat({ stat, index, isLast }) {
  const count = useCountUp(stat.value, 1200 + index * 150)
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
      style={{
        flex: '1 1 200px',
        maxWidth: '300px',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        borderRight: !isLast ? '1px solid var(--f-border-subtle)' : 'none',
      }}
    >
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        fontSize: '3.5rem',
        color: 'var(--f-red)',
        lineHeight: 1,
      }}>
        {count}{stat.label === 'Race Wins' ? '+' : ''}
      </div>
      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--f-muted)',
      }}>
        {stat.label}
      </div>
    </MotionDiv>
  )
}

export default function Home({ setPage }) {
  // Each section has its own fade-in trigger so they animate as the user
  // scrolls past, instead of all firing on first paint.
  const [statsRef, statsStyle] = useFadeIn(100)
  const [teaserRef, teaserStyle] = useFadeIn(0)
  const [featureRef, featureStyle] = useFadeIn(40)

  // Three-stage fallback for the hero visual:
  //   video (preferred) -> still image -> shield silhouette on a dark fill
  // Each `*Ok` flag flips to false in the matching onError handler, so a
  // broken asset just falls through to the next option without breaking.
  const [heroVideoOk, setHeroVideoOk] = useState(true)
  const [heroImgOk, setHeroImgOk] = useState(true)
  const [featureImgOk, setFeatureImgOk] = useState(true)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Hero is transparent so the AnimatedBackground embers show
          through behind the title and CTAs. The right column with the
          looping video covers itself. */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        overflow: 'hidden',
        background: 'transparent',
      }}>

        <div style={{
          position: 'relative',
          zIndex: 1,
          flex: '1 1 320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vw, 4rem)',
          gap: '1.75rem',
          maxWidth: '560px',
        }}>

          <MotionH1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06 }}
            style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--f-cream)',
              margin: 0,
            }}
          >
            Precision.
            <br />
            <span style={{ color: 'var(--f-green)', fontStyle: 'italic', fontWeight: 700 }}>Emotion.</span>
            <br />
            <span style={{ fontWeight: 700 }}>Racing.</span>
          </MotionH1>

          <MotionDiv
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              width: '48px',
              height: '2px',
              background: 'var(--f-red)',
              transformOrigin: 'left',
              opacity: 0.85,
            }}
          />

          <MotionP
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            style={{
              maxWidth: '420px',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'var(--f-cream)',
              fontWeight: 400,
              letterSpacing: '0.01em',
            }}
          >
            A look at the most storied team in Formula One. Every race result,
            championship standing, and driver since 1950.
          </MotionP>

          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
          >
            <HeroButton variant="primary" onClick={() => setPage('results')}>
              Race Results
            </HeroButton>
            <HeroButton onClick={() => setPage('standings')}>
              Standings
            </HeroButton>
            <HeroButton onClick={() => setPage('drivers')}>
              Drivers
            </HeroButton>
          </MotionDiv>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          flex: '1.4 1 360px',
          minHeight: 'min(52vh, 520px)',
          overflow: 'hidden',
          background: 'var(--f-charcoal)',
        }}>
          {heroVideoOk ? (
            <video
              aria-hidden
              src={HOME_HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onTimeUpdate={(e) => {
                // Manual loop trim. <video loop> would play the entire
                // file before restarting, but we want to cut long clips
                // off at HERO_VIDEO_MAX_SECONDS. The play() can reject
                // if the user tabbed away, so swallow that error.
                const v = e.currentTarget
                if (v.currentTime >= HERO_VIDEO_MAX_SECONDS) {
                  v.currentTime = 0
                  void v.play().catch(() => {})
                }
              }}
              onError={() => setHeroVideoOk(false)}
            />
          ) : heroImgOk ? (
            <img
              src={HOME_HERO_SRC}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={() => setHeroImgOk(false)}
            />
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--f-hero-fallback)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FerrariShield size={120} style={{ opacity: 0.12 }} />
            </div>
          )}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--f-border-subtle)' }} />

      <section
        ref={statsRef}
        style={{
          ...statsStyle,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '4rem 2rem',
          background: 'var(--f-surface)',
          borderBottom: '1px solid var(--f-border-subtle)',
          boxShadow: 'var(--f-shadow-sm)',
        }}
      >
        {stats.map((stat, i) => (
          <AnimatedStat key={stat.label} stat={stat} index={i} isLast={i === stats.length - 1} />
        ))}
      </section>

      {featureImgOk && (
        <section
          ref={featureRef}
          style={{
            ...featureStyle,
            padding: 'clamp(2rem, 4vw, 3.5rem) 2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <img
            src={HOME_FEATURE_SRC}
            alt=""
            style={{
              width: '100%',
              maxHeight: '440px',
              objectFit: 'cover',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--f-border-subtle)',
              boxShadow: 'var(--f-shadow-sm)',
            }}
            onError={() => setFeatureImgOk(false)}
          />
        </section>
      )}

      <section
        ref={teaserRef}
        style={{
          ...teaserStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
          padding: '5rem 2.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--f-muted)',
            marginBottom: '1.2rem',
          }}>
            2026 Grid
          </div>

          {[{ num: '16', name: 'Charles Leclerc' }, { num: '44', name: 'Lewis Hamilton' }].map((d) => (
            <div key={d.num} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 900,
                fontSize: '2.4rem',
                color: 'var(--f-red)',
                lineHeight: 1,
              }}>{d.num}</span>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'var(--f-cream)',
              }}>{d.name}</span>
            </div>
          ))}
        </div>

        <HeroButton accent onClick={() => setPage('drivers')}>
          Meet the Drivers →
        </HeroButton>
      </section>

    </div>
  )
}
