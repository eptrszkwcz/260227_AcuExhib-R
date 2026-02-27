/**
 * A category drop zone bucket. Highlights when a card is dragged over it.
 *
 * Props:
 *   label        'seatbelt' | 'distracted' | 'safe'
 *   isActive     boolean — true when a card is hovering over this zone
 *   count        number  — how many cards have been dropped here so far
 *   zoneRef      React ref — forwarded so GamePlay can measure rects for hit-testing
 */
export default function DropZone({ label, isActive, count, zoneRef }) {
  return <div ref={zoneRef}></div>
}
