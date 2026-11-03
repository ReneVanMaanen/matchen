import { useEffect, useState } from 'react'
import Game from './game/Game.jsx'
import Beheer from './beheer/Beheer.jsx'
import { loadActiveSet } from './data/setStore.js'

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const inBeheer = useHash() === '#beheer'
  const [state, setState] = useState({ status: 'laden', set: null, bron: null })

  // Set (opnieuw) laden bij het openen van het spel en na terugkeer uit het beheer
  useEffect(() => {
    if (inBeheer) return
    let actueel = true
    loadActiveSet().then(({ set, bron }) => { if (actueel) setState({ status: 'klaar', set, bron }) })
    return () => { actueel = false }
  }, [inBeheer])

  if (inBeheer) {
    return <Beheer onClose={() => { window.location.hash = '' }} />
  }

  if (state.status === 'laden') {
    return <main className="app"><p className="laden">Foto’s laden…</p></main>
  }

  return (
    <Game
      set={state.set}
      bron={state.bron}
      onOpenBeheer={() => { window.location.hash = 'beheer' }}
    />
  )
}
