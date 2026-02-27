import { useEffect, useRef } from 'react'

/**
 * Fires onIdle() after timeoutMs of no user activity.
 * Activity is detected via pointerdown, pointermove, and keydown on window.
 *
 * Uses refs (not state) for the timeout handle and listener reference so
 * this hook causes zero re-renders and safely cleans up after itself —
 * critical for a kiosk running 100+ sessions per day.
 *
 * @param {object} options
 * @param {number} options.timeoutMs  - milliseconds of inactivity before onIdle fires
 * @param {function} options.onIdle   - callback invoked when timeout expires
 * @returns {{ resetTimer: function }} - call resetTimer() to manually restart the countdown
 */
export function useIdleTimer({ timeoutMs, onIdle }) {
  const timerRef = useRef(null)
  const onIdleRef = useRef(onIdle)

  // Keep the callback ref up to date without re-registering listeners
  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const resetTimer = useRef(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onIdleRef.current?.()
    }, timeoutMs)
  }).current

  useEffect(() => {
    // Start the timer immediately on mount
    resetTimer()

    // { passive: true } — these listeners only reset the timer, never call preventDefault
    const opts = { passive: true }
    window.addEventListener('pointerdown', resetTimer, opts)
    window.addEventListener('pointermove', resetTimer, opts)
    window.addEventListener('keydown', resetTimer, opts)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('pointerdown', resetTimer, opts)
      window.removeEventListener('pointermove', resetTimer, opts)
      window.removeEventListener('keydown', resetTimer, opts)
    }
    // timeoutMs is intentionally excluded: changing it mid-session has no effect.
    // If timeout duration needs to change, remount the consuming component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { resetTimer }
}
