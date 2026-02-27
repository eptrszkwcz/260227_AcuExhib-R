import { useState, useCallback, useRef } from 'react'

/**
 * Manages pointer-event-based drag interaction for a single ImageCard.
 *
 * Uses setPointerCapture so the card continues receiving events even after
 * the finger moves off its bounds — essential for reliable drag-and-drop.
 * Because each card captures its own pointer ID, two players dragging two
 * different cards simultaneously are fully isolated from each other.
 *
 * @param {object} options
 * @param {string}   options.imageId      - ID of the image being dragged
 * @param {number}   options.playerIndex  - 0 or 1
 * @param {function} options.onDrop       - called with (imageId, zoneLabel) on successful drop
 * @param {function} options.getDropZones - returns array of { label, rect } at call time
 *
 * @returns {{ dragHandlers, isDragging, dragX, dragY, activeZone }}
 */
export function useDragSort({ imageId, playerIndex, onDrop, getDropZones }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [activeZone, setActiveZone] = useState(null)

  const pointerIdRef = useRef(null)
  const startPosRef = useRef({ x: 0, y: 0 })

  const hitTestZones = useCallback(
    (x, y) => {
      const zones = getDropZones?.() ?? []
      for (const zone of zones) {
        const { rect, label } = zone
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return label
        }
      }
      return null
    },
    [getDropZones]
  )

  const handlePointerDown = useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      pointerIdRef.current = e.pointerId
      startPosRef.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      setDragX(e.clientX)
      setDragY(e.clientY)
      setActiveZone(null)
    },
    []
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || e.pointerId !== pointerIdRef.current) return
      setDragX(e.clientX)
      setDragY(e.clientY)
      setActiveZone(hitTestZones(e.clientX, e.clientY))
    },
    [isDragging, hitTestZones]
  )

  const handlePointerUp = useCallback(
    (e) => {
      if (e.pointerId !== pointerIdRef.current) return
      const zone = hitTestZones(e.clientX, e.clientY)
      if (zone) {
        onDrop?.(imageId, zone)
      }
      setIsDragging(false)
      setActiveZone(null)
      pointerIdRef.current = null
    },
    [imageId, onDrop, hitTestZones]
  )

  const handlePointerCancel = useCallback(() => {
    setIsDragging(false)
    setActiveZone(null)
    pointerIdRef.current = null
  }, [])

  return {
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    isDragging,
    dragX,
    dragY,
    activeZone,
  }
}
