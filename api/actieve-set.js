import { leesData } from './_lib.js'

// Openbaar: de set die het spel toont.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const data = await leesData()
    const set = data.sets.find((s) => s.id === data.actief)
    if (!set) return res.status(404).json({ fout: 'Er is geen actieve set.' })
    res.status(200).json({ ...set, versie: data.versie })
  } catch (e) {
    console.error(e)
    res.status(500).json({ fout: 'De set kon niet geladen worden.' })
  }
}
