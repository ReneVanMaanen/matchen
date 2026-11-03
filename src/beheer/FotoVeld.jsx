import { useId, useState } from 'react'
import { api } from '../lib/api.js'
import { verklein } from '../lib/verklein.js'

export default function FotoVeld({ titel, vorm, waarde, onChange, onUploadBezig, onSessieVerlopen }) {
  const naamId = useId()
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  async function kies(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setFout('Kies een afbeelding.'); return }
    setFout('')
    setBezig(true)
    onUploadBezig(1)
    try {
      const { data, type } = await verklein(file)
      const { url } = await api.foto(data, type)
      onChange((oud) => ({ ...oud, src: url }))
    } catch (err) {
      if (err.status === 401) onSessieVerlopen()
      setFout(err.message || 'Uploaden is mislukt.')
    } finally {
      setBezig(false)
      onUploadBezig(-1)
    }
  }

  return (
    <fieldset className="fotoveld">
      <legend>{titel}</legend>
      <div className={`fotovoorbeeld fotovoorbeeld--${vorm}`}>
        {waarde.src ? <img src={waarde.src} alt="" /> : <span>Nog geen foto</span>}
      </div>
      <div className="fotoveld-invoer">
        <label className="knop knop--klein uploadknop">
          <input type="file" accept="image/*" onChange={kies} disabled={bezig} />
          {bezig ? 'Uploaden…' : waarde.src ? 'Andere foto' : 'Foto kiezen'}
        </label>
        <label htmlFor={naamId}>Naam</label>
        <input
          id={naamId}
          type="text"
          value={waarde.alt}
          onChange={(e) => { const v = e.target.value; onChange((oud) => ({ ...oud, alt: v })) }}
          aria-describedby={`${naamId}-hint`}
        />
        <span id={`${naamId}-hint`} className="hint">Niet zichtbaar in het spel; wordt voorgelezen door schermlezers.</span>
        {fout && <span className="veldfout" role="alert">{fout}</span>}
      </div>
    </fieldset>
  )
}
