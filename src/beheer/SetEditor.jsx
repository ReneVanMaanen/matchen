import { useState } from 'react'
import FotoVeld from './FotoVeld.jsx'
import { MAX_PAREN, MIN_PAREN, controleer, kantNaam, leegPaar } from './model.js'

export default function SetEditor({ set: begin, isNieuw, bezig, serverFout, onBewaar, onAnnuleer, onSessieVerlopen }) {
  const [set, setSet] = useState(begin)
  const [fout, setFout] = useState('')
  const [uploads, setUploads] = useState(0)

  const wijzig = (fn) => {
    setFout('')
    setSet((s) => { const kopie = structuredClone(s); fn(kopie); return kopie })
  }

  const wijzigKant = (paarId, k) => (nieuw) => wijzig((c) => {
    const p = c.pairs.find((x) => x.id === paarId)
    if (p) p[k] = typeof nieuw === 'function' ? nieuw(p[k]) : nieuw
  })

  function opslaan() {
    const f = controleer(set)
    if (f) { setFout(f); return }
    setFout('')
    onBewaar({
      ...set,
      naam: set.naam.trim(),
      vraag: set.vraag.trim(),
      pairs: set.pairs.map((p) => ({ ...p, a: { ...p.a, alt: p.a.alt.trim() }, b: { ...p.b, alt: p.b.alt.trim() } }))
    })
  }

  return (
    <main className="app beheer">
      <header className="kop">
        <h1>{isNieuw ? 'Nieuwe set' : `Set bewerken`}</h1>
      </header>

      <section className="blok" aria-labelledby="algemeen">
        <h2 id="algemeen">Algemeen</h2>
        <div className="veld">
          <label htmlFor="set-naam">Naam van de set</label>
          <input id="set-naam" type="text" value={set.naam}
            onChange={(e) => { const v = e.target.value; wijzig((c) => { c.naam = v }) }}
            aria-describedby="set-naam-hint" />
          <span id="set-naam-hint" className="hint">Alleen zichtbaar in het beheer.</span>
        </div>
        <div className="veld">
          <label htmlFor="set-vraag">Vraag boven het spel</label>
          <input id="set-vraag" type="text" value={set.vraag}
            onChange={(e) => { const v = e.target.value; wijzig((c) => { c.vraag = v }) }}
            aria-describedby="set-vraag-hint" />
          <span id="set-vraag-hint" className="hint">Bijvoorbeeld: Welk boek hoort bij welke auteur? Leeg laten geeft: Welke foto’s horen bij elkaar?</span>
        </div>
      </section>

      <section className="blok" aria-labelledby="kanten">
        <h2 id="kanten">De twee foto’s van een paar</h2>
        <div className="kanten">
          {['a', 'b'].map((k) => (
            <fieldset key={k} className="kant">
              <legend>{k === 'a' ? 'Eerste foto' : 'Tweede foto'}</legend>
              <div className="veld">
                <label htmlFor={`kant-${k}-label`}>Soort</label>
                <input id={`kant-${k}-label`} type="text" value={set.kanten[k].label}
                  onChange={(e) => { const v = e.target.value; wijzig((c) => { c.kanten[k].label = v }) }}
                  aria-describedby={`kant-${k}-hint`} />
                <span id={`kant-${k}-hint`} className="hint">Bijvoorbeeld Boek of Auteur.</span>
              </div>
              <div className="veld">
                <label htmlFor={`kant-${k}-vorm`}>Weergave</label>
                <select id={`kant-${k}-vorm`} value={set.kanten[k].vorm}
                  onChange={(e) => { const v = e.target.value; wijzig((c) => { c.kanten[k].vorm = v }) }}>
                  <option value="kaart">Hele foto (bijv. boekkaft)</option>
                  <option value="portret">Ovaal portret</option>
                </select>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="blok" aria-labelledby="paren">
        <h2 id="paren">Paren <span className="teller">{set.pairs.length} van maximaal {MAX_PAREN}</span></h2>
        <ol className="paren">
          {set.pairs.map((p, i) => (
            <li key={p.id} className="paar">
              <div className="paar-kop">
                <h3>Paar {i + 1}</h3>
                {set.pairs.length > MIN_PAREN && (
                  <button type="button" className="knop knop--klein knop--gevaar"
                    onClick={() => wijzig((c) => { c.pairs = c.pairs.filter((x) => x.id !== p.id) })}>
                    Paar {i + 1} verwijderen
                  </button>
                )}
              </div>
              <div className="paar-velden">
                {['a', 'b'].map((k) => (
                  <FotoVeld
                    key={k}
                    titel={kantNaam(set, k)}
                    vorm={set.kanten[k].vorm}
                    waarde={p[k]}
                    onChange={wijzigKant(p.id, k)}
                    onUploadBezig={(d) => setUploads((n) => n + d)}
                    onSessieVerlopen={onSessieVerlopen}
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
        {set.pairs.length < MAX_PAREN && (
          <button type="button" className="knop" onClick={() => wijzig((c) => { c.pairs.push(leegPaar()) })}>
            Paar toevoegen
          </button>
        )}
      </section>

      {(fout || serverFout) && <p className="melding" data-soort="fout" role="alert">{fout || serverFout}</p>}

      <div className="actiebalk">
        <button type="button" className="knop knop--vol" onClick={opslaan} disabled={bezig || uploads > 0}>
          {bezig ? 'Opslaan…' : uploads > 0 ? 'Foto’s uploaden…' : 'Set opslaan'}
        </button>
        <button type="button" className="knop" onClick={onAnnuleer} disabled={bezig}>Annuleren</button>
      </div>
    </main>
  )
}
