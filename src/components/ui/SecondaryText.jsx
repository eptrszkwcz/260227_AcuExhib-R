/**
 * Secondary / smaller text. Uses design token: text-secondary-text (59px, medium).
 *
 * Props:
 *   children   React node
 *   as         'p' | 'div' | 'span'  — default 'p'
 *   className  string  — use text-text-panel when inside a themed Panel
 */
export default function SecondaryText({ children, as: Component = 'p', className = '' }) {
  return (
    <Component className={`text-secondary-text text-text-default ${className}`.trim()}>
      {children}
    </Component>
  )
}
