import { useContext } from 'react'
import { ThemeContext } from '../context/themeContext.js'

// Tiny wrapper around useContext(ThemeContext) so consumers don't have to
// import both the context and the React hook.
//
// The throw-on-null guard catches the easy mistake of using this hook in
// a component that isn't wrapped by <ThemeProvider>. Better to fail loudly
// at dev time than to silently return undefined and crash later.
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
