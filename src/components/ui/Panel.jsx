/**
 * Themed panel container. Use for full-width sections or side panels.
 *
 * Props:
 *   theme   'acusensus' | 'competitor' | 'neutral'  — background and text color
 *   children  React node
 *   className  string  — additional Tailwind classes
 */
export default function Panel({ theme = 'neutral', children, className = '' }) {
  const themeClasses = {
    acusensus: 'bg-panel-acusensus text-text-panel',
    competitor: 'bg-panel-competitor text-text-panel',
    neutral: 'bg-page-bg text-text-default',
  }

  return (
    <div className={`rounded-ui overflow-hidden ${themeClasses[theme]} ${className}`.trim()}>
      {children}
    </div>
  )
}
