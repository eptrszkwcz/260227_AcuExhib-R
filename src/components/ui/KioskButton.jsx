/**
 * Large touch-friendly button sized for kiosk use (minimum 80px touch target).
 * Uses pointer events rather than click for lower-latency touch response.
 *
 * Props:
 *   children   React node  — button label/content
 *   onPress    () => void  — called on pointerup (not onClick)
 *   disabled   boolean
 *   className  string      — additional Tailwind classes
 */
export default function KioskButton({ children, onPress, disabled = false, className = '' }) {
  const handlePointerUp = (e) => {
    if (disabled) return
    if (e.button !== 0) return // only primary button
    onPress?.()
  }

  return (
    <button
      type="button"
      role="button"
      disabled={disabled}
      onPointerUp={handlePointerUp}
      className={`min-w-[80px] min-h-[80px] flex items-center justify-center select-none ${className}`}
    >
      {children}
    </button>
  )
}
