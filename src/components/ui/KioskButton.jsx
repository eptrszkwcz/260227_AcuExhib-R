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
export default function KioskButton({ children, onPress, disabled, className }) {
  return <div></div>
}
