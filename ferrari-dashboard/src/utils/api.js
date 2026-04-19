// All F1 data goes through this file. The original Ergast API got shut down,
// so we hit jolpica instead. It's a community-run mirror with the exact
// same endpoints and response shape, so the Ergast docs still apply.
const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

// tiny helper so I can `await sleep(ms)` between retries
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// Wrapper around fetch with a retry loop. When the Standings/Results pages
// load "all seasons" we fire ~15 requests at once and jolpica sometimes
// answers with 429 (rate limited) or 503 (service busy). Instead of failing,
// we wait a bit and try again. Anything else (404, 500, network error) bails
// out immediately because retrying won't help.
async function fetchErgastJson(url) {
  let lastStatus
  for (let attempt = 0; attempt < 4; attempt++) {
    // back off a bit longer each try: 0ms, 280ms, 560ms, 840ms
    if (attempt > 0) await sleep(280 * attempt)
    const res = await fetch(url)
    lastStatus = res.status
    if (res.ok) return res.json()
    if (res.status !== 429 && res.status !== 503) break
  }
  // Friendlier error message for the rate-limit case so the UI can show
  // "wait a sec" instead of a generic failure.
  const err = new Error(
    lastStatus === 429 || lastStatus === 503
      ? 'F1 data is temporarily rate-limited. Wait a moment and try again.'
      : 'Could not load F1 data.'
  )
  err.status = lastStatus
  throw err
}

// Every Ferrari race result for one season. Always returns an array, even
// if the season has no data, so the caller never has to null-check.
//
// I tack `season` onto every race object because when we merge multiple
// seasons together later, the original API response only puts the season
// on the wrapper, not on each race.
export async function getRaceResults(season = 2023) {
  const data = await fetchErgastJson(
    `${BASE_URL}/${season}/constructors/ferrari/results.json?limit=100`
  )
  const table = data?.MRData?.RaceTable
  const races = Array.isArray(table?.Races) ? table.Races : []
  const year = table?.season != null ? String(table.season) : String(season)
  return races.map((race) => ({
    ...race,
    season: year,
  }))
}

/**
 * Loads multiple seasons in parallel and merges them into one sorted list.
 *
 * Naive approach: Promise.all on every season at once. That works but it
 * spams jolpica with 15+ requests instantly and triggers the rate limiter.
 * Instead I run a small worker pool (4 in flight at a time) so we still get
 * the speed boost but stay polite to the API.
 *
 * `onProgress` is optional; Standings uses it to drive the progress bar.
 *
 * @param {number[]} seasonList
 * @param {(p: { completed: number, total: number, season: number }) => void} [onProgress]
 * @param {{ concurrency?: number }} [opts]
 */
export async function getRaceResultsAllSeasons(seasonList, onProgress, opts = {}) {
  if (!Array.isArray(seasonList) || seasonList.length === 0) return []
  // never spin up more workers than there are seasons to fetch
  const concurrency = Math.max(1, Math.min(opts.concurrency ?? 4, seasonList.length))
  const queue = [...seasonList]
  const total = queue.length
  const merged = []
  let completed = 0

  // Each worker pulls the next season off the shared queue, fetches it,
  // adds its races to `merged`, and loops until the queue is empty.
  // Because all workers share the same queue, slow seasons don't block
  // fast ones from making progress.
  async function worker() {
    while (queue.length > 0) {
      const s = queue.shift()
      if (s === undefined) break
      try {
        const races = await getRaceResults(s)
        merged.push(...races)
      } catch {
        // one bad season shouldn't tank the whole load; skip it and move on
      }
      completed += 1
      onProgress?.({ completed, total, season: s })
    }
  }

  // kick off N workers and wait for all of them to drain the queue
  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  // Workers race each other so `merged` is in finish-order, not season-order.
  // Sort by season then by round so the chart and table read left-to-right
  // chronologically.
  merged.sort((a, b) => {
    const sy = Number(a.season) - Number(b.season)
    if (sy !== 0) return sy
    return Number(a.round) - Number(b.round)
  })
  return merged
}

// One row per race: race name + total points Ferrari scored that race.
// The "(race.Results || [])" reduce sums both drivers' points for the team.
function chartDataFromRaces(races) {
  return (races || []).map((race) => ({
    race: (race.raceName || '').replace(' Grand Prix', '') || '-',
    points: (race.Results || []).reduce((sum, r) => sum + Number(r.points), 0),
  }))
}

// Same shape as `chartDataFromRaces` but bucketed by year instead of by race.
// Used when "all seasons" is selected so the chart shows team points per year.
export function chartDataPointsPerSeason(races) {
  const bySeason = new Map()
  for (const race of races || []) {
    const y = race.season != null ? String(race.season) : ''
    if (!y) continue
    const pts = (race.Results || []).reduce((sum, r) => sum + (Number(r.points) || 0), 0)
    bySeason.set(y, (bySeason.get(y) || 0) + pts)
  }
  return [...bySeason.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([season, points]) => ({
      race: season,
      points,
    }))
}

// Builds the driver-standings table from raw race results.
// I do this client-side because the constructor-standings endpoint only
// returns the team total, not per-driver totals.
function driverStandingsFromRaces(races) {
  const byId = new Map()
  for (const race of races || []) {
    for (const r of race.Results || []) {
      const id = r.Driver?.driverId
      if (!id) continue
      // first time we see this driver, set up their bucket
      if (!byId.has(id)) {
        byId.set(id, { Driver: r.Driver, points: 0, wins: 0 })
      }
      const row = byId.get(id)
      row.points += Number(r.points) || 0
      // position is a string in the API, "1" means race winner
      if (String(r.position) === '1') row.wins += 1
    }
  }
  // highest points first, then assign 1, 2, 3... as the position
  const sorted = [...byId.values()].sort((a, b) => b.points - a.points)
  return sorted.map((row, i) => ({
    position: String(i + 1),
    positionText: String(i + 1),
    points: String(row.points),
    wins: String(row.wins),
    Driver: row.Driver,
  }))
}

// Convenience: take raw races and hand back both things the Standings page
// needs. Pure function (no fetch), so it's safe to call inside useMemo.
export function deriveStandingsFromRaces(races) {
  const list = Array.isArray(races) ? races : []
  return {
    chartData: chartDataFromRaces(list),
    standings: driverStandingsFromRaces(list),
  }
}

// Returns every season Ferrari has competed in, newest first.
// Used to populate the season dropdown on Results and Standings.
export async function getSeasons() {
  const data = await fetchErgastJson(
    `${BASE_URL}/constructors/ferrari/seasons.json?limit=100`
  )
  return data.MRData.SeasonTable.Seasons
    .map((s) => Number(s.season))
    .sort((a, b) => b - a)
}
