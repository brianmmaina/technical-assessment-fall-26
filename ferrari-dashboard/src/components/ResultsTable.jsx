// The actual results table for the Results page. Pulled out so Results.jsx
// can stay focused on filters / pagination / state and not have ~80 lines
// of <thead>/<tbody> markup with inline cell styles inline at the bottom.
//
// `showSeasonColumn` adds the Year column up front. We can't infer it
// from the rows alone because some seasons have a single row that still
// needs the column to align with rows from other seasons.

const cellMuted = { padding: '0.9rem 0.7rem', color: 'var(--f-muted)' }
const cellStrong = { padding: '0.9rem 0.7rem', fontWeight: 500, color: 'var(--f-cream)' }

export default function ResultsTable({ rows, headers, showSeasonColumn }) {
  const colCount = headers.length

  return (
    <div style={{
      overflowX: 'auto',
      borderRadius: 'var(--r-md)',
      border: '1px solid var(--f-border-subtle)',
      background: 'var(--f-surface)',
      boxShadow: 'var(--f-shadow-sm)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.875rem',
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--f-border)' }}>
            {headers.map((h) => (
              <th key={h} style={{
                textAlign: 'left',
                padding: '0.85rem 0.7rem',
                color: 'var(--f-muted)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} style={{ textAlign: 'center', padding: '2rem', color: 'var(--f-muted)' }}>
                No results match your search.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={`${row.season}-${row.round}-${row.race}-${row.driver}-${row.position}-${row.grid}`}
                className="t-row"
              >
                {showSeasonColumn && (
                  <td style={{ padding: '0.9rem 0.7rem', color: 'var(--f-muted)', fontWeight: 600 }}>
                    {row.season}
                  </td>
                )}
                <td style={cellMuted}>{row.round}</td>
                <td style={cellStrong}>
                  {row.race.replace(' Grand Prix', ' GP')}
                </td>
                <td style={cellMuted}>{row.circuit}</td>
                <td style={cellStrong}>{row.driver}</td>
                <td style={cellMuted}>{row.grid}</td>
                <td style={{
                  padding: '0.9rem 0.7rem',
                  color: row.position === '1' ? 'var(--f-red)' : 'var(--f-cream)',
                  fontWeight: row.position === '1' ? 600 : 400,
                }}>
                  P{row.position}
                </td>
                <td style={{ padding: '0.9rem 0.7rem', color: 'var(--f-cream)', fontWeight: 600 }}>{row.points}</td>
                <td style={{
                  padding: '0.9rem 0.7rem',
                  color: row.status === 'Finished' ? 'var(--f-muted)' : 'var(--f-red)',
                  fontSize: '0.8rem',
                }}>
                  {row.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
