import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameContext } from '../context/GameContext'
import { useGameState } from '../hooks/useGameState'
import { Title, PrimaryText, PrimaryButton, SecondaryButton, AnimatedModal } from '../components/ui'
import { IMAGE_CATEGORIES, imageById } from '../data/imageManifest'

const PANEL_WIDTH_PX = 994
const TOP_PANEL_H_PX = 84
const IMAGE_PANEL_W_PX = 994
const IMAGE_PANEL_H_PX = 726
const GAP_PANELS_PX = 16 // gap-4 between top panel and image panel
// Dual mode: smaller panels so two columns fit side by side
const DUAL_PANEL_W_PX = 696
const DUAL_TOP_PANEL_H_PX = 80
const DUAL_IMAGE_PANEL_W_PX = 696
const DUAL_IMAGE_PANEL_H_PX = 508
const DUAL_GAP_PANELS_PX = 16
const TOTAL_ACU_IMAGES = 18
const TOTAL_COMP_IMAGES = 24
const SORTING_LABELS = {
  seatbelt: 'seatbelt violation',
  distracted: 'distracted driving',
  safe: 'safe driving',
}
const SORTING_ICONS = {
  seatbelt: '/icons/icon_seatbelt.svg',
  distracted: '/icons/icon_distracted.svg',
  safe: '/icons/icon_safeDriving.svg',
}
// Instruction popup: same images + sorting overlays as main Instructions page
const INSTRUCTION_IMG_W_PX = 368
const INSTRUCTION_IMG_H_PX = 274
const INSTRUCTION_IMAGES = [
  { key: 'seatbelt', src: '/images/instructions/seatbelt.png', label: 'seatbelt violation', icon: '/icons/icon_seatbelt.svg', isSafe: false },
  { key: 'distracted', src: '/images/instructions/distracted.png', label: 'distracted driving', icon: '/icons/icon_distracted.svg', isSafe: false },
  { key: 'safe', src: '/images/instructions/safe.png', label: 'safe driving', icon: '/icons/icon_safeDriving.svg', isSafe: true },
]

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * One player's column: header, image panel (with undo + counter), and three sorting buttons.
 * Used for both single (one column) and dual (two columns) with different dimensions.
 */
