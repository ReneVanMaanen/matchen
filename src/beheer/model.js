export const MIN_PAREN = 2
export const MAX_PAREN = 15

const id = () => crypto.randomUUID()

export const leegPaar = () => ({ id: id(), a: { alt: '', src: '' }, b: { alt: '', src: '' } })

export const nieuweSet = () => ({
  id: id(),
  naam: '',
  vraag: '',
  kanten: { a: { label: '', vorm: 'kaart' }, b: { label: '', vorm: 'kaart' } },
  pairs: [leegPaar(), leegPaar()]
})

export const kantNaam = (set, k) => set.kanten[k].label || (k === 'a' ? 'Eerste foto' : 'Tweede foto')

// Zelfde regels als de server, maar met meldingen die naar het veld wijzen.
export function controleer(set) {
  if (!set.naam.trim()) return 'Geef de set een naam.'
  if (set.pairs.length < MIN_PAREN) return `Een set heeft minimaal ${MIN_PAREN} paren nodig.`
  for (const [i, p] of set.pairs.entries()) {
    for (const k of ['a', 'b']) {
      const wat = kantNaam(set, k).toLowerCase()
      if (!p[k].src) return `Paar ${i + 1}: kies een foto bij ${wat}.`
      if (!p[k].alt.trim()) return `Paar ${i + 1}: vul de naam bij ${wat} in.`
    }
  }
  return null
}
