import { useEffect, useState } from 'react'
import { api, token } from '../lib/api.js'
import SetEditor from './SetEditor.jsx'
import { nieuweSet } from './model.js'

function PinScherm({ melding, onIngelogd, onClose }) {
  const [pin, setPin] = useState('')
  const [fout, setFout] = useState(melding || '')
  const [bezig, setBezig] = useState(false)

  async function inloggen(e) {
    e.preventDefault()
    setBezig(true)
    setFout('')
    try {
      const { token: t } = await api.login(pin)
      token.set(t)
      onIngelogd()
    } catch (err) {
      setFout(err.message)
      setPin('')
      setBezig(false)
    }
  }

  return (
    <main className="app beheer beheer--smal">
      <h1>Beheer</h1>
      <form onSubmit={inloggen} className="pinformulier">
        <div className="veld">
          <label htmlFor="pin">Pincode</label>
          <input id="pin" type="password" inputMode="numeric" autoComplete="off" autoFocus
            value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            aria-describedby={fout ? 'pin-fout' : undefined} aria-invalid={!!fout} />
          {fout && <span id="pin-fout" className="veldfout" role="alert">{fout}</span>}
        </div>
        <div className="knoppen">
          <button type="submit" className="knop knop--vol" disabled={bezig || !pin}>
            {bezig ? 'Controleren…' : 'Inloggen'}
          </button>
          <button type="button" className="knop" onClick={onClose}>Terug naar het spel</button>
        </div>
      </form>
    </main>
  )
}

export default function Beheer({ onClose }) {
  const [ingelogd, setIngelogd] = useState(() => !!token.get())
  const [data, setData] = useState(null)            // { actief, sets }
  const [laden, setLaden] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [melding, setMelding] = useState('')
  const [bewerk, setBewerk] = useState(null)        // { set, isNieuw }

  function sessieVerlopen() {
    token.wis()
    setIngelogd(false)
    setBewerk(null)
    setData(null)
    setFout('Je sessie is verlopen. Log opnieuw in.')
  }

  const afhandelen = (err) => (err.status === 401 ? sessieVerlopen() : setFout(err.message))

  useEffect(() => {
    if (!ingelogd) return
    setLaden(true)
    setFout('')
    api.sets()
      .then((d) => setData({ actief: d.actief, sets: d.sets }))
      .catch(afhandelen)
      .finally(() => setLaden(false))
  }, [ingelogd])

  async function bewaar(nieuw, tekst) {
    setBezig(true)
    setFout('')
    setMelding('')
    try {
      await api.bewaar(nieuw)
      setData(nieuw)
      setMelding(tekst)
      return true
    } catch (err) {
      afhandelen(err)
      return false
    } finally {
      setBezig(false)
    }
  }

  function uitloggen() {
    token.wis()
    setIngelogd(false)
    setData(null)
    setMelding('')
    setFout('')
  }

  if (!ingelogd) {
    return <PinScherm melding={fout} onIngelogd={() => { setFout(''); setIngelogd(true) }} onClose={onClose} />
  }

  if (bewerk) {
    return (
      <SetEditor
        set={bewerk.set}
        isNieuw={bewerk.isNieuw}
        bezig={bezig}
        serverFout={fout}
        onSessieVerlopen={sessieVerlopen}
        onAnnuleer={() => { setBewerk(null); setFout('') }}
        onBewaar={async (set) => {
          const sets = bewerk.isNieuw ? [...data.sets, set] : data.sets.map((s) => (s.id === set.id ? set : s))
          const nieuw = { actief: data.actief ?? set.id, sets }
          if (await bewaar(nieuw, `Set “${set.naam}” is opgeslagen.`)) setBewerk(null)
        }}
      />
    )
  }

  function verwijder(s) {
    const actiefTekst = s.id === data.actief ? ' Dit is de actieve set; het spel schakelt dan over naar een andere set.' : ''
    if (!window.confirm(`Set “${s.naam}” verwijderen?${actiefTekst} Dit kun je niet ongedaan maken.`)) return
    const sets = data.sets.filter((x) => x.id !== s.id)
    const actief = data.actief === s.id ? (sets[0]?.id ?? null) : data.actief
    bewaar({ actief, sets }, `Set “${s.naam}” is verwijderd.`)
  }

  return (
    <main className="app beheer">
      <header className="kop">
        <h1>Beheer</h1>
        <div className="knoppen">
          <button type="button" className="knop" onClick={onClose}>Naar het spel</button>
          <button type="button" className="knop" onClick={uitloggen}>Uitloggen</button>
        </div>
      </header>

      <div aria-live="polite">
        {melding && <p className="melding" data-soort="goed">{melding}</p>}
      </div>
      {fout && <p className="melding" data-soort="fout" role="alert">{fout}</p>}

      {laden && <p>Sets laden…</p>}

      {data && (
        <section aria-labelledby="sets-kop">
          <h2 id="sets-kop">Sets</h2>
          {data.sets.length === 0 && (
            <p>Er zijn nog geen sets. Je eerste set wordt meteen de actieve set in het spel.</p>
          )}
          <ul className="setlijst">
            {data.sets.map((s) => {
              const actief = s.id === data.actief
              return (
                <li key={s.id} className="setrij" data-actief={actief}>
                  <div className="setrij-info">
                    <strong>{s.naam}</strong>
                    <span className="sub">
                      {s.pairs.length} paren{actief && <span className="label-actief">Actief in het spel</span>}
                    </span>
                  </div>
                  <div className="knoppen">
                    <button type="button" className="knop knop--klein" disabled={bezig}
                      onClick={() => { setMelding(''); setBewerk({ set: structuredClone(s), isNieuw: false }) }}>
                      Bewerken<span className="sr-only"> {s.naam}</span>
                    </button>
                    {!actief && (
                      <button type="button" className="knop knop--klein" disabled={bezig}
                        onClick={() => bewaar({ ...data, actief: s.id }, `“${s.naam}” is nu actief in het spel.`)}>
                        Actief maken<span className="sr-only"> {s.naam}</span>
                      </button>
                    )}
                    <button type="button" className="knop knop--klein knop--gevaar" disabled={bezig}
                      onClick={() => verwijder(s)}>
                      Verwijderen<span className="sr-only"> {s.naam}</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <button type="button" className="knop knop--vol" disabled={bezig}
            onClick={() => { setMelding(''); setFout(''); setBewerk({ set: nieuweSet(), isNieuw: true }) }}>
            Nieuwe set
          </button>
        </section>
      )}
    </main>
  )
}
