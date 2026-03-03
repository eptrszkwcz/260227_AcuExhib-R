import { useRef, useLayoutEffect } from 'react'

const CANVAS_W = 1920
const CANVAS_H = 1080

/**
 * Renders children in a fixed 1920×1080 logical canvas, then scales that
 * canvas to fit the actual viewport using a single CSS transform.
 *
 * This means every pixel value in the app is authored against 1920×1080.
 * The ±20% viewport tolerance is handled automatically by the scale factor.
 *
 * The outer wrapper fills the viewport (100vw × 100vh) and centers the
 * scaled canvas with a black letterbox background.
 */
export default function FullscreenLayout({ children }) {
  const innerRef = useRef(null)

  useLayoutEffect(() => {
    function updateScale() {
      if (!innerRef.current) return
      const scaleX = window.innerWidth / CANVAS_W
      const scaleY = window.innerHeight / CANVAS_H
      const scale = Math.min(scaleX, scaleY)
      // Apply directly to DOM — no state update, no re-render
      innerRef.current.style.transform = `scale(${scale})`
      // Center the scaled canvas within the viewport
      const offsetX = (window.innerWidth - CANVAS_W * scale) / 2
      const offsetY = (window.innerHeight - CANVAS_H * scale) / 2
      innerRef.current.style.left = `${offsetX}px`
      innerRef.current.style.top = `${offsetY}px`
    }

    updateScale()

    const ro = new ResizeObserver(updateScale)
    ro.observe(document.documentElement)

    return () => ro.disconnect()
  }, [])

  return (
    <div
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          width: CANVAS_W,
          height: CANVAS_H,
          transformOrigin: 'top left',
          background: '#D9D9D9', // page-bg — so page transitions fade to this instead of black
        }}
      >
        {children}
      </div>
    </div>
  )
}
