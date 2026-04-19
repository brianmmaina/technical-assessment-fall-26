// Pagination controls for the Results table. Pulled out of Results.jsx
// because it was 60+ lines of buttons + nav-button styling that had no
// business living next to fetch / filter logic.
//
// API is intentionally minimal: tell me the current page and total page
// count, hand me a setter, I'll render the buttons. The "Showing X of Y"
// caption underneath is here too because it's only ever displayed
// alongside the controls.

const navBtn = (disabled) => ({
  background: 'none',
  border: '1px solid var(--f-border)',
  borderRadius: 'var(--r-sm)',
  color: disabled ? 'var(--f-border)' : 'var(--f-cream)',
  padding: '0.5rem 1rem',
  cursor: disabled ? 'default' : 'pointer',
  fontWeight: 500,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
})

export default function Pagination({
  currentPage,
  totalPages,
  setPage,
  pageRowCount,
  totalRowCount,
}) {
  const atStart = currentPage === 1
  const atEnd = currentPage === totalPages
  const onlyOnePage = totalPages <= 1

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.6rem',
        marginTop: '1.8rem',
      }}>
        <button
          type="button"
          onClick={() => setPage(1)}
          disabled={atStart || onlyOnePage}
          style={navBtn(atStart || onlyOnePage)}
        >
          « Start
        </button>
        <button
          type="button"
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={atStart}
          style={navBtn(atStart)}
        >
          ← Prev
        </button>
        <span style={{ color: 'var(--f-muted)', fontSize: '0.8rem', letterSpacing: '0.08em', padding: '0 0.25rem' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={atEnd}
          style={navBtn(atEnd)}
        >
          Next →
        </button>
        <button
          type="button"
          onClick={() => setPage(totalPages)}
          disabled={atEnd || onlyOnePage}
          style={navBtn(atEnd || onlyOnePage)}
        >
          End »
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--f-muted)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
        Showing {pageRowCount} of {totalRowCount} results
      </p>
    </>
  )
}
