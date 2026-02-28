import { useEffect } from 'react'

/**
 * Prevents browser zoom/pan so the kiosk doesn’t react to pinch or trackpad zoom.
 * Does NOT prevent multiple simultaneous touches — two players can both touch
 * the screen at once. Pinch/pan on touch is disabled via CSS touch-action: none
 * (see index.css). This hook only blocks:
 *  - wheel + ctrlKey (trackpad pinch-to-zoom)
 *
 * Must use { passive: false } where preventDefault() is used.
 */
export function usePreventZoom() {
  useEffect(() => {
    const opts = { passive: false }

    function handleWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    document.addEventListener('wheel', handleWheel, opts)
    return () => document.removeEventListener('wheel', handleWheel, opts)
  }, [])
}
