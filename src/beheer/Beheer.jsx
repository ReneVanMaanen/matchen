// Volgende stap: pincode (server-side gecontroleerd), sets aanmaken/bewerken,
// per set vraag en kanten (label + vorm) instellen, foto's uploaden
// (verkleind naar ~600px WebP), actieve set kiezen.
export default function Beheer({ onClose }) {
  return (
    <main className="app">
      <h1>Beheer</h1>
      <p>Hier komen straks de pincode en het beheer van de sets.</p>
      <button type="button" className="knop" onClick={onClose}>Terug naar het spel</button>
    </main>
  )
}
