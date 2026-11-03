import { isIngelogd, leesData, schrijfData, controleer } from './_lib.js'

// Beheer: alle sets lezen (GET) of in één keer opslaan (PUT).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!isIngelogd(req)) return res.status(401).json({ fout: 'Log opnieuw in.' })

  try {
    if (req.method === 'GET') {
      const { actief, sets } = await leesData()
      return res.status(200).json({ actief, sets })
    }
    if (req.method === 'PUT') {
      const data = { actief: req.body?.actief ?? null, sets: req.body?.sets }
      const fout = controleer(data)
      if (fout) return res.status(400).json({ fout })
      const versie = await schrijfData(data)
      return res.status(200).json({ ok: true, versie })
    }
    res.status(405).json({ fout: 'Alleen GET en PUT zijn toegestaan.' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ fout: 'Opslaan of laden is mislukt. Probeer het opnieuw.' })
  }
}
