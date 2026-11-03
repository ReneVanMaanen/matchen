import { isIngelogd, bewaarFoto } from './_lib.js'

const TYPES = ['image/webp', 'image/jpeg', 'image/png']
const MAX_BYTES = 1.5 * 1024 * 1024

// Beheer: één (al verkleinde) foto uploaden als base64.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Alleen POST is toegestaan.' })
  if (!isIngelogd(req)) return res.status(401).json({ fout: 'Log opnieuw in.' })

  const { data, type } = req.body ?? {}
  if (!TYPES.includes(type) || typeof data !== 'string') {
    return res.status(400).json({ fout: 'Dit bestandstype wordt niet ondersteund.' })
  }
  const buffer = Buffer.from(data, 'base64')
  if (!buffer.length || buffer.length > MAX_BYTES) {
    return res.status(400).json({ fout: 'De foto is te groot.' })
  }

  try {
    const url = await bewaarFoto(buffer, type)
    res.status(200).json({ url })
  } catch (e) {
    console.error(e)
    res.status(500).json({ fout: 'Uploaden is mislukt. Probeer het opnieuw.' })
  }
}
