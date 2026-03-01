import KioskButton from './KioskButton'

/**
 * Primary navigation button. Use acusensus theme on Welcome/Instructions;
 * use theme from player side in single/dual player flows.
 *
 * Specs:
 *   Height 96px, variable width. Padding 24px top/bottom, 48px left/right.
 *   Background: theme color at 70% opacity; 100% on active (click).
 *   Stroke: theme color, 3px, inside, 100% opacity.
 *   Font: 72pt Anaheim Semibold, white.
 *
 * Props:
 *   children   React node  — button label
 *   onPress    () => void
 *   theme      'acusensus' | 'competitor'  — default acusensus (e.g. Welcome, Instructions)
 *   disabled   boolean
 *   className  string
 */
export default function PrimaryButton({
  children,
  onPress,
  theme = 'acusensus',
  disabled = false,
  className = '',
}) {
  const isAcusensus = theme === 'acusensus'

  const bgClass = isAcusensus
    ? 'bg-[rgba(46,129,184,0.7)] active:bg-[#2E81B8]'
    : 'bg-[rgba(172,76,172,0.7)] active:bg-[#AC4CAC]'

  const borderClass = isAcusensus ? 'border-[3px] border-[#2E81B8]' : 'border-[3px] border-[#AC4CAC]'

  return (
    <KioskButton
      onPress={onPress}
      disabled={disabled}
      className={`
        h-[96px] min-w-0
        py-[28px] px-[48px]
        rounded-ui
        ${bgClass}
        ${borderClass}
        shadow-btn
        text-btn-primary text-white font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </KioskButton>
  )
}
