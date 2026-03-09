import { useEffect } from 'react'

/**
 * Prevents context menu and right-click–style gestures on a touch/kiosk exhibition.
 * - contextmenu: blocks right-click, long-press context menu, and (on many Windows
 *   touch drivers) multi-touch being interpreted as "right-click" and opening the menu.
 * - auxclick (button 2): blocks mouse right-click from triggering any default behavior.
 *
 * Use with touch-action: none (see index.css) so the app has full control of touch;
 * no browser gestures (pinch, pan, double-tap zoom) are needed for exhibition.
 */
export function usePreventContextMenu() {
  useEffect(() => {
    const opts = { passive: false }

    function preventContextMenu(e) {
      e.preventDefault()
    }

    function preventAuxClick(e) {
      if (e.button === 2) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', preventContextMenu, opts)
    document.addEventListener('auxclick', preventAuxClick, opts)
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu, opts)
      document.removeEventListener('auxclick', preventAuxClick, opts)
    }
  }, [])
}
