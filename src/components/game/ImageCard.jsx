/**
 * A single draggable driver image card.
 * Uses useDragSort for pointer-event drag handling with setPointerCapture.
 * Applies touch-action:none to prevent browser interference.
 *
 * Props:
 *   image        { id, src, label } — image manifest entry
 *   playerIndex  0 | 1
 *   onDrop       (imageId, zoneLabel) => void
 *   getDropZones () => [{ label, rect }]
 */
export default function ImageCard({ image, playerIndex, onDrop, getDropZones }) {
  return <div></div>
}
