import { get, set as idbSet } from 'idb-keyval'
import { demoSet } from './demoSet.js'

const KEY = 'actieve-set'

// Foto lokaal bewaren als data-URL; lukt dat niet, dan het online adres gebruiken.
async function bewaarLokaal(url) {
  try { return await naarDataUrl(url) } catch { return url }
}

async function naarDataUrl(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Foto niet geladen: ${url}`)
  const blob = await r.blob()
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}

// 1. Online: actieve set ophalen; foto's lokaal bewaren zodat het spel offline werkt.
// 2. Offline: laatst bewaarde set gebruiken.
// 3. Niets bewaard: voorbeeldset.
export async function loadActiveSet() {
  try {
    const r = await fetch('/api/actieve-set', { cache: 'no-store' })
    if (!r.ok) throw new Error('Geen actieve set')
    const remote = await r.json()

    const cached = await get(KEY)
    if (cached && cached.versie === remote.versie) return { set: cached, bron: 'cache' }

    const pairs = await Promise.all(
      remote.pairs.map(async (p) => ({
        id: p.id,
        a: { alt: p.a.alt, src: await bewaarLokaal(p.a.src) },
        b: { alt: p.b.alt, src: await bewaarLokaal(p.b.src) }
      }))
    )
    const local = { ...remote, pairs }
    await idbSet(KEY, local)
    return { set: local, bron: 'online' }
  } catch {
    const cached = await get(KEY).catch(() => null)
    if (cached) return { set: cached, bron: 'offline' }
    return { set: demoSet, bron: 'demo' }
  }
}
