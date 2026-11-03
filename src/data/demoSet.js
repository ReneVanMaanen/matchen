// Fictieve voorbeeldset (boeken en auteurs) zodat het spel zonder backend te testen is.
const svg = (s) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`

function kaft(titel, kleur) {
  const tekst = titel.split(' ').map((w, i) =>
    `<text x="150" y="${150 + i * 46}" font-family="Georgia,serif" font-size="38" fill="#fff" text-anchor="middle">${w}</text>`
  ).join('')
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect width="300" height="450" fill="${kleur}"/><rect width="14" height="450" fill="rgba(0,0,0,.18)"/>${tekst}<rect x="110" y="380" width="80" height="3" fill="#fff" opacity=".7"/></svg>`)
}

function portret(initialen, kleur) {
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="${kleur}"/><circle cx="150" cy="160" r="70" fill="rgba(255,255,255,.55)"/><path d="M40 400c10-90 60-130 110-130s100 40 110 130z" fill="rgba(255,255,255,.55)"/><text x="150" y="178" font-family="system-ui,sans-serif" font-size="48" font-weight="700" fill="#1d2b3a" text-anchor="middle">${initialen}</text></svg>`)
}

const data = [
  ['De stille haven', 'Mila Verbeek', 'MV', '#2f5d62', '#c9d8c5'],
  ['Zout op de dijk', 'Joost Hamer', 'JH', '#7a3b2e', '#e8c9b5'],
  ['Het blauwe uur', 'Sanne Dekker', 'SD', '#26407a', '#c3cde6'],
  ['Kruimels in de la', 'Fatma Yilmaz', 'FY', '#6b4e8a', '#ddd0ea'],
  ['Wind uit het noorden', 'Pieter Bos', 'PB', '#3f6b3a', '#cfe0c3'],
  ['Brieven aan niemand', 'Lotte de Wit', 'LW', '#8a6a1f', '#ecdcae']
]

// Datamodel van een set:
// {
//   id, naam, versie,
//   vraag: 'Kop boven het spel',
//   kanten: { a: { label, vorm: 'kaart' | 'portret' }, b: { label, vorm } },
//   pairs: [{ id, a: { alt, src }, b: { alt, src } }]
// }
export const demoSet = {
  id: 'demo',
  naam: 'Voorbeeldset',
  versie: 'demo',
  vraag: 'Welk boek hoort bij welke auteur?',
  kanten: {
    a: { label: 'Boek', vorm: 'kaart' },
    b: { label: 'Auteur', vorm: 'portret' }
  },
  pairs: data.map(([titel, naam, ini, kaftKleur, portretKleur], i) => ({
    id: `demo-${i + 1}`,
    a: { alt: titel, src: kaft(titel, kaftKleur) },
    b: { alt: naam, src: portret(ini, portretKleur) }
  }))
}
