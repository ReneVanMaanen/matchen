import { useCallback, useEffect, useRef, useState } from 'react'
import { shuffle } from '../lib/shuffle.js'
import { useIdle } from '../lib/useIdle.js'
import { formatTime } from '../lib/formatTime.js'

const IDLE_MS = 5 * 60 * 1000   // na 5 minuten zonder aanraking: reset
const FOUT_MS = 1100            // hoe lang een fout paar zichtbaar blijft
const START_TEKST = 'Tik een foto en daarna de foto die erbij hoort.'
const STANDAARD_VRAAG = 'Welke foto\u2019s horen bij elkaar?'
const STANDAARD_KANT = { label: '', vorm: 'kaart' }

// Een paar bestaat uit kant a en kant b. Per set bepaal je hoe elke kant
// heet (label, voor schermlezers) en hoe hij getoond wordt (vorm).
function buildCards(set) {
  const kanten = { a: { ...STANDAARD_KANT, ...set.kanten?.a }, b: { ...STANDAARD_KANT, ...set.kanten?.b } }
  return shuffle(
    set.pairs.flatMap((p) =>
      ['a', 'b'].map((kant) => ({
        key: `${p.id}-${kant}`,
        pairId: p.id,
        vorm: kanten[kant].vorm,
        label: kanten[kant].label ? `${kanten[kant].label}: ${p[kant].alt}` : p[kant].alt,
        src: p[kant].src
      }))
    )
  )
}

export default function Game({ set, bron, onOpenBeheer }) {
  const [cards, setCards] = useState(() => buildCards(set))
  const [eerste, setEerste] = useState(null)        // key van de eerste keuze
  const [fout, setFout] = useState(null)            // [key, key] van een fout paar
  const [opgelost, setOpgelost] = useState({})      // pairId -> volgnummer
  const [startTijd, setStartTijd] = useState(null)
  const [eindTijd, setEindTijd] = useState(null)    // verstreken ms bij afronden
  const [nu, setNu] = useState(Date.now())
  const [melding, setMelding] = useState({ tekst: START_TEKST, soort: 'info' })
  const foutTimer = useRef()
  const dialogRef = useRef()

  const totaal = set.pairs.length
  const aantalOpgelost = Object.keys(opgelost).length

  const reset = useCallback((aankondigen = true) => {
    clearTimeout(foutTimer.current)
    setCards(buildCards(set))
    setEerste(null)
    setFout(null)
    setOpgelost({})
    setStartTijd(null)
    setEindTijd(null)
    setMelding({
      tekst: aankondigen ? "Nieuw spel: de foto's zijn opnieuw geschud." : START_TEKST,
      soort: 'info'
    })
    if (dialogRef.current?.open) dialogRef.current.close()
  }, [set])

  // Nieuwe set: opnieuw beginnen
  useEffect(() => { reset(false) }, [reset])

  // Klok laten lopen tijdens het spel
  useEffect(() => {
    if (!startTijd || eindTijd != null) return
    const id = setInterval(() => setNu(Date.now()), 1000)
    return () => clearInterval(id)
  }, [startTijd, eindTijd])

  // Felicitatie tonen
  useEffect(() => {
    if (eindTijd != null && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
    }
  }, [eindTijd])

  useIdle(IDLE_MS, () => { if (startTijd) reset(false) })

  const verstreken = eindTijd ?? (startTijd ? nu - startTijd : 0)

  function tik(card) {
    if (opgelost[card.pairId] !== undefined || fout) return

    if (!startTijd) {
      const t = Date.now()
      setStartTijd(t)
      setNu(t)
    }

    if (!eerste) {
      setEerste(card.key)
      setMelding({ tekst: 'Kies nu de foto die erbij hoort.', soort: 'info' })
      return
    }

    if (eerste === card.key) {
      setEerste(null)
      setMelding({ tekst: 'Keuze ongedaan gemaakt.', soort: 'info' })
      return
    }

    const eersteCard = cards.find((c) => c.key === eerste)
    setEerste(null)

    if (eersteCard.pairId === card.pairId) {
      const nummer = aantalOpgelost + 1
      setOpgelost((o) => ({ ...o, [card.pairId]: nummer }))
      if (nummer === totaal) {
        const ms = Date.now() - (startTijd ?? Date.now())
        setEindTijd(ms)
        setMelding({ tekst: `Alles goed! Je tijd: ${formatTime(ms)}.`, soort: 'goed' })
      } else {
        setMelding({ tekst: `Goed! Dat is paar ${nummer} van ${totaal}.`, soort: 'goed' })
      }
    } else {
      setFout([eerste, card.key])
      setMelding({ tekst: 'Deze twee horen niet bij elkaar. Probeer het opnieuw.', soort: 'fout' })
      foutTimer.current = setTimeout(() => setFout(null), FOUT_MS)
    }
  }

  return (
    <main className="app">
      <header className="kop">
        <h1>{set.vraag || STANDAARD_VRAAG}</h1>
        <div className="status">
          <span>{aantalOpgelost} van {totaal} paren</span>
          <span><span className="sr-only">Tijd: </span>{formatTime(verstreken)}</span>
        </div>
        <button type="button" className="knop" onClick={() => reset(true)}>
          Opnieuw schudden
        </button>
      </header>

      <p className="melding" data-soort={melding.soort} role="status" aria-live="polite">
        {melding.tekst}
      </p>

      <ul className="raster">
        {cards.map((c) => {
          const nummer = opgelost[c.pairId]
          const isOpgelost = nummer !== undefined
          const isGekozen = eerste === c.key
          const isFout = fout?.includes(c.key)
          const staat = isOpgelost ? 'opgelost' : isFout ? 'fout' : isGekozen ? 'gekozen' : 'open'
          const label = c.label + (isOpgelost ? `, opgelost als paar ${nummer}` : '')

          return (
            <li key={c.key}>
              <button
                type="button"
                className={`tegel tegel--${c.vorm}`}
                data-staat={staat}
                aria-pressed={isGekozen}
                aria-disabled={isOpgelost}
                aria-label={label}
                onClick={() => tik(c)}
              >
                <img src={c.src} alt="" draggable="false" />
                {isOpgelost && <span className="badge badge--goed" aria-hidden="true">✓ {nummer}</span>}
                {isFout && <span className="badge badge--fout" aria-hidden="true">✕</span>}
                {isGekozen && <span className="badge badge--gekozen" aria-hidden="true">1</span>}
              </button>
            </li>
          )
        })}
      </ul>

      <footer className="voet">
        {bron === 'demo' && <span>Voorbeeldset</span>}
        {bron === 'offline' && <span>Offline: laatst geladen set</span>}
        <button type="button" className="beheerknop" onClick={onOpenBeheer}>Beheer</button>
      </footer>

      <dialog
        ref={dialogRef}
        className="felicitatie"
        aria-labelledby="felicitatie-titel"
        onCancel={(e) => { e.preventDefault(); reset(true) }}
      >
        <h2 id="felicitatie-titel">Gefeliciteerd!</h2>
        <p>Je hebt alle {totaal} paren gevonden in</p>
        <p className="eindtijd">{formatTime(eindTijd ?? 0)}</p>
        <button type="button" className="knop knop--vol" onClick={() => reset(true)} autoFocus>
          Nog een keer
        </button>
      </dialog>
    </main>
  )
}
