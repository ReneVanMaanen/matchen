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
  const hash = useHash()
  const [state, setState] = useState({ status: 'laden', set: null, bron: null })

  useEffect(() => {
    loadActiveSet().then(({ set, bron }) => setState({ status: 'klaar', set, bron }))
  }, [])

  if (hash === '#beheer') {
    return <Beheer onClose={() => { window.location.hash = '' }} />
  }

  if (state.status === 'laden') {
    return <main className="app"><p className="laden">Foto's laden…</p></main>
  }

  return (
    <Game
      set={state.set}
      bron={state.bron}
      onOpenBeheer={() => { window.location.hash = 'beheer' }}
    />
  )
}
