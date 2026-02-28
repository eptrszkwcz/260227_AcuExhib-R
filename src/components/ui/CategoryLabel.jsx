/**
 * Styled text badge for one of the three image categories.
 * Seatbelt and distracted use the danger (red) family; safe uses the safe (green) family.
 *
 * Props:
 *   label  'seatbelt' | 'distracted' | 'safe'
 */
const VARIANT_MAP = {
  seatbelt: { bg: 'bg-category-danger', icon: 'text-category-danger-icon' },
  distracted: { bg: 'bg-category-danger', icon: 'text-category-danger-icon' },
  safe: { bg: 'bg-category-safe', icon: 'text-category-safe-icon' },
}

const DISPLAY_NAMES = {
  seatbelt: 'Seatbelt Violation',
  distracted: 'Distracted Driving',
  safe: 'Safe Driving',
}

export default function CategoryLabel({ label }) {
  const { bg } = VARIANT_MAP[label] ?? VARIANT_MAP.safe
  const text = DISPLAY_NAMES[label] ?? label

  return (
    <span className={`rounded-ui px-3 py-1 text-secondary-text ${bg} text-white`}>
      {text}
    </span>
  )
}
