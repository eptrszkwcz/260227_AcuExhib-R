import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { coverImages } from '../data/coverImages'
import { Title, PrimaryButton } from '../components/ui'

const COVER_ROTATE_INTERVAL_MS = 8000
const COVER_FADE_DURATION_MS = 800

export default function Welcome() {
  const navigate = useNavigate()
  const len = coverImages.length
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const [activeLayer, setActiveLayer] = useState(0)
  // Each layer has a fixed image index; we only update the hidden layer after fade completes
  const [layerImageIndices, setLayerImageIndices] = useState(() =>
    len >= 2 ? [0, 1] : [0, 0]
  )
  const [coverError, setCoverError] = useState(false)

  const fadeTimeoutRef = useRef(null)

  // Cycle through cover images every 8 seconds with crossfade
  useEffect(() => {
    if (len <= 1) return
    const id = setInterval(() => {
      setDisplayedIndex((i) => (i + 1) % len)
      setActiveLayer((l) => {
        const nextLayer = 1 - l
        // Update the layer we just hid only after the fade finishes
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
        fadeTimeoutRef.current = setTimeout(() => {
          setLayerImageIndices((prev) => {
            const next = [...prev]
            next[l] = (prev[nextLayer] + 1) % len
            return next
          })
          fadeTimeoutRef.current = null
        }, COVER_FADE_DURATION_MS)
        return nextLayer
      })
    }, COVER_ROTATE_INTERVAL_MS)
    return () => {
      clearInterval(id)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [len])

  const showCover = len > 0 && !coverError
  const src0 = len ? coverImages[layerImageIndices[0]] : null
  const src1 = len ? coverImages[layerImageIndices[1]] : null

  const fadeStyle = { transitionDuration: `${COVER_FADE_DURATION_MS}ms` }

  return (
    <div className="relative w-full h-full bg-page-bg">
      {/* Full-bleed cover images with crossfade (hidden if none or load error) */}
      {showCover && (
        <>
          {src0 && (
            <img
              src={src0}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
              style={{
                ...fadeStyle,
                opacity: activeLayer === 0 ? 1 : 0,
              }}
              draggable={false}
              onError={() => setCoverError(true)}
            />
          )}
          {src1 && (
            <img
              src={src1}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
              style={{
                ...fadeStyle,
                opacity: activeLayer === 1 ? 1 : 0,
              }}
              draggable={false}
              onError={() => setCoverError(true)}
            />
          )}
        </>
      )}

      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Title on gray panel for readability */}
          <div
            className="rounded-ui p-3"
            style={{ backgroundColor: '#DCDCDC', opacity: 0.85 }}
          >
            <Title className="text-center">Can you detect dangerous driving?</Title>
          </div>

          {/* 540px vertical space then primary CTA */}
          <div className="mt-[540px]">
            <PrimaryButton
              theme="acusensus"
              onPress={() => navigate('/instructions')}
              className="animate-stroke-pulse"
            >
              PUT OUR SYSTEM TO THE TEST
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
