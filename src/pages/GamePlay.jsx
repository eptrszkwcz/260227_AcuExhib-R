import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../context/GameContext'
import { useGameState } from '../hooks/useGameState'
import { Title, PrimaryButton, SecondaryButton } from '../components/ui'
import { IMAGE_CATEGORIES, imageById } from '../data/imageManifest'

const PANEL_WIDTH_PX = 994
const TOP_PANEL_H_PX = 84
const IMAGE_PANEL_W_PX = 994
const IMAGE_PANEL_H_PX = 726
const GAP_PANELS_PX = 16 // gap-4 between top panel and image panel
const TOTAL_ACU_IMAGES = 18
const TOTAL_COMP_IMAGES = 24
const SORTING_LABELS = {
  seatbelt: 'seatbelt violation',
  distracted: 'distracted driving',
  safe: 'safe driving',
}

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function GamePlay() {
  const navigate = useNavigate()
  const { gameState } = useGameContext()
  const { classifyImage, completeGame, undoToPreviousImage } = useGameState()
  const startTimeRef = useRef(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const player = gameState.players[0]
  const isPlaying = gameState.phase === 'playing' && player?.assignedImageIds?.length > 0
  const currentIndex = player?.currentIndex ?? 0
  const imageIds = player?.assignedImageIds ?? []
  const currentImageId = imageIds[currentIndex]
  const currentImage = currentImageId ? imageById[currentImageId] : null
  const pool = player?.pool ?? 'acusensus'
  const totalImages = pool === 'competitor' ? TOTAL_COMP_IMAGES : TOTAL_ACU_IMAGES
  const currentPosition = Math.min(currentIndex + 1, totalImages) // e.g. 1 when on first image
  const isRoundComplete = isPlaying && currentIndex >= imageIds.length
  const showTimer = (isPlaying || gameState.phase === 'complete') && (player?.assignedImageIds?.length ?? 0) > 0

  useEffect(() => {
    if (!gameState.playerMode) {
      navigate('/', { replace: true })
    }
  }, [gameState.playerMode, navigate])

  useEffect(() => {
    if (!isRoundComplete) return
    const finalElapsed =
      startTimeRef.current !== null
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : elapsedSeconds
    completeGame(finalElapsed)
  }, [isRoundComplete, completeGame, elapsedSeconds])

  // Timer: start when round starts, update every second, stop when round complete
  useEffect(() => {
    if (!isPlaying) return
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
      setElapsedSeconds(0)
    }
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [isPlaying])

  // When round completes, set final elapsed time (timer stops)
  useEffect(() => {
    if (gameState.phase === 'complete' && startTimeRef.current !== null) {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }
  }, [gameState.phase])

  const handleClassify = (label) => {
    if (!currentImageId || !isPlaying) return
    classifyImage(0, currentImageId, label)
  }

  if (!gameState.playerMode) return null

  const showCompletePopup = gameState.phase === 'complete'

  return (
    <>
    <div className="w-full h-full bg-page-bg flex items-center justify-center p-3 relative">
      {/* Upper left: home and info buttons */}
      <div className="absolute top-3 left-3 flex flex-row items-center gap-3">
        <SecondaryButton onPress={() => navigate('/')}>
          <img src="/icons/icon_home.svg" alt="Home" className="w-[28px] h-[28px]" />
        </SecondaryButton>
        <SecondaryButton onPress={() => {}}>
          <img src="/icons/icon_i.svg" alt="Information" className="w-[28px] h-[28px]" />
        </SecondaryButton>
      </div>
      {/* Upper right: pause button and timer */}
      <div className="absolute top-3 right-3 flex flex-row items-center gap-3">
        <SecondaryButton onPress={() => {}}>
          <img src="/icons/icon_pause.svg" alt="Pause" className="w-[28px] h-[28px]" />
        </SecondaryButton>
        {showTimer && (
          <div
            className="flex items-center justify-start text-text-default text-secondary-text font-semibold tabular-nums"
            style={{ width: 72 }}
            aria-live="polite"
            aria-label={`Time elapsed: ${formatMMSS(elapsedSeconds)}`}
          >
            {formatMMSS(elapsedSeconds)}
          </div>
        )}
      </div>
      <div className="flex flex-row items-center w-full">
        {/* Left spacer — equal weight with right so center stays centered */}
        <div className="flex-1 shrink-0 min-w-0" aria-hidden />
        {/* Center: two stacked blue panels, 994px wide */}
        <div className="flex flex-col gap-4 shrink-0" style={{ width: PANEL_WIDTH_PX }}>
          {/* Top panel — "Our Solution" */}
          <div
            className={`rounded-ui flex items-center justify-center shrink-0 ${pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'}`}
            style={{ width: PANEL_WIDTH_PX, height: TOP_PANEL_H_PX }}
          >
            <span className="text-text-panel text-primary-text">Our Solution</span>
          </div>

          {/* Bottom panel — image area (994×726) */}
          <div
            className={`rounded-ui flex flex-col shrink-0 p-4 ${pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'}`}
            style={{ width: IMAGE_PANEL_W_PX, height: IMAGE_PANEL_H_PX }}
          >
            <div className="rounded-ui bg-transparent flex-1 flex items-center justify-center overflow-hidden relative">
              {currentImage ? (
                <img
                  src={currentImage.src}
                  alt="Driver scene to classify"
                  className="w-full h-full object-cover rounded-ui"
                />
              ) : (
                <span className="text-text-default text-secondary-text">
                  {isPlaying && imageIds.length === 0
                    ? 'No images in this round'
                    : isRoundComplete
                      ? 'Round complete'
                      : 'Loading…'}
                </span>
              )}
              {/* Undo — top left of image (custom colors by pool) */}
              {isPlaying && imageIds.length > 0 && currentIndex > 0 && (
                <div className="absolute top-0 left-0 m-3">
                  <SecondaryButton
                    onPress={() => undoToPreviousImage(0)}
                    className={
                      pool === 'acusensus'
                        ? '!bg-[#619BC2] !shadow-[inset_0_0_0_3px_#2E81B8,-1px_7px_12px_0px_rgba(0,0,0,0.25)]'
                        : '!bg-[#B76BB7] !shadow-[inset_0_0_0_3px_#AC4CAC,-1px_7px_12px_0px_rgba(0,0,0,0.25)]'
                    }
                  >
                    <img src="/icons/icon_undo.svg" alt="Undo" className="w-[28px] h-[28px]" />
                  </SecondaryButton>
                </div>
              )}
              {/* Image counter — lower left */}
              {isPlaying && imageIds.length > 0 && (
                <div
                  className="absolute bottom-0 left-0 m-3 flex items-center justify-center rounded-[2px] bg-[#DCDCDC]/85 text-[#20455F] text-secondary-text font-semibold"
                  style={{ width: 98, height: 44 }}
                  aria-live="polite"
                  aria-label={`Image ${currentPosition} of ${totalImages}`}
                >
                  {currentPosition}/{totalImages}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right spacer + buttons — flex-1 so panels stay centered; buttons at start of this column */}
        <div className="flex-1 shrink-0 min-w-0 flex flex-row items-center pl-10">
          <div
            className="flex flex-col shrink-0"
            style={{ height: TOP_PANEL_H_PX + GAP_PANELS_PX + IMAGE_PANEL_H_PX }}
          >
          <div style={{ height: TOP_PANEL_H_PX + GAP_PANELS_PX }} className="shrink-0" aria-hidden />
          <div
            className="flex items-center justify-center shrink-0"
            style={{ height: IMAGE_PANEL_H_PX }}
          >
            <div className="flex flex-col gap-4">
              {IMAGE_CATEGORIES.map((label) => {
                const isSafe = label === 'safe'
                const isDisabled = !currentImageId || !isPlaying
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleClassify(label)}
                    className={`
                      w-btn-sorting h-btn-sorting rounded-ui font-medium text-btn-sorting
                      bg-btn-sorting-bg opacity-100
                      ${isSafe ? 'text-[#1C8854] shadow-btn-sorting-safe' : 'text-[#D23E3E] shadow-btn-sorting-danger'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:enabled:opacity-90 active:enabled:scale-[0.98]
                    `}
                  >
                    {SORTING_LABELS[label]}
                  </button>
                )
              })}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    {/* Completion popup — full screen when round is done */}
    {showCompletePopup && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#DCDCDC]/85"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-popup-title"
      >
        <div className="flex flex-col items-center">
          <Title id="complete-popup-title" className="text-text-default text-center">
            Thank you for playing!
          </Title>
          <div style={{ height: 540 }} aria-hidden />
          <PrimaryButton theme="acusensus" onPress={() => navigate('/results')}>
            SEE RESULTS
          </PrimaryButton>
        </div>
      </div>
    )}
    </>
  )
}
