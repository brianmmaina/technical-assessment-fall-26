// Central place for every image/video URL used in the app. Doing it this
// way means I only have to fix one path if I rename a file in /public, and
// it makes the imports in each page read like English (HOME_HERO_SRC vs
// '/hero.jpg').

// Builds a URL into the /public folder that respects Vite's `base` config.
// If the app gets deployed to a sub-path like example.com/ferrari/, Vite
// sets BASE_URL = '/ferrari/' and this function makes sure the asset URL
// gets that prefix instead of pointing at the root domain.
export function publicAsset(filename) {
  const base = import.meta.env.BASE_URL || '/'
  // strip any leading slash so we don't end up with '//file.jpg'
  const name = filename.startsWith('/') ? filename.slice(1) : filename
  return `${base}${name}`
}

// SF shield logo, transparent background so it works on cream and dark UI.
export const FERRARI_LOGO_SRC = publicAsset('ferrari-logo.png')

// Home page assets: the hero plays a video clip if it loads, otherwise
// falls back to HOME_HERO_SRC, then to a CSS gradient if even the image
// fails. HOME_FEATURE_SRC is the photo lower down the page (and gets
// reused as the Results page background, so the alias is intentional).
export const HOME_HERO_SRC = publicAsset('hero.jpg')
export const HOME_HERO_VIDEO_SRC = publicAsset('hero.mp4')
export const HOME_FEATURE_SRC = publicAsset('feature.jpg')

// Background photo for each non-home page, dimmed by PagePhotoBg so the
// foreground content stays readable.
export const PAGE_BG_RESULTS = publicAsset('feature.jpg')
export const PAGE_BG_STANDINGS = publicAsset('bg-standings.jpg')
export const PAGE_BG_DRIVERS = publicAsset('bg-drivers.jpg')
