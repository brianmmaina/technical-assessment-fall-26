/**
 * Page photo: dimmed + heavy cream wash so it stays in the background.
 */
export default function PagePhotoBg({ src, children }) {
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        isolation: 'isolate',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.65,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'var(--f-page-wash)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          backgroundImage: 'var(--f-page-grid)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
