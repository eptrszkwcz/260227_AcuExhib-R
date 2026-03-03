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
  const timeoutMsRef = useRef(timeoutMs)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    timeoutMsRef.current = timeoutMs
  }, [timeoutMs])

  const resetTimer = useRef(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const ms = timeoutMsRef.current
    if (ms <= 0) return // disabled (e.g. pause for development)
    timerRef.current = setTimeout(() => {
      onIdleRef.current?.()
    }, ms)
  }).current

  useEffect(() => {
    resetTimer()

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
  }, [])

  // When timeoutMs changes (e.g. user navigates to Results), restart timer with new duration
  useEffect(() => {
    resetTimer()
  }, [timeoutMs, resetTimer])

  return { resetTimer }
}
