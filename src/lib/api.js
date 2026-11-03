const KEY = 'matchen-token'

export const token = {
  get: () => { try { return sessionStorage.getItem(KEY) } catch { return null } },
  set: (t) => { try { sessionStorage.setItem(KEY, t) } catch { /* privémodus */ } },
  wis: () => { try { sessionStorage.removeItem(KEY) } catch { /* privémodus */ } }
}

export class ApiFout extends Error {
  constructor(bericht, status) {
    super(bericht)
    this.status = status
  }
}

const GEEN_API = 'De server reageert niet. Draai je lokaal? Gebruik dan "vercel dev" in plaats van "npm run dev".'

async function verzoek(pad, { method = 'GET', body } = {}) {
  const t = token.get()
  let r
  try {
    r = await fetch(pad, {
      method,
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    })
  } catch {
    throw new ApiFout('Geen verbinding. Het beheer werkt alleen met internet.', 0)
  }
  let json = null
  try { json = await r.json() } catch { /* geen JSON */ }
  if (!r.ok) throw new ApiFout(json?.fout || (r.status === 404 ? GEEN_API : `Er ging iets mis (code ${r.status}).`), r.status)
  if (json === null) throw new ApiFout(GEEN_API, r.status)
  return json
}

export const api = {
  login: (pin) => verzoek('/api/login', { method: 'POST', body: { pin } }),
  sets: () => verzoek('/api/sets'),
  bewaar: (data) => verzoek('/api/sets', { method: 'PUT', body: data }),
  foto: (data, type) => verzoek('/api/foto', { method: 'POST', body: { data, type } })
}
