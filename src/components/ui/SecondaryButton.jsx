import KioskButton from './KioskButton'

/**
 * Secondary action button (e.g. back, cancel). Fixed 64×64 touch target,
 * gray surface with stroke. Uses design tokens: btn-secondary-bg, btn-secondary.
 *
 * Props:
 *   children   React node  — often an icon or short label
 *   onPress    () => void
 *   disabled   boolean
 *   className  string
 */
export default function SecondaryButton({
  children,
  onPress,
  disabled = false,
  className = '',
}) {
  return (
    <KioskButton
      onPress={onPress}
      disabled={disabled}
      className={`
        w-btn-secondary h-btn-secondary min-w-btn-secondary min-h-btn-secondary
        rounded-ui bg-btn-secondary-bg shadow-btn-secondary
        flex items-center justify-center text-text-default
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </KioskButton>
  )
}
