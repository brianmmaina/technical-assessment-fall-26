// Drivers page. Two sections: the current 2026 grid up top, then a "Ferrari
// Legends" section below it. Each driver gets a card with their photo, name,
// number, nationality, years at Ferrari, and a notable stat. Clicking a card
// opens that driver's Wikipedia article in a new tab.
//
// The interesting bit on this page is that the photos aren't bundled with
// the app. They're pulled live from the Wikipedia API in parallel and
// merged into the cards as each request comes back.

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFadeIn } from '../hooks/useFadeIn'
import { getWikipediaThumbnail, wikipediaArticleUrl } from '../utils/wikipedia'
import PagePhotoBg from '../components/PagePhotoBg'
import PageTitle from '../components/PageTitle'
import { PAGE_BG_DRIVERS } from '../constants/ferrariAssets'

// Capitalized aliases so the linter sees these as JSX components.
const MotionA = motion.a
const MotionDiv = motion.div

// 360px wide is enough for the cards (which are ~170px tall) but small
// enough that Wikipedia returns the thumbnail fast. Asking for a 1000px
// image just wastes bandwidth and slows down first paint.
const THUMB_SIZE = 360

// Hand-curated lists. I keep them in separate arrays so the two sections
// can be rendered independently and a "legend" doesn't accidentally show
// up in the current grid. `wikipediaTitle` is the exact article title used
// to look up each driver's photo and link.
const currentDrivers = [
  { name: 'Charles Leclerc', number: '16', nationality: 'Monégasque', years: '2019 – Present', stat: '16 Race Wins', wikipediaTitle: 'Charles Leclerc' },
  { name: 'Lewis Hamilton', number: '44', nationality: 'British', years: '2025 – Present', stat: '7× World Champion', wikipediaTitle: 'Lewis Hamilton' },
]

const legends = [
  { name: 'Michael Schumacher', number: '1', nationality: 'German', years: '1996 – 2006', stat: '5× World Champion', wikipediaTitle: 'Michael Schumacher' },
  { name: 'Kimi Räikkönen', number: '7', nationality: 'Finnish', years: '2007–09, 2014–18', stat: '1× World Champion', wikipediaTitle: 'Kimi Räikkönen' },
  { name: 'Sebastian Vettel', number: '5', nationality: 'German', years: '2015 – 2020', stat: '4× World Champion', wikipediaTitle: 'Sebastian Vettel' },
  { name: 'Fernando Alonso', number: '5', nationality: 'Spanish', years: '2010 – 2014', stat: '2× World Champion', wikipediaTitle: 'Fernando Alonso' },
  { name: 'Felipe Massa', number: '6', nationality: 'Brazilian', years: '2006 – 2013', stat: '11 Race Wins', wikipediaTitle: 'Felipe Massa' },
  { name: 'Rubens Barrichello', number: '2', nationality: 'Brazilian', years: '2000 – 2005', stat: '9 Race Wins', wikipediaTitle: 'Rubens Barrichello' },
]

// Framer Motion variants. The container fires a stagger so each child card
// animates in 80ms after the previous one. Gives the section a "cascade"
// feel instead of every card popping in at the same time.
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// One driver card. Renders as an <a> so the whole card is clickable and
// the browser treats it like a real link (right-click, middle-click, etc).
//
// `imageFetchPriority` tells the browser whether to prioritize this image
// in the network queue. Set to 'high' for the current grid (above the fold)
// and 'low' for the legends section so the visible cards load first.
function DriverCard({ driver, imageSrc, imageFetchPriority = 'low' }) {
  const wikiUrl = wikipediaArticleUrl(driver.wikipediaTitle)

  return (
    <MotionA
      href={wikiUrl}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      className="driver-card"
      aria-label={`${driver.name} on Wikipedia`}
      style={{
        background: 'var(--f-surface)',
        border: '1px solid var(--f-border-subtle)',
        borderLeft: '3px solid var(--f-red)',
        overflow: 'hidden',
        position: 'relative',
        display: 'block',
      }}
    >
      <div style={{
        height: '170px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--f-dark)',
      }}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            decoding="async"
            fetchPriority={imageFetchPriority}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        ) : null}
        {/* Dark gradient at the bottom of the photo so the white driver
            number on top of it stays readable no matter what colors are
            in the underlying Wikipedia image. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: imageSrc
              ? 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 45%, transparent 70%)'
              : 'transparent',
            pointerEvents: 'none',
          }}
        />

        {/* Giant faded driver number sitting in the corner. Pure decoration. */}
        <div style={{
          position: 'absolute',
          bottom: '-0.5rem',
          right: '0.5rem',
          fontFamily: 'Playfair Display, serif',
          fontWeight: 900,
          fontSize: '9rem',
          lineHeight: 1,
          color: 'var(--f-red)',
          opacity: imageSrc ? 0.12 : 0.07,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.02em',
        }}>
          {driver.number}
        </div>

        <div style={{
          position: 'absolute',
          top: '0.9rem',
          right: '1rem',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 600,
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: '#fff',
          opacity: imageSrc ? 0.95 : 0.75,
          textShadow: imageSrc ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
        }}>
          #{driver.number}
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, var(--f-border), transparent)',
        }} />
      </div>

      <div style={{ padding: '1.2rem 1.4rem 1.6rem' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--f-muted)', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>
          {driver.nationality}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--f-muted)', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
          {driver.years}
        </div>

        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          fontSize: '1.15rem',
          color: 'var(--f-cream)',
          lineHeight: 1.2,
          marginBottom: '0.65rem',
        }}>
          {driver.name}
        </div>

        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(to right, var(--f-border), transparent)',
          marginBottom: '0.65rem',
        }} />

        <div style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--f-muted)',
          letterSpacing: '0.06em',
        }}>
          {driver.stat}
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--f-muted)', letterSpacing: '0.08em' }}>
          Wikipedia →
        </div>
      </div>
    </MotionA>
  )
}

