// Inline SVG of the Ferrari prancing horse shield.
// size controls the width; height is calculated from the 44:54 aspect ratio.
// Pass a style prop for positioning (e.g. the giant watermark on the home page).
export default function FerrariShield({ size = 32, style = {} }) {
  const height = Math.round(size * 54 / 44)

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 44 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      aria-hidden="true"
    >
      {/* Red shield with gold border */}
      <path
        d="M22 2L42 10V33Q42 48 22 53Q2 48 2 33V10Z"
        fill="#DC0000"
        stroke="#C9A227"
        strokeWidth="1.5"
      />

      {/* Prancing horse: stroke-based silhouette, facing left, rearing up.
          Main body: left hind hoof → up leg → haunch → back → withers → neck → head →
          chin/jaw → poll → crest → back → rump → right hind hoof.
          Two front legs raised. Tail sweeping up. */}
      <path
        d="
          M15 44
          C14 40 14 36 15 32
          C16 28 18 26 20 22
          C21 19 21 16 19 12
          C18 10 16 10 15 12
          C14 14 16 15 18 14
          C20 14 21 12 23 11
          C25 10 27 12 26 16
          C25 20 26 24 27 29
          C27 34 26 38 28 44
          M18 26 C15 23 13 20 14 17
          M21 23 C25 19 27 16 26 14
          M27 29 C30 25 32 20 30 16
        "
        stroke="#F5F0E8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
