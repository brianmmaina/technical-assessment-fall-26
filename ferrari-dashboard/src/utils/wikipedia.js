// Pulls driver headshots straight from Wikipedia instead of bundling them
// in the repo. Two upsides: the photos stay current (when a driver moves
// teams or gets a new portrait, we get the update for free) and I'm not
// committing a bunch of binary files to git.

const WIKI_API = 'https://en.wikipedia.org/w/api.php'

/**
 * Looks up the main thumbnail for a Wikipedia article and returns its URL.
 * Returns null if the article doesn't exist or has no image.
 *
 * The `origin=*` param is the important one. Without it the browser
 * blocks the request because of CORS. Wikipedia treats `origin=*` as
 * "anonymous cross-origin allowed" and includes the right headers.
 */
export async function getWikipediaThumbnail(pageTitle, thumbSize = 480) {
  if (!pageTitle?.trim()) return null
  const params = new URLSearchParams({
    action: 'query',
    titles: pageTitle.trim(),
    prop: 'pageimages',     // ask for the article's main image
    format: 'json',
    formatversion: '2',     // v2 returns pages as an array, easier to handle
    pithumbsize: String(thumbSize), // request a pre-resized version (saves bandwidth)
    origin: '*',            // CORS unlock; see comment above
  })
  const res = await fetch(`${WIKI_API}?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  // formatversion=2 puts pages in an array; we only ever query one title
  const page = data.query?.pages?.[0]
  if (!page || page.missing) return null
  return page.thumbnail?.source ?? null
}

// Builds the public Wikipedia URL for a given article title so the driver
// cards can link out. Wikipedia uses underscores instead of spaces in the
// path, hence the replace.
export function wikipediaArticleUrl(pageTitle) {
  const encoded = encodeURIComponent(pageTitle.trim().replace(/ /g, '_'))
  return `https://en.wikipedia.org/wiki/${encoded}`
}
