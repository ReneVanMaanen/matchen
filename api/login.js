import { pinKlopt, maakToken } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ fout: 'Alleen POST is toegestaan.' })
  const pin = String(req.body?.pin ?? '')
  if (!pinKlopt(pin)) {
    await new Promise((r) => setTimeout(r, 1000)) // remt raden af
    return res.status(401).json({ fout: 'Deze pincode klopt niet.' })
  }
  res.status(200).json({ token: maakToken() })
}
