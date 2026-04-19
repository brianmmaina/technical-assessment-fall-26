// Shared fetch logic for any page that wants Ferrari race results for a
// given season (or all seasons combined). The Results and Standings pages
// were doing the exact same dance: set loading, kick off the right fetch,
// guard against the user changing seasons mid-flight, expose progress for
// the "all seasons" case. Pulling it into one hook keeps both pages
// focused on rendering and means there's only one place to fix bugs.
//
// Usage:
//   const { races, loading, error, loadProgress } = useSeasonRaces(season, seasons)

import { useState, useEffect } from 'react'
import { getRaceResults, getRaceResultsAllSeasons } from '../utils/api'

export function useSeasonRaces(season, seasons) {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Only populated while an "all seasons" load is in flight.
  const [loadProgress, setLoadProgress] = useState(/** @type {null | { completed: number, total: number }} */ (null))

  useEffect(() => {
    let cancelled = false
    /* eslint-disable react-hooks/set-state-in-effect -- reset fetch UI before async load */
    setLoading(true)
    setError(null)
    setLoadProgress(null)
    /* eslint-enable react-hooks/set-state-in-effect */

    // "All seasons" depends on the season list being loaded first.
    // If it's not in yet, bail out. The effect reruns when `seasons` updates.
    if (season === 'all' && seasons.length === 0) {
      setRaces([])
      setLoading(false)
      return () => { cancelled = true }
    }

    const finish = () => {
      if (!cancelled) {
        setLoading(false)
        setLoadProgress(null)
      }
    }

    const handleError = (e) => {
      if (cancelled) return
      setRaces([])
      setError(e instanceof Error ? e.message : 'Could not load race data.')
      finish()
    }

    if (season === 'all') {
      setLoadProgress({ completed: 0, total: seasons.length })
      getRaceResultsAllSeasons(seasons, (p) => {
        if (!cancelled) setLoadProgress({ completed: p.completed, total: p.total })
      })
        .then((data) => {
          if (cancelled) return
          setRaces(Array.isArray(data) ? data : [])
          finish()
        })
        .catch(handleError)
    } else {
      getRaceResults(season)
        .then((data) => {
          if (cancelled) return
          setRaces(Array.isArray(data) ? data : [])
          finish()
        })
        .catch(handleError)
    }

    // cancellation guard so a slow response from the previous season
    // doesn't clobber the new one
    return () => { cancelled = true }
  }, [season, seasons])

  return { races, loading, error, loadProgress }
}