// Wraps a list of drivers in a section with a heading and a responsive grid.
// `priorityImages` is a Set of names that should load with high fetchPriority
// so the current grid (above the fold) loads before the legends.
function DriverSection({ title, drivers, thumbs, priorityImages }) {
  const [ref, fadeStyle] = useFadeIn(0)

  return (
    <section ref={ref} style={{ ...fadeStyle, marginBottom: '4.5rem' }}>
      <h3 style={{
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        fontSize: '1.4rem',
        color: 'var(--f-cream)',
        marginBottom: '1.5rem',
      }}>
        {title}
      </h3>

      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          // auto-fill makes the grid responsive without media queries.
          // It fits as many 240px columns as can fit at the current width.
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {drivers.map((driver) => (
          <DriverCard
            key={driver.name}
            driver={driver}
            imageSrc={thumbs[driver.name]}
            imageFetchPriority={priorityImages?.has(driver.name) ? 'high' : 'low'}
          />
        ))}
      </MotionDiv>
    </section>
  )
}

export default function Drivers() {
  // `thumbs` is keyed by driver name so cards can look up their image
  // synchronously: thumbs[driver.name]. Starts empty and fills in as each
  // Wikipedia request resolves.
  const [thumbs, setThumbs] = useState({})

  // Set of names that should get fetchPriority="high" on their <img>.
  // Wrapped in useMemo so we don't rebuild the Set on every render.
  const priorityNames = useMemo(
    () => new Set(currentDrivers.map((d) => d.name)),
    []
  )

  // Fire off all the Wikipedia thumbnail requests in parallel. As each one
  // comes back, we merge it into `thumbs` so the matching card can render
  // its photo immediately, no waiting for the slowest request.
  //
  // The `cancelled` flag handles the edge case where the user navigates
  // away before all requests finish: we don't want to call setState on
  // an unmounted component.
  useEffect(() => {
    let cancelled = false
    const all = [...currentDrivers, ...legends]
    all.forEach((d) => {
      getWikipediaThumbnail(d.wikipediaTitle, THUMB_SIZE)
        .then((src) => {
          if (!cancelled && src) {
            // Skip the update if we already have a thumb for this driver.
            // Avoids a useless re-render if the API somehow answers twice.
            setThumbs((prev) => (prev[d.name] ? prev : { ...prev, [d.name]: src }))
          }
        })
        .catch(() => {
          // If Wikipedia fails for one driver, the card just shows without
          // a photo. Not worth surfacing an error to the user.
        })
    })
    return () => { cancelled = true }
  }, [])

  return (
    <PagePhotoBg src={PAGE_BG_DRIVERS}>
    <div style={{
      flex: 1,
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2.5rem',
      boxSizing: 'border-box',
    }}>

      <PageTitle>Drivers</PageTitle>

      <DriverSection title="2026 Grid" drivers={currentDrivers} thumbs={thumbs} priorityImages={priorityNames} />
      <DriverSection title="Ferrari Legends" drivers={legends} thumbs={thumbs} />

    </div>
    </PagePhotoBg>
  )
}
