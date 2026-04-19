// Top-level shell: navbar, animated page swap, footer. The list of
// pages itself lives in src/constants/pages.js so adding or reordering
// a route only requires touching one file (Navbar reads from there too).

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import { PAGES } from './constants/pages'

// Aliasing `motion.div` to a capitalized name so the linter recognizes
// it as a JSX component (the base no-unused-vars rule doesn't see
// lowercase `motion` used in JSX as a real reference).
const MotionDiv = motion.div

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

const pageStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: 0,
}

export default function App() {
  const [page, setPage] = useState('home')

  // Snap to the top on every page change. Otherwise switching from a
  // long page (Results) to a short one leaves the scroll position
  // halfway down the new view.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar page={page} setPage={setPage} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          {/* Render the matching page from the static PAGES array.
              Iterating (vs. const PageComponent = lookup(...)) keeps
              each Component reference statically known, which the
              react-hooks/static-components rule requires. */}
          {PAGES.map(
            // eslint-disable-next-line no-unused-vars -- Component IS used as <Component /> below; base ESLint just doesn't see JSX usage.
            ({ id, Component }) =>
              id === page ? (
                <MotionDiv key={id} {...pageTransition} style={pageStyle}>
                  <Component setPage={setPage} />
                </MotionDiv>
              ) : null
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
