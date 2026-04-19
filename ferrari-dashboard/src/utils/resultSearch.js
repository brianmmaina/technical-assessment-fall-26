// Search/filter logic for the Results table.
// Lives in its own file so the component stays focused on rendering and
// so I can swap out the matching strategy (regex vs plain text, AND vs OR)
// without touching the JSX.

// Mash every value of a row into one big string so the user can search
// across race name, driver, circuit, etc. with one input. Faster than
// checking each field individually and easier to extend if I add columns.
function buildRowText(row) {
  return Object.values(row)
    .map((v) => String(v))
    .join(' ')
}

// Tests one term against the row text. Returns { ok, match } so the caller
// can tell the difference between "doesn't match" and "the regex itself
// is invalid". The second case is shown to the user as an error.
function termMatches(text, term, useRegex) {
  const t = term.trim()
  // empty term means "no filter from this slot"; treat as a match
  if (!t) return { ok: true, match: true }
  if (!useRegex) {
    // plain mode: case-insensitive substring search
    return { ok: true, match: text.toLowerCase().includes(t.toLowerCase()) }
  }
  try {
    const re = new RegExp(t, 'i')
    return { ok: true, match: re.test(text) }
  } catch {
    // user typed bad regex (e.g. unclosed bracket); flag it instead of crashing
    return { ok: false, match: false }
  }
}

/**
 * Filters the table rows using up to two search terms combined with AND/OR.
 * Returns the filtered rows and an error message if either regex was invalid.
 *
 * Behavior:
 *   - both terms empty  -> return everything unchanged
 *   - only one term     -> simple include/regex filter
 *   - both terms        -> combine with AND or OR depending on `op`
 *
 * @param {Array<object>} flatRows
 * @param {string} term1
 * @param {string} term2
 * @param {'AND' | 'OR'} op
 * @param {boolean} useRegex
 * @returns {{ rows: Array<object>, regexError: string | null }}
 */
export function filterResultRows(flatRows, term1, term2, op, useRegex) {
  const t1 = term1.trim()
  const t2 = term2.trim()

  // shortcut: nothing to filter on, hand back the original list
  if (!t1 && !t2) {
    return { rows: flatRows, regexError: null }
  }

  // Validate the regexes up front (once) instead of inside the row loop.
  // If a regex is bad we return zero rows + a message the UI can display.
  if (useRegex) {
    if (t1) {
      try {
        new RegExp(t1, 'i')
      } catch {
        return { rows: [], regexError: 'Invalid regex in first search field' }
      }
    }
    if (t2) {
      try {
        new RegExp(t2, 'i')
      } catch {
        return { rows: [], regexError: 'Invalid regex in second search field' }
      }
    }
  }

  const rows = flatRows.filter((row) => {
    const text = buildRowText(row)

    // default to true so an empty term doesn't exclude anything when
    // it's combined with the other term via AND/OR below
    let m1 = true
    if (t1) {
      const r = termMatches(text, t1, useRegex)
      if (!r.ok) return false
      m1 = r.match
    }

    let m2 = true
    if (t2) {
      const r = termMatches(text, t2, useRegex)
      if (!r.ok) return false
      m2 = r.match
    }

    // explicit branches for the four cases. Easier to read than one big
    // boolean expression with implicit short-circuiting
    if (t1 && !t2) return m1
    if (!t1 && t2) return m2
    if (t1 && t2) return op === 'AND' ? m1 && m2 : m1 || m2
    return true
  })

  return { rows, regexError: null }
}
