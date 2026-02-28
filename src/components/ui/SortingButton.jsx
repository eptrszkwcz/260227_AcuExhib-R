import KioskButton from './KioskButton'

/**
 * Category sorting button: 216×216, danger (red) or safe (green).
 * Used for "Seatbelt Violation", "Distracted Driving" (danger) and "Safe Driving" (safe).
 * Uses design tokens: btn-sorting-*, text-btn-sorting.
 *
 * Props:
 *   label     string  — e.g. "Seatbelt Violation", "Safe Driving"
 *   variant   'danger' | 'safe'
 *   active    boolean — highlighted when a card is over this zone
 *   onPress   () => void
 *   disabled  boolean
 *   className string
 */
export default function SortingButton({
  label,
  variant = 'danger',
  active = false,
  onPress,
  disabled = false,
  className = '',
}) {
  const shadowClass =
    variant === 'safe'
      ? active
        ? 'shadow-btn-sorting-safe-active'
        : 'shadow-btn-sorting-safe'
      : active
        ? 'shadow-btn-sorting-danger-active'
        : 'shadow-btn-sorting-danger'

  return (
    <KioskButton
      onPress={onPress}
      disabled={disabled}
      className={`
        w-btn-sorting h-btn-sorting rounded-ui
        bg-btn-sorting-bg
        ${shadowClass}
        flex flex-col items-center justify-center gap-2
        text-btn-sorting text-text-default
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {label}
    </KioskButton>
  )
}
