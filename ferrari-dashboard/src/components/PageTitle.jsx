// Big serif page heading used at the top of Results, Standings, and
// Drivers. Same style block was copy-pasted in each file. One component
// means one place to tweak the type scale.

export default function PageTitle({ children }) {
  return (
    <h2
      style={{
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        fontSize: '2.2rem',
        marginBottom: '2rem',
        color: 'var(--f-cream)',
      }}
    >
      {children}
    </h2>
  )
}
