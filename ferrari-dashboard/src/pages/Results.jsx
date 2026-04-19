// Race Results page. Big paginated table of every Ferrari race result for
// the chosen season (or all seasons combined). Has two search inputs that
// can be combined with AND / OR, plus an optional regex mode for power
// users. The actual filtering math lives in utils/resultSearch.js so this
// file stays focused on fetching and rendering.

import { useState, useEffect, useMemo } from 'react'
import { getSeasons } from '../utils/api'
import { filterResultRows } from '../utils/resultSearch'
import { useFadeIn } from '../hooks/useFadeIn'
import { useSeasonRaces } from '../hooks/useSeasonRaces'
import PagePhotoBg from '../components/PagePhotoBg'
import PageTitle from '../components/PageTitle'
import LoadingWithProgress from '../components/LoadingWithProgress'
import Pagination from '../components/Pagination'
import ResultsTable from '../components/ResultsTable'
import { PAGE_BG_RESULTS } from '../constants/ferrariAssets'

// Page-size choices for the paginator. 20 is a good default: fits a
// laptop screen without scrolling and keeps the row-count math friendly.
const PAGE_SIZE_OPTIONS = [10, 20, 50]

const inputStyle = {
  flex: 1,
  minWidth: '140px',
  background: 'var(--f-surface)',
  border: '1px solid var(--f-border)',
  color: 'var(--f-cream)',
  padding: '0.6rem 1rem',
  fontSize: '0.85rem',
  outline: 'none',
  borderRadius: 'var(--r-sm)',
}

const selectCompact = {
  background: 'var(--f-surface)',
  border: '1px solid var(--f-border)',
  color: 'var(--f-cream)',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8rem',
  cursor: 'pointer',
  borderRadius: 'var(--r-sm)',
}

export default function Results() {
  /** `'all'` merges every season from `seasons`; otherwise a single year. */
  const [season, setSeason] = useState(/** @type {'all' | number} */ (2023))
  const [seasons, setSeasons] = useState([])

  // Two search slots so the user can express "X AND Y" or "X OR Y"
  // without writing a real query. `booleanOp` only matters when both
  // inputs have content (the AND/OR dropdown is disabled otherwise).
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')
  const [booleanOp, setBooleanOp] = useState('AND')
  const [useRegex, setUseRegex] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [page, setPage] = useState(1)

  const [pageRef, pageStyle] = useFadeIn(0)

  // Populate the season dropdown once. If it fails, no big deal; the
  // user still has the default season selected.
  useEffect(() => {
    getSeasons().then(setSeasons).catch(() => setSeasons([]))
  }, [])

  // All the fetching, cancellation, and progress tracking lives in the
  // shared hook. Both Results and Standings use it so the loading UX
  // stays consistent.
  const { races, loading, loadProgress } = useSeasonRaces(season, seasons)

  // The API returns races nested as race -> [results]. Flatten that into
  // one row per (race, driver) so it maps 1:1 to <tr> elements. Memoized
  // because it's pure and `races` only changes on a new fetch.
  const flatRows = useMemo(() => {
    const flat = []
    races.forEach((race) => {
      (race.Results || []).forEach((result) => {
        flat.push({
          season:   race.season ?? '',
          race:     race.raceName,
          circuit:  race.Circuit.circuitName,
          round:    race.round,
          driver:   `${result.Driver.givenName} ${result.Driver.familyName}`,
          position: result.position,
          grid:     result.grid,
          points:   result.points,
          status:   result.status,
        })
      })
    })
    return flat
  }, [races])

  // Run the active filter on every keystroke. Memoized so we don't re-run
  // it on unrelated re-renders (theme toggle, hover state, pagination).
  // `regexError` comes back populated when useRegex is on and the user
  // typed an invalid pattern; we surface it under the search inputs.
  const { rows, regexError } = useMemo(
    () => filterResultRows(flatRows, search1, search2, booleanOp, useRegex),
    [flatRows, search1, search2, booleanOp, useRegex]
  )

  // Clamp `page` so it can't point past the last page when the row count
  // shrinks (e.g. user typed a search that matches fewer rows).
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pageRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Anything that changes the result set should kick the user back to
  // page 1. Otherwise they could be staring at an empty table on page 8.
  // `races` is in here too so a season switch resets pagination.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page when result set changes
    setPage(1)
  }, [races, search1, search2, booleanOp, useRegex, rowsPerPage])

  // "All seasons" view adds a Year column up front so rows from different
  // seasons don't blur together. Single-season view drops it (the year is
  // already implied by the dropdown).
  const resultHeaders =
    season === 'all'
      ? ['Year', 'Rd', 'Race', 'Circuit', 'Driver', 'Grid', 'Pos', 'Pts', 'Status']
      : ['Rd', 'Race', 'Circuit', 'Driver', 'Grid', 'Pos', 'Pts', 'Status']

  return (
    <PagePhotoBg src={PAGE_BG_RESULTS}>
    <div
      ref={pageRef}
      style={{
        ...pageStyle,
        flex: 1,
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2.5rem',
        boxSizing: 'border-box',
      }}
    >

      <PageTitle>Race Results</PageTitle>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={season === 'all' ? 'all' : String(season)}
          onChange={(e) => {
            const v = e.target.value
            setSeason(v === 'all' ? 'all' : Number(v))
          }}
          style={{
            background: 'var(--f-surface)',
            border: '1px solid var(--f-border)',
            color: 'var(--f-cream)',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            borderRadius: 'var(--r-sm)',
          }}
        >
          <option value="all">All seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s} season</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--f-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
          />
          Regex
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--f-muted)', fontSize: '0.8rem' }}>
          Rows / page
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            style={selectCompact}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={useRegex ? 'Term 1 (regex)' : 'Search term 1 (race, driver, circuit…)'}
          value={search1}
          onChange={(e) => setSearch1(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 200px' }}
        />
        <select
          value={booleanOp}
          onChange={(e) => setBooleanOp(e.target.value)}
          disabled={!search1.trim() || !search2.trim()}
          title="Used when both terms are filled"
          style={{
            ...selectCompact,
            opacity: !search1.trim() || !search2.trim() ? 0.45 : 1,
            flex: '0 0 auto',
          }}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        <input
          type="text"
          placeholder={useRegex ? 'Term 2 (regex, optional)' : 'Term 2 (optional)'}
          value={search2}
          onChange={(e) => setSearch2(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 200px' }}
        />
      </div>
      {regexError && (
        <p style={{ color: 'var(--f-red)', fontSize: '0.8rem', marginBottom: '1rem', marginTop: 0 }}>
          {regexError}
        </p>
      )}

      {loading ? (
        <LoadingWithProgress
          label={season === 'all'
            ? 'Loading all seasons (up to 4 years at a time)…'
            : 'Loading results…'}
          loadProgress={season === 'all' ? loadProgress : null}
        />
      ) : (
        <>
          <ResultsTable
            rows={pageRows}
            headers={resultHeaders}
            showSeasonColumn={season === 'all'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setPage={setPage}
            pageRowCount={pageRows.length}
            totalRowCount={rows.length}
          />
        </>
      )}
    </div>
    </PagePhotoBg>
  )
}
