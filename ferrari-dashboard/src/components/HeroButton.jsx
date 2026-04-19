// Reusable Ferrari-styled button for the Home page. Replaces four
// near-identical button blocks (3 hero CTAs + the "Meet the Drivers"
// button at the bottom of the page) that were each ~25 lines of inline
// styles plus DOM-mutation hover handlers.
//
// All hover styling now lives in index.css (.btn-primary:hover,
// .btn-secondary:hover) so we don't need any of the
// onMouseEnter / onMouseLeave dance to swap colors.
//
// Variants:
//   primary   - solid red background, white text. Main CTA.
//   secondary - transparent + cream border. Default secondary.
// Modifier:
//   accent    - on a secondary button, switches the hover color from
//               cream to red. Used for "Meet the Drivers" so it stands
//               out against the lower section's calmer background.

export default function HeroButton({
  variant = 'secondary',
  accent = false,
  children,
  ...rest
}) {
  const className = [
    'btn',
    variant === 'primary' ? 'btn-primary' : 'btn-secondary',
    accent ? 'btn-secondary--accent' : '',
  ].filter(Boolean).join(' ')

  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  )
}
