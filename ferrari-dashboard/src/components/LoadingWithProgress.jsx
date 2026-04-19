// Centered loading message + (optional) progress bar for the "all seasons"
// fetch. Pulled out of Results/Standings so the same loader UI shows up
// in both places without copy-pasted JSX.
//
// Props:
//   label         - text shown above the bar (e.g. "Loading standings…")
//   loadProgress  - { completed, total } | null. When null, only the label
//                   shows. When present and total > 0, the bar fills in.

export default function LoadingWithProgress({ label, loadProgress }) {
  const showBar = loadProgress && loadProgress.total > 0
  const pct = showBar
    ? Math.min(100, (100 * loadProgress.completed) / loadProgress.total)
    : 0

  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem 3rem' }}>
      <p
        style={{
          color: 'var(--f-muted)',
          letterSpacing: '0.06em',
          fontSize: '0.85rem',
          marginBottom: showBar ? '1.25rem' : 0,
        }}
      >
        {label}
      </p>
      {showBar && (
        <>
          <p style={{ color: 'var(--f-cream)', fontSize: '0.8rem', marginBottom: '0.65rem', fontWeight: 500 }}>
            {loadProgress.completed} / {loadProgress.total} seasons
          </p>
          <div
            role="progressbar"
            aria-valuenow={loadProgress.completed}
            aria-valuemin={0}
            aria-valuemax={loadProgress.total}
            style={{
              maxWidth: 380,
              margin: '0 auto',
              height: 8,
              borderRadius: 'var(--r-sm)',
              background: 'var(--f-border-subtle)',
              border: '1px solid var(--f-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--f-red)',
                transition: 'width 0.2s ease-out',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
