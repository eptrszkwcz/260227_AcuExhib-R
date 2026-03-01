import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../context/GameContext'
import { SecondaryButton, SecondaryText, PrimaryButton } from '../components/ui'

const RESULTS_LINGER_MS = Number(import.meta.env.VITE_RESULTS_LINGER_MS) || 15000
// Set to true to pause auto-advance from Results during development; set back to false for production
const PAUSE_RESULTS_TIMEOUT_FOR_DEV = true

// Same as gameplay: title panel width and height
const TITLE_PANEL_W_PX = 994
const TITLE_PANEL_H_PX = 84
// Width shared by percent panel and time panel
const RESULTS_PANEL_W_PX = 320

function formatMMSS(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) return '0:00'
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Results() {
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const { gameState } = useGameContext()

  const player = gameState.players[0]
  const score = player?.score
  const elapsedSeconds = player?.elapsedSeconds ?? null
  const hasResults = score !== null && score.total > 0

  useEffect(() => {
    if (!hasResults || gameState.phase !== 'complete') {
      navigate('/', { replace: true })
      return
    }
    if (!PAUSE_RESULTS_TIMEOUT_FOR_DEV) {
      timerRef.current = setTimeout(() => {
        navigate('/', { replace: true })
      }, RESULTS_LINGER_MS)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hasResults, gameState.phase, navigate])

  if (!hasResults || gameState.phase !== 'complete') return null

  const pool = player.pool ?? 'acusensus'
  const panelBg = pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'

  return (
    <div className="w-full h-full bg-page-bg flex flex-col items-center justify-center p-3 relative">
      {/* Home — top left */}
      <div className="absolute top-3 left-3">
        <SecondaryButton onPress={() => navigate('/')}>
          <img src="/icons/icon_home.svg" alt="Home" className="w-[28px] h-[28px]" />
        </SecondaryButton>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Title panel — same width as gameplay */}
        <div
          className={`rounded-ui flex items-center justify-center shrink-0 ${panelBg}`}
          style={{ width: TITLE_PANEL_W_PX, height: TITLE_PANEL_H_PX }}
        >
          <span className="text-text-panel text-primary-text">Our Solution</span>
        </div>

        {/* Images correctly classified + percent panel (tighter spacing between label and panel) */}
        <div className="flex flex-col items-center gap-2">
          <SecondaryText as="p" className="text-center">
            Images correctly classified
          </SecondaryText>
          <div
            className={`rounded-ui flex flex-col items-center justify-center ${panelBg} shadow-btn py-8 px-12`}
            style={{ width: RESULTS_PANEL_W_PX, minHeight: 200 }}
          >
            <span className="text-text-panel font-bold text-[104px] tabular-nums">
              {score.percent}%
            </span>
            <span className="text-text-panel/80 text-secondary-text mt-2 tabular-nums">
              {score.correct}/{score.total}
            </span>
          </div>
        </div>

        {/* Time to completion + time panel (tighter spacing between label and panel) */}
        <div className="flex flex-col items-center gap-2">
          <SecondaryText as="p" className="text-center">
            Time to completion
          </SecondaryText>
          <div
            className={`rounded-ui flex items-center justify-center ${panelBg} shadow-btn py-4 px-10`}
            style={{ width: RESULTS_PANEL_W_PX }}
          >
            <span className="text-text-panel font-bold text-5xl tabular-nums">
              {formatMMSS(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Buttons — extra top margin to double the space from time panel above */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <PrimaryButton theme="acusensus" onPress={() => {}}>
            SEE DETAILED SCORE
          </PrimaryButton>
          <PrimaryButton theme="acusensus" onPress={() => {}} className="!text-[38px]">
            PLAY WITH THE ALTERNATIVE
            <br />
            SYSTEM'S IMAGES
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
