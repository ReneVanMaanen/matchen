import { useEffect, useRef } from 'react'

// Roept onIdle aan als er `ms` lang geen aanraking, klik of toets is geweest.
export function useIdle(ms, onIdle) {
  const cb = useRef(onIdle)
  cb.current = onIdle

  useEffect(() => {
    let t
    const arm = () => {
      clearTimeout(t)
      t = setTimeout(() => cb.current(), ms)
    }
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart']
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    arm()
    return () => {
      clearTimeout(t)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [ms])
}
