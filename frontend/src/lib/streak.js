const TOKEN_PREFIX = 'vc_streak_'

export function getOrCreateToken(cafeId) {
  const key = TOKEN_PREFIX + cafeId
  let data = null
  try {
    const raw = localStorage.getItem(key)
    if (raw) data = JSON.parse(raw)
  } catch {}

  if (!data) {
    data = {
      token: Math.random().toString(36).slice(2) + Date.now().toString(36),
      visits: 0,
      lastVisit: null
    }
  }
  return data
}

export function incrementStreak(cafeId) {
  const key = TOKEN_PREFIX + cafeId
  const data = getOrCreateToken(cafeId)
  data.visits += 1
  data.lastVisit = new Date().toISOString()
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
  return data
}

export function getStreakData(cafeId) {
  return getOrCreateToken(cafeId)
}
