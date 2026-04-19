import { createContext } from 'react'

// Lives in its own file (not next to ThemeProvider) so that the hook
// (useTheme) and the provider can both import it without creating a
// circular dependency. Default value is null so useTheme can detect when
// it's used outside the provider and throw a clear error.
export const ThemeContext = createContext(null)
