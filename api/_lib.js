// Gedeelde code voor de API. Bestanden die met _ beginnen worden door Vercel
// niet als eigen route gepubliceerd.
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto'
import { put, list, del } from '@vercel/blob'

// Pincode voor het beheer. Vast ingesteld; overschrijfbaar via de
// omgevingsvariabele MATCHEN_PIN in Vercel.
const PIN = process.env.MATCHEN_PIN || '43214321'
const GEHEIM = process.env.MATCHEN_SECRET || `matchen:${PIN}`
const SESSIE_MS = 12 * 60 * 60 * 1000          // inloggen geldt 12 uur
const OPRUIM_MARGE_MS = 60 * 60 * 1000          // ongebruikte foto's pas na 1 uur weg

// ---------- inloggen ----------

const onderteken = (waarde) => createHmac('sha256', GEHEIM).update(waarde).digest('hex')

function gelijk(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export const pinKlopt = (pin) => gelijk(pin, PIN)

export function maakToken() {
  const verloopt = String(Date.now() + SESSIE_MS)
  return `${verloopt}.${onderteken(verloopt)}`
}

export function isIngelogd(req) {
  const kop = req.headers.authorization || ''
  const token = kop.startsWith('Bearer ') ? kop.slice(7) : ''
  const [verloopt, handtekening] = token.split('.')
  if (!verloopt || !handtekening) return false
  if (Number(verloopt) < Date.now()) return false
  return gelijk(handtekening, onderteken(verloopt))
}

// ---------- opslag (Vercel Blob) ----------
// Alle sets staan samen in één JSON-bestand. Elke wijziging schrijft een nieuw
// bestand (data/<tijd>.json) en ruimt het vorige op. Zo heeft elke versie een
// eigen adres en kan een cache nooit een oude versie teruggeven.

async function alleBlobs(prefix) {
  const blobs = []
  let cursor
  do {
    const r = await list({ prefix, cursor, limit: 1000 })
    blobs.push(...r.blobs)
    cursor = r.hasMore ? r.cursor : undefined
  } while (cursor)
  return blobs
}

export async function leesData() {
  const blobs = await alleBlobs('data/')
  if (!blobs.length) return { actief: null, sets: [], versie: null }
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  const r = await fetch(blobs[0].url, { cache: 'no-store' })
  if (!r.ok) throw new Error('Gegevens niet leesbaar')
  const data = await r.json()
  return { actief: data.actief ?? null, sets: data.sets ?? [], versie: blobs[0].pathname }
}

export async function schrijfData({ actief, sets }) {
  const pad = `data/${Date.now()}-${randomUUID().slice(0, 8)}.json`
  await put(pad, JSON.stringify({ actief, sets }), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false
  })

  // Opruimen: oude databestanden en foto's die in geen enkele set meer voorkomen
  const oud = (await alleBlobs('data/')).filter((b) => b.pathname !== pad).map((b) => b.url)
  const inGebruik = new Set(sets.flatMap((s) => s.pairs.flatMap((p) => [p.a.src, p.b.src])))
  const grens = Date.now() - OPRUIM_MARGE_MS
  const wees = (await alleBlobs('fotos/'))
    .filter((b) => !inGebruik.has(b.url) && new Date(b.uploadedAt).getTime() < grens)
    .map((b) => b.url)
  const weg = [...oud, ...wees]
  if (weg.length) await del(weg)

  return pad
}

export async function bewaarFoto(buffer, type) {
  const ext = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[type]
  const blob = await put(`fotos/${randomUUID()}.${ext}`, buffer, {
    access: 'public',
    contentType: type,
    addRandomSuffix: false
  })
  return blob.url
}

// ---------- controle ----------

export function controleer(data) {
  if (!data || !Array.isArray(data.sets)) return 'Ongeldige gegevens.'
  const ids = new Set()
  for (const s of data.sets) {
    if (!s?.id || ids.has(s.id)) return 'Elke set heeft een unieke id nodig.'
    ids.add(s.id)
    if (!String(s.naam ?? '').trim()) return 'Elke set heeft een naam nodig.'
    if (!Array.isArray(s.pairs) || s.pairs.length < 2 || s.pairs.length > 15) {
      return `Set "${s.naam}" moet 2 tot 15 paren hebben.`
    }
    for (const p of s.pairs) {
      for (const k of ['a', 'b']) {
        const kant = p?.[k]
        if (!kant || !String(kant.alt ?? '').trim() || !String(kant.src ?? '').startsWith('https://')) {
          return `Set "${s.naam}": elk paar heeft twee foto's met een naam nodig.`
        }
      }
    }
  }
  if (data.actief && !ids.has(data.actief)) return 'De actieve set bestaat niet.'
  return null
}
