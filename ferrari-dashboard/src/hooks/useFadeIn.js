import { useRef, useEffect, useState } from 'react'

// Little hook for the "fade up when scrolled into view" effect that's
// used on most of the pages.
//
// Usage:
//   const [ref, style] = useFadeIn()
//   <div ref={ref} style={style}>...</div>
//
// `delay` is in ms; useful for staggering a row of cards so they fade
// in one after another instead of all at once.
export function useFadeIn(delay = 0) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // IntersectionObserver is the modern way to do this. Way better than
    // listening to scroll events and doing math, because the browser tells
    // us exactly when the element enters the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          // We only want this to fire once. Unobserve so the animation
          // doesn't replay if the user scrolls back up past the element.
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 } // trigger when 10% of the element is on screen
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Returning the style as inline JS (instead of toggling a CSS class)
  // means the consumer doesn't have to import any CSS to use this hook.
  return [
    ref,
    {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    },
  ]
}
