/**
 * Page or section title. Uses design token: text-title (107px, bold).
 *
 * Props:
 *   children   React node
 *   as         'h1' | 'h2' | 'div'  — semantic element (default 'h1')
 *   className  string
 */
export default function Title({ children, as: Component = 'h1', className = '' }) {
  return <Component className={`text-title text-text-default ${className}`.trim()}>{children}</Component>
}
