// Standings page. Pick a season (or "All seasons" for the full Ferrari
// history), then render two views of that data:
//   1. A driver standings table, sorted by points
//   2. A line chart, points per race for a single season, or points per
//      season when viewing the full history
//
// All the heavy lifting (fetching, retry logic, aggregation) lives in
// utils/api.js. This file is mostly fetch-on-season-change wiring plus
// the loading / error UI.

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  getSeasons,
  deriveStandingsFromRaces,
  chartDataPointsPerSeason,
} from '../utils/api'
import { useFadeIn } from '../hooks/useFadeIn'
import { useSeasonRaces } from '../hooks/useSeasonRaces'
import PagePhotoBg from '../components/PagePhotoBg'
import PageTitle from '../components/PageTitle'
import LoadingWithProgress from '../components/LoadingWithProgress'
import { PAGE_BG_STANDINGS } from '../constants/ferrariAssets'

export default function Standings() {
  // `season` is either a year (number) or the string 'all'. Storing both
  // in one piece of state keeps the dropdown logic simple. The JSDoc
  // comment is just there so my editor gets the type right.
  const [season, setSeason] = useState(/** @type {'all' | number} */ (2023))
  const [seasons, setSeasons] = useState([])

  const [pageRef, pageStyle] = useFadeIn(0)

  // Fetch the dropdown options once on mount. If this fails we just leave
  // the list empty; the user can still pick the default season.
  useEffect(() => {
    getSeasons().then(setSeasons).catch(() => setSeasons([]))
  }, [])

  // All the fetching, cancellation, and progress tracking lives in the
  // shared hook so this page (and Results) stay focused on rendering.
  const { races, loading, error, loadProgress } = useSeasonRaces(season, seasons)

  // Aggregations are pure functions of `races`, so memoize them.
  // Without useMemo the table and chart would re-derive on every render
  // (theme toggle, hover state, etc), which gets expensive at ~1500 rows.
  const { standings, chartData: chartPerRace } = useMemo(
    () => deriveStandingsFromRaces(races),
    [races]
  )

  // Pick the right chart shape for the current view: per-season totals
  // for "All seasons", per-race points for a single year.
  const chartData = useMemo(
    () => (season === 'all' ? chartDataPointsPerSeason(races) : chartPerRace),
    [season, races, chartPerRace]
  )

  return (
    <PagePhotoBg src={PAGE_BG_STANDINGS}>
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

        <PageTitle>Standings</PageTitle>

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
            marginBottom: '1.75rem',
            letterSpacing: '0.05em',
            borderRadius: 'var(--r-sm)',
          }}
        >
          <option value="all">All seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s} season</option>
          ))}
        </select>

        {loading ? (
          <LoadingWithProgress
            label={season === 'all'
              ? 'Loading all seasons (up to 4 years at a time)…'
              : 'Loading standings…'}
            loadProgress={season === 'all' ? loadProgress : null}
          />
        ) : (
          <>
            {error && (
              <p
                role="alert"
                style={{
                  color: 'var(--f-red)',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--f-surface)',
                  border: '1px solid var(--f-border)',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                {error}
              </p>
            )}

            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                marginBottom: '0.75rem',
                color: 'var(--f-cream)',
                letterSpacing: '0.02em',
              }}>
                Drivers, {season === 'all' ? 'all seasons (combined)' : season}
              </h3>
              <div style={{
                overflowX: 'auto',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--f-border-subtle)',
                background: 'var(--f-surface)',
                boxShadow: 'var(--f-shadow-sm)',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--f-border)' }}>
                      {['Pos', 'Driver', 'Points', 'Wins'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === 'Driver' ? 'left' : 'center',
                            padding: '0.85rem 1rem',
                            color: 'var(--f-muted)',
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {standings.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--f-muted)' }}>
                          No Ferrari results for this season.
                        </td>
                      </tr>
                    ) : (
                      standings.map((row, i) => (
                        <tr key={row.Driver.driverId} className="t-row">
                          <td style={{
                            padding: '0.9rem 1rem',
                            textAlign: 'center',
                            fontFamily: 'Playfair Display, serif',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: i === 0 ? 'var(--f-red)' : 'var(--f-muted)',
                          }}>
                            {row.position}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--f-cream)' }}>
                            {row.Driver.givenName} {row.Driver.familyName}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--f-cream)' }}>
                            {row.points}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'center', color: 'var(--f-muted)' }}>
                            {row.wins}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* No useFadeIn here: opacity 0 breaks Recharts width measurement */}
            <section
              style={{
                background: 'var(--f-surface)',
                border: '1px solid var(--f-border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '1.75rem',
                boxShadow: 'var(--f-shadow-sm)',
                minHeight: 400,
              }}
            >
              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                marginBottom: '0.35rem',
                color: 'var(--f-cream)',
              }}>
                {season === 'all' ? (
                  <>Ferrari team points by <span style={{ color: 'var(--f-red)', fontStyle: 'italic' }}>season</span> (all-time)</>
                ) : (
                  <>Team points per race, <span style={{ color: 'var(--f-red)', fontStyle: 'italic' }}>{season}</span></>
                )}
              </h3>
              <div style={{ width: '32px', height: '1px', background: 'var(--f-gold)', marginBottom: '1.25rem', opacity: 0.4 }} />

              <div style={{ width: '100%', height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 56 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--f-border-subtle)" />
                    <XAxis
                      dataKey="race"
                      tick={{ fill: 'var(--f-muted)', fontSize: 10 }}
                      angle={-38}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      stroke="var(--f-border)"
                    />
                    <YAxis
                      tick={{ fill: 'var(--f-muted)', fontSize: 10 }}
                      stroke="var(--f-border)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--f-charcoal)',
                        border: '1px solid var(--f-border)',
                        color: 'var(--f-cream)',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--r-sm)',
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--f-muted)', paddingTop: '0.75rem', fontSize: '0.78rem' }} />
                    <Line
                      type="monotone"
                      dataKey="points"
                      name={season === 'all' ? 'Season points' : 'Points'}
                      stroke="var(--f-red)"
                      strokeWidth={1.75}
                      dot={{ fill: 'var(--f-gold)', r: 3 }}
                      activeDot={{ r: 5, fill: 'var(--f-gold)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </div>
    </PagePhotoBg>
  )
}
