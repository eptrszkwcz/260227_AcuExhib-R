import { useEffect } from 'react'

/**
 * Attaches document-level event listeners to block browser pinch-zoom and
 * overscroll gestures on the kiosk touch screen.
 *
 * Must be called with { passive: false } because preventDefault() is a no-op
 * on passive listeners in modern browsers.
 *
 * Blocks:
 *  - Multi-touch touchstart / touchmove  (pinch-zoom, two-finger scroll)
 *  - wheel + ctrlKey                      (trackpad pinch-to-zoom)
 *
 * This hook is designed to be called once in main.jsx or App.jsx.
 * It operates on `document`, not `window`, for correct passive flag semantics.
 */
export function usePreventZoom() {
  useEffect(() => {
    const opts = { passive: false }

    function handleTouch(e) {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    function handleWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', handleTouch, opts)
    document.addEventListener('touchmove', handleTouch, opts)
    document.addEventListener('wheel', handleWheel, opts)

    return () => {
      document.removeEventListener('touchstart', handleTouch, opts)
      document.removeEventListener('touchmove', handleTouch, opts)
      document.removeEventListener('wheel', handleWheel, opts)
    }
  }, [])
}
