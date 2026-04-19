// Subtle full-viewport animated background. Two soft red "embers" drift
// across the screen on long, offset loops so the motion never feels
// repetitive at a glance. Mounted once at the App level, position: fixed,
// pointer-events: none. Pages with their own photo backgrounds (Drivers,
// Results, Standings) sit on top and cover this layer; on the Home page
// the hero is transparent so the embers show through behind the title.
//
// Animation runs in CSS keyframes (no framer-motion / RAF) so it costs
// almost nothing. The keyframes themselves live in index.css alongside
// the rest of the global styles. The whole layer is hidden when the user
// has prefers-reduced-motion set.

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="animated-bg"
    >
      <div className="animated-bg__ember animated-bg__ember--a" />
      <div className="animated-bg__ember animated-bg__ember--b" />
    </div>
  )
}
