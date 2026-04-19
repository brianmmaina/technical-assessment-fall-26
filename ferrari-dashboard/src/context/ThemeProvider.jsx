import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext.js'

// localStorage key for remembering the user's choice across reloads
const STORAGE_KEY = 'ferrari-theme'

// Wraps the app and exposes { theme, setTheme, toggleTheme } to any
// component via the useTheme hook. The actual styling lives in CSS; this
// provider just sets `data-theme="light" | "dark"` on the <html> element
// and the CSS variables in index.css respond to that attribute.
export default function ThemeProvider({ children }) {
  // Read the saved preference on first render so we never flash the wrong
  // theme. The function form of useState makes sure this runs once, not
  // on every re-render. Falls back to 'dark' for new visitors.
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' ? 'light' : 'dark'
  })

  // Anytime `theme` changes: flip the attribute on <html> so the CSS picks
  // up the new variable values, and persist the choice for next visit.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage can throw if the user is in private mode or out of
      // quota. Not worth crashing the app over, just skip the save.
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  // useMemo so the provider value isn't a brand-new object every render.
  // Otherwise every consumer of the context would re-render even when
  // nothing actually changed.
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
