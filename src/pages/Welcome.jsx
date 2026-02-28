import { useState } from 'react'
import { coverImages } from '../data/coverImages'

/**
 * Tracks the last index shown so we never display the same image twice in a row.
 * Module-level — survives remounts (idle timeouts, game resets back to /).
 */
let lastCoverIndex = -1

function pickCoverImage() {
  if (coverImages.length === 0) return null
  if (coverImages.length === 1) return coverImages[0]
  let idx
  do {
    idx = Math.floor(Math.random() * coverImages.length)
  } while (idx === lastCoverIndex)
  lastCoverIndex = idx
  return coverImages[idx]
}

export default function Welcome() {
  // Initialiser function — runs once on mount, not on re-render
  const [coverImage] = useState(() => pickCoverImage())

  return (
    <div className="relative w-full h-full">
      {/* Full-bleed cover image */}
      {coverImage && (
        <img
          src={coverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}

      {/* Text panel overlay — content to come */}
      <div className="absolute inset-0" />
    </div>
  )
}
