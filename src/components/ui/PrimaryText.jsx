/**
 * Primary body text. Size and weight come from Tailwind only — see
 * tailwind.config.js theme.extend.fontSize['primary-text'] (single source of truth).
 *
 * Props:
 *   children   React node
 *   as         'p' | 'div' | 'span'  — default 'p'
 *   className  string
 */
export default function PrimaryText({ children, as: Component = 'p', className = '' }) {
  return (
    <Component className={`text-primary-text text-text-default ${className}`.trim()}>
      {children}
    </Component>
  )
}
