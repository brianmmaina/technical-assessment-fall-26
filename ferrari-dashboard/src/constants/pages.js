// Single source of truth for the app's pages. Both App.jsx (which renders
// the active page) and Navbar.jsx (which renders the link list) import
// from here, so adding or reordering a page is one change instead of two.
//
// The `id` is what App.jsx tracks in state and what Navbar uses to mark
// the active link. The `label` is the visible nav text. `Component` is
// the page itself.

import Home from '../pages/Home'
import Results from '../pages/Results'
import Standings from '../pages/Standings'
import Drivers from '../pages/Drivers'

export const PAGES = [
  { id: 'home',      label: 'Home',      Component: Home },
  { id: 'drivers',   label: 'Drivers',   Component: Drivers },
  { id: 'results',   label: 'Results',   Component: Results },
  { id: 'standings', label: 'Standings', Component: Standings },
]