function PlayerGameColumn({
  playerIndex,
  player,
  headerLabel,
  panelWidth,
  topPanelHeight,
  imagePanelWidth,
  imagePanelHeight,
  gapPanelsPx,
  onClassify,
  onUndo,
  isPlaying,
  isDual = false,
}) {
  const pool = player?.pool ?? 'acusensus'
  const imageIds = player?.assignedImageIds ?? []
  const currentIndex = player?.currentIndex ?? 0
  const currentImageId = imageIds[currentIndex]
  const currentImage = currentImageId ? imageById[currentImageId] : null
  const totalImages = pool === 'competitor' ? TOTAL_COMP_IMAGES : TOTAL_ACU_IMAGES
  const currentPosition = Math.min(currentIndex + 1, totalImages)
  const panelBg = pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'

  return (
    <div className="flex flex-col gap-4 shrink-0" style={{ width: panelWidth }}>
      <div
        className={`rounded-ui flex items-center justify-center shrink-0 gap-3 ${panelBg}`}
        style={{ width: panelWidth, height: topPanelHeight }}
      >
        {pool === 'acusensus' && (
          <img src="/icons/icon_acuLogo.svg" alt="" className="h-[64px] w-auto shrink-0" aria-hidden />
        )}
        <span className="text-text-panel text-primary-text">{headerLabel}</span>
      </div>
      <div
        className={`rounded-ui flex flex-col shrink-0 p-3 ${panelBg}`}
        style={{ width: imagePanelWidth, height: imagePanelHeight }}
      >
        <div className="rounded-ui bg-transparent flex-1 flex items-center justify-center overflow-hidden relative">
          {currentImage ? (
            <img
              src={currentImage.src}
              alt="Driver scene to classify"
              className="w-full h-full object-cover rounded-ui"
            />
          ) : (
            <span
              className={`text-text-default text-secondary-text text-center ${
                isDual && isPlaying && imageIds.length > 0 ? '!text-white' : ''
              }`}
            >
              {isPlaying && imageIds.length === 0
                ? 'No images'
                : isDual && isPlaying && imageIds.length > 0
                  ? 'Waiting for other player'
                  : !isPlaying && imageIds.length > 0
                    ? ''
                    : 'Loading…'}
            </span>
          )}
          {isPlaying && imageIds.length > 0 && currentIndex > 0 && (
            <div className="absolute top-0 left-0 m-2">
              <SecondaryButton
                onPress={() => onUndo(playerIndex)}
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
          {isPlaying && imageIds.length > 0 && (
            <div
              className="absolute bottom-0 left-0 m-2 flex items-center justify-center rounded-[2px] bg-[#DCDCDC]/85 text-[#20455F] text-secondary-text font-semibold"
              style={{ width: 72, height: 36 }}
              aria-live="polite"
              aria-label={`Image ${currentPosition} of ${totalImages}`}
            >
              {currentPosition}/{totalImages}
            </div>
          )}
        </div>
      </div>
      <div
        className="flex flex-row items-center justify-evenly shrink-0 w-full"
        style={{ height: 216 }}
      >
        {IMAGE_CATEGORIES.map((label) => {
          const isSafe = label === 'safe'
          const isDisabled = !currentImageId || !isPlaying
          return (
            <button
              key={label}
              type="button"
              disabled={isDisabled}
              onClick={() => onClassify(playerIndex, currentImageId, label)}
              className={`
                w-btn-sorting h-btn-sorting rounded-ui font-medium text-btn-sorting
                bg-btn-sorting-bg opacity-100
                flex flex-col items-center justify-center gap-2
                transition-shadow duration-300 ease-out
                ${isSafe ? 'text-[#1C8854] shadow-btn-sorting-safe active:enabled:shadow-btn-sorting-safe-active' : 'text-[#D23E3E] shadow-btn-sorting-danger active:enabled:shadow-btn-sorting-danger-active'}
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:enabled:opacity-90 active:enabled:scale-[0.98]
              `}
            >
              <img src={SORTING_ICONS[label]} alt="" className="w-14 h-14 shrink-0" aria-hidden />
              {SORTING_LABELS[label]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function GamePlay() {
  const navigate = useNavigate()
  const { gameState, dispatch } = useGameContext()
  const { classifyImage, completeGame, undoToPreviousImage } = useGameState()
  const startTimeRef = useRef(null)
  const playerElapsedOnFinishRef = useRef({ 0: null, 1: null }) // dual mode: seconds when each player finished their last image
  const pausedElapsedRef = useRef(null) // when non-null, timer is paused and this is the elapsed seconds at pause
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [confirmPopup, setConfirmPopup] = useState(null) // null | 'home' | 'instructions' | 'pause'
  const [countdownRemaining, setCountdownRemaining] = useState(null) // 3 | 2 | 1 | null (null = done or not started)
  const [countdownFadingOut, setCountdownFadingOut] = useState(false)
  const [countdownHasStarted, setCountdownHasStarted] = useState(false) // true once we've kicked off the countdown (so overlay is "active" until then)

  const isDual = gameState.playerMode === 'dual'
  const player0 = gameState.players[0]
  const player1 = gameState.players[1]
  const player = player0

  // Single: one player; dual: either player has images and we're playing
  const isPlaying = isDual
    ? gameState.phase === 'playing' &&
      ((player0?.assignedImageIds?.length ?? 0) > 0 || (player1?.assignedImageIds?.length ?? 0) > 0)
    : gameState.phase === 'playing' && (player?.assignedImageIds?.length ?? 0) > 0

  // Single: player 0 finished; dual: both players finished
  const bothPlayersFinished =
    isDual &&
    player0?.assignedImageIds?.length > 0 &&
    player1?.assignedImageIds?.length > 0 &&
    (player0.currentIndex ?? 0) >= player0.assignedImageIds.length &&
    (player1.currentIndex ?? 0) >= player1.assignedImageIds.length
  const singlePlayerFinished =
    !isDual && player && (player.currentIndex ?? 0) >= (player.assignedImageIds?.length ?? 0)
  const isRoundComplete = isPlaying && (isDual ? bothPlayersFinished : singlePlayerFinished)

  const currentIndex = player?.currentIndex ?? 0
  const imageIds = player?.assignedImageIds ?? []
  const currentImageId = imageIds[currentIndex]
  const currentImage = currentImageId ? imageById[currentImageId] : null
  const pool = player?.pool ?? 'acusensus'
  const totalImages = pool === 'competitor' ? TOTAL_COMP_IMAGES : TOTAL_ACU_IMAGES
  const currentPosition = Math.min(currentIndex + 1, totalImages)
  // Overlay visible until countdown has run and faded (so timer never runs during it)
  const showCountdownOverlay = !countdownHasStarted || countdownRemaining !== null || countdownFadingOut
  const timerDisplaySeconds = showCountdownOverlay ? 0 : elapsedSeconds
  const showTimer =
    (isPlaying || gameState.phase === 'complete') &&
    (isDual ? (player0?.assignedImageIds?.length ?? 0) > 0 || (player1?.assignedImageIds?.length ?? 0) > 0 : (player?.assignedImageIds?.length ?? 0) > 0)

  useEffect(() => {
    if (!gameState.playerMode) {
      navigate('/', { replace: true })
    }
  }, [gameState.playerMode, navigate])

  // Fix competitor (or either player) starting at image 2+ when they have no classifications yet.
  // useLayoutEffect runs synchronously before paint so the correction is visible on first frame (avoids timing/Heisenbug where useEffect ran too late without the extra work of console.log).
  useLayoutEffect(() => {
    if (!isDual || !isPlaying) return
    const needsReset = gameState.players.some(
      (p) =>
        (p?.assignedImageIds?.length ?? 0) > 0 &&
        (!p?.classifications || Object.keys(p.classifications).length === 0) &&
        (p?.currentIndex ?? 0) > 0
    )
    if (needsReset) dispatch({ type: 'RESET_PLAYER_IF_NOT_STARTED' })
  }, [isDual, isPlaying, gameState.players, dispatch])

  // Start countdown when entering gameplay (only once per mount)
  useEffect(() => {
    if (isPlaying && !countdownHasStarted) {
      setCountdownHasStarted(true)
      setCountdownRemaining(3)
    }
  }, [isPlaying, countdownHasStarted])

  // Countdown tick: 3 → 2 → 1 → fade out
  useEffect(() => {
    if (countdownRemaining === null || countdownRemaining <= 0) return
    const id = setTimeout(() => {
      if (countdownRemaining === 1) {
        setCountdownRemaining(null)
        setCountdownFadingOut(true)
      } else {
        setCountdownRemaining(countdownRemaining - 1)
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [countdownRemaining])

  useEffect(() => {
    if (!isRoundComplete) return
    const finalElapsed =
      startTimeRef.current !== null
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : elapsedSeconds
    if (isDual) {
      const t0 = playerElapsedOnFinishRef.current[0] ?? finalElapsed
      const t1 = playerElapsedOnFinishRef.current[1] ?? finalElapsed
      completeGame([t0, t1])
    } else {
      completeGame(finalElapsed)
    }
  }, [isRoundComplete, completeGame, elapsedSeconds, isDual])

  // Timer: start only when countdown overlay is gone (timer visible but shows 00:00 until then)
  useEffect(() => {
    if (!isPlaying || showCountdownOverlay) return
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
      playerElapsedOnFinishRef.current = { 0: null, 1: null }
      setElapsedSeconds(0)
    }
    const id = setInterval(() => {
      if (pausedElapsedRef.current !== null) return // pause timer while any confirm popup is open
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [isPlaying, showCountdownOverlay])

  // When round completes, set final elapsed time (timer stops)
  useEffect(() => {
    if (gameState.phase === 'complete' && startTimeRef.current !== null) {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }
  }, [gameState.phase])

  const openConfirmPopup = (type) => {
    if (startTimeRef.current !== null) {
      pausedElapsedRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000)
    }
    setConfirmPopup(type)
  }
  const closeConfirmPopupAndResume = () => {
    if (pausedElapsedRef.current !== null) {
      startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000
      setElapsedSeconds(pausedElapsedRef.current)
      pausedElapsedRef.current = null
    }
    setConfirmPopup(null)
  }

  const handleClassify = (label) => {
    if (!currentImageId || !isPlaying) return
    classifyImage(0, currentImageId, label)
  }

  const handleClassifyDual = (playerIndex, imageId, label) => {
    if (!imageId || !isPlaying) return
    // Record this player's elapsed time when they classify their last image (before state updates)
    if (isDual && startTimeRef.current !== null) {
      const p = gameState.players[playerIndex]
      const ids = p?.assignedImageIds ?? []
      const idx = p?.currentIndex ?? 0
      if (ids.length > 0 && idx + 1 >= ids.length) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        playerElapsedOnFinishRef.current[playerIndex] = elapsed
      }
    }
    classifyImage(playerIndex, imageId, label)
  }

  if (!gameState.playerMode) return null

  const showCompletePopup = gameState.phase === 'complete'

  return (
    <>
    <div className="w-full h-full bg-page-bg flex items-center justify-center p-3 relative">
      {/* Countdown overlay: "Start playing in..." then 5…1, then fade away */}
      {showCountdownOverlay && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#DCDCDC]/85"
          initial={{ opacity: 1 }}
          animate={{ opacity: countdownFadingOut ? 0 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onAnimationComplete={() => {
            if (countdownFadingOut) setCountdownFadingOut(false)
          }}
        >
          <PrimaryText className="text-text-default text-center">
            Start playing in...
          </PrimaryText>
          <div style={{ height: 48 }} aria-hidden />
          {countdownRemaining !== null && (
            <motion.div
              className="inline-block"
              animate={{
                scale: [1, 1.1, 1],
                y: [0, -6, 0],
                opacity: [0.05, 1, 0.05],
              }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Title className="text-text-default tabular-nums" aria-live="polite">
                {countdownRemaining}
              </Title>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Upper left: home and info buttons */}
      <div className="absolute top-3 left-3 flex flex-row items-center gap-3">
        <SecondaryButton onPress={() => openConfirmPopup('home')}>
          <img src="/icons/icon_home.svg" alt="Home" className="w-[28px] h-[28px]" />
        </SecondaryButton>
        <SecondaryButton onPress={() => openConfirmPopup('instructions')}>
          <img src="/icons/icon_i.svg" alt="Information" className="w-[28px] h-[28px]" />
        </SecondaryButton>
      </div>
      {/* Upper right: pause button and timer */}
      <div className="absolute top-3 right-3 flex flex-row items-center gap-3">
        <SecondaryButton onPress={() => openConfirmPopup('pause')}>
          <img src="/icons/icon_pause.svg" alt="Pause" className="w-[28px] h-[28px]" />
        </SecondaryButton>
        {showTimer && (
          <div
            className="flex items-center justify-start text-text-default text-secondary-text font-semibold tabular-nums"
            style={{ width: 72 }}
            aria-live="polite"
            aria-label={`Time elapsed: ${formatMMSS(timerDisplaySeconds)}`}
          >
            {formatMMSS(timerDisplaySeconds)}
          </div>
        )}
      </div>

      {isDual ? (
        /* Dual: two columns side by side */
        <div className="flex flex-row items-center justify-center w-full mt-14" style={{ gap: 212 }}>
          <PlayerGameColumn
            playerIndex={0}
            player={player0}
            headerLabel="Our Solution"
            panelWidth={DUAL_PANEL_W_PX}
            topPanelHeight={DUAL_TOP_PANEL_H_PX}
            imagePanelWidth={DUAL_IMAGE_PANEL_W_PX}
            imagePanelHeight={DUAL_IMAGE_PANEL_H_PX}
            gapPanelsPx={DUAL_GAP_PANELS_PX}
            onClassify={handleClassifyDual}
            onUndo={undoToPreviousImage}
            isPlaying={isPlaying}
            isDual
          />
          <PlayerGameColumn
            playerIndex={1}
            player={player1}
            headerLabel="Alternative System"
            panelWidth={DUAL_PANEL_W_PX}
            topPanelHeight={DUAL_TOP_PANEL_H_PX}
            imagePanelWidth={DUAL_IMAGE_PANEL_W_PX}
            imagePanelHeight={DUAL_IMAGE_PANEL_H_PX}
            gapPanelsPx={DUAL_GAP_PANELS_PX}
            onClassify={handleClassifyDual}
            onUndo={undoToPreviousImage}
            isPlaying={isPlaying}
            isDual
          />
        </div>
      ) : (
      <div className="flex flex-row items-center w-full">
        {/* Left spacer — equal weight with right so center stays centered */}
        <div className="flex-1 shrink-0 min-w-0" aria-hidden />
        {/* Center: two stacked blue panels, 994px wide */}
        <div className="flex flex-col gap-4 shrink-0" style={{ width: PANEL_WIDTH_PX }}>
          {/* Top panel — "Our Solution" */}
          <div
            className={`rounded-ui flex items-center justify-center shrink-0 gap-3 ${pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'}`}
            style={{ width: PANEL_WIDTH_PX, height: TOP_PANEL_H_PX }}
          >
            {pool !== 'competitor' && (
              <img src="/icons/icon_acuLogo.svg" alt="" className="h-[64px] w-auto shrink-0" aria-hidden />
            )}
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
                      : gameState.phase === 'complete'
                        ? ''
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
                      flex flex-col items-center justify-center gap-2
                      transition-shadow duration-300 ease-out
                      ${isSafe ? 'text-[#1C8854] shadow-btn-sorting-safe active:enabled:shadow-btn-sorting-safe-active' : 'text-[#D23E3E] shadow-btn-sorting-danger active:enabled:shadow-btn-sorting-danger-active'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:enabled:opacity-90 active:enabled:scale-[0.98]
                    `}
                  >
                    <img src={SORTING_ICONS[label]} alt="" className="w-14 h-14 shrink-0" aria-hidden />
                    {SORTING_LABELS[label]}
                  </button>
                )
              })}
            </div>
          </div>
          </div>
        </div>
      </div>
      )}
    </div>

    {/* Completion popup — full screen when round is done (2x longer transition into popup) */}
    {showCompletePopup && (
      <AnimatedModal
        open={showCompletePopup}
        onClose={() => {}}
        ariaLabelledBy="complete-popup-title"
        transitionDuration={0.6}
      >
        {({ requestClose }) => (
          <>
            <Title id="complete-popup-title" className="text-text-default text-center">
              Thank you for playing!
            </Title>
            <div style={{ height: 540 }} aria-hidden />
            <PrimaryButton theme="acusensus" onPress={() => navigate('/results')}>
              SEE RESULTS
            </PrimaryButton>
          </>
        )}
      </AnimatedModal>
    )}

    {/* Confirmation popup — Home (exit game) */}
    {confirmPopup === 'home' && (
      <AnimatedModal
        open={confirmPopup === 'home'}
        onClose={closeConfirmPopupAndResume}
        ariaLabelledBy="confirm-home-title"
      >
        {({ requestClose }) => (
          <>
            <PrimaryText id="confirm-home-title" as="p" className="text-text-default text-center">
              Exit this game?
            </PrimaryText>
            <div style={{ height: 200 }} aria-hidden />
            <div className="flex flex-col items-center gap-4">
              <PrimaryButton theme="acusensus" onPress={() => requestClose()}>
                CONTINUE PLAYING
              </PrimaryButton>
              <PrimaryButton theme="acusensus" onPress={() => requestClose(() => navigate('/'))}>
                EXIT
              </PrimaryButton>
            </div>
          </>
        )}
      </AnimatedModal>
    )}

    {/* Confirmation popup — Instructions */}
    {confirmPopup === 'instructions' && (
      <AnimatedModal
        open={confirmPopup === 'instructions'}
        onClose={closeConfirmPopupAndResume}
        ariaLabelledBy="confirm-instructions-title"
        contentClassName="overflow-y-auto py-8"
      >
        {({ requestClose }) => (
          <>
            <Title id="confirm-instructions-title" className="text-text-default text-center">
              How to play...
            </Title>
            <PrimaryText as="p" className="text-center max-w-[1400px] mt-8 px-8 text-text-default">
              Determine if vehicle occupants are not wearing their seatbelt, are
              illegally using their phones or are driving safely.
              <br />
              Use buttons to sort the photos.
            </PrimaryText>
            <div className="flex items-center justify-center gap-8 mt-12">
              {INSTRUCTION_IMAGES.map(({ key, src, label, icon, isSafe }) => (
                <div
                  key={key}
                  className="rounded-ui overflow-hidden flex-shrink-0 relative"
                  style={{ width: INSTRUCTION_IMG_W_PX, height: INSTRUCTION_IMG_H_PX }}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    aria-hidden
                  >
                    <div
                      className={`
                        w-btn-sorting h-btn-sorting rounded-ui font-medium text-btn-sorting text-center
                        bg-btn-sorting-bg opacity-100
                        flex flex-col items-center justify-center gap-2
                        ${isSafe ? 'text-[#1C8854] shadow-btn-sorting-safe' : 'text-[#D23E3E] shadow-btn-sorting-danger'}
                      `}
                    >
                      <img src={icon} alt="" className="w-14 h-14 shrink-0" aria-hidden />
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 200 }} aria-hidden />
            <PrimaryButton theme="acusensus" onPress={() => requestClose()}>
              CONTINUE PLAYING
            </PrimaryButton>
          </>
        )}
      </AnimatedModal>
    )}

    {/* Confirmation popup — Pause */}
    {confirmPopup === 'pause' && (
      <AnimatedModal
        open={confirmPopup === 'pause'}
        onClose={closeConfirmPopupAndResume}
        ariaLabelledBy="confirm-pause-title"
      >
        {({ requestClose }) => (
          <>
            <PrimaryText id="confirm-pause-title" as="p" className="text-text-default text-center">
              Your game has been paused.
            </PrimaryText>
            <div style={{ height: 200 }} aria-hidden />
            <PrimaryButton theme="acusensus" onPress={() => requestClose()}>
              CONTINUE PLAYING
            </PrimaryButton>
          </>
        )}
      </AnimatedModal>
    )}
    </>
  )
}
