import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../context/GameContext'
import { SecondaryButton, SecondaryText, PrimaryButton } from '../components/ui'
import { IMAGE_CATEGORIES, imageById } from '../data/imageManifest'

const RESULTS_LINGER_MS = Number(import.meta.env.VITE_RESULTS_LINGER_MS) || 15000
// Set to true to pause auto-advance from Results during development; set back to false for production
const PAUSE_RESULTS_TIMEOUT_FOR_DEV = true

// Same as gameplay: title panel width and height
const TITLE_PANEL_W_PX = 994
const TITLE_PANEL_H_PX = 84
// Width shared by percent panel and time panel
const RESULTS_PANEL_W_PX = 320
// Dual mode: title 696px (align with GamePlay dual columns), score/time panels 320px (match single), 212px gap
const DUAL_RESULTS_TITLE_W_PX = 696
const DUAL_RESULTS_PANEL_W_PX = 320
const DUAL_RESULTS_GAP_PX = 212
const DETAIL_PANEL_H_PX = 714
const DETAIL_PANEL_GAP_TOP_PX = 12
const DETAIL_ICON_PX = 78
const DETAIL_THUMB_PANEL_W_PX = 480
const DETAIL_THUMB_PX = 78
const DETAIL_THUMB_RADIUS_PX = 16
const DETAIL_CATEGORY_LABELS = {
  seatbelt: 'Seatbelt Violation',
  distracted: 'Distracted Driving',
  safe: 'Safe Driving',
}
const DETAIL_ICONS = {
  seatbelt: '/icons/icon_seatbelt.svg',
  distracted: '/icons/icon_distracted.svg',
  safe: '/icons/icon_safeDriving.svg',
}

function formatMMSS(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) return '0:00'
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * One player's result column: title, score panel (percent + fraction), time panel.
 * Reused for single (one column) and dual (two columns) with different widths.
 */
function PlayerResultColumn({
  headerLabel,
  pool,
  score,
  elapsedSeconds,
  titlePanelWidth,
  resultsPanelWidth,
}) {
  const panelBg = pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'
  return (
    <div className="flex flex-col items-center gap-6 shrink-0" style={{ width: titlePanelWidth }}>
      <div
        className={`rounded-ui flex items-center justify-center shrink-0 gap-3 ${panelBg}`}
        style={{ width: titlePanelWidth, height: TITLE_PANEL_H_PX }}
      >
        {pool === 'acusensus' && (
          <img src="/icons/icon_acuLogo.svg" alt="" className="h-[64px] w-auto shrink-0" aria-hidden />
        )}
        <span className="text-text-panel text-primary-text">{headerLabel}</span>
      </div>
      <div className="flex flex-col items-center gap-2" style={{ width: resultsPanelWidth }}>
        <SecondaryText as="p" className="text-center">
          Images correctly classified
        </SecondaryText>
        <div
          className={`rounded-ui flex flex-col items-center justify-center ${panelBg} shadow-btn py-8 px-12 w-full`}
          style={{ minHeight: 200 }}
        >
          <span className="text-text-panel font-bold text-[104px] tabular-nums">
            {score.percent}%
          </span>
          <span className="text-text-panel/80 text-secondary-text mt-2 tabular-nums">
            {score.correct}/{score.total}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2" style={{ width: resultsPanelWidth }}>
        <SecondaryText as="p" className="text-center">
          Time to completion
        </SecondaryText>
        <div
          className={`rounded-ui flex items-center justify-center ${panelBg} shadow-btn py-4 px-10 w-full`}
        >
          <span className="text-text-panel font-bold text-5xl tabular-nums">
            {formatMMSS(elapsedSeconds)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Detail score panel body: header row + three category rows (icon + thumbnail panel).
 * Groups roundResults by correctLabel; shows 78×78 thumbnails with 4px red stroke when incorrect.
 */
function DetailScorePanelBody({ roundResults }) {
  if (!roundResults || !Array.isArray(roundResults)) return null

  const byCategory = { seatbelt: [], distracted: [], safe: [] }
  for (const r of roundResults) {
    const cat = r.correctLabel
    if (byCategory[cat]) byCategory[cat].push(r)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex flex-row items-center gap-4 shrink-0">
        <div style={{ width: DETAIL_ICON_PX }} className="text-text-panel font-medium">
          Category
        </div>
        <div className="text-text-panel font-medium" style={{ width: DETAIL_THUMB_PANEL_W_PX }}>
          Images
        </div>
      </div>
      {IMAGE_CATEGORIES.map((category) => {
        const results = byCategory[category] || []
        const isSafe = category === 'safe'
        const borderColor = isSafe ? 'rgba(28, 136, 84, 0.33)' : 'rgba(210, 62, 62, 0.33)'
        return (
          <div key={category} className="flex flex-row items-start gap-4 shrink-0">
            <div
              className="rounded-ui bg-btn-sorting-bg/65 flex items-center justify-center shrink-0 border-[3px] m-3"
              style={{ width: DETAIL_ICON_PX, height: DETAIL_ICON_PX, borderColor }}
            >
              <img
                src={DETAIL_ICONS[category]}
                alt=""
                className="w-10 h-10 object-contain"
                aria-hidden
              />
            </div>
            <div
              className="rounded-ui flex flex-wrap gap-4 p-3 shrink-0"
              style={{
                width: DETAIL_THUMB_PANEL_W_PX,
                background: 'rgba(228,228,228,0.3)',
              }}
            >
              {results.map((result) => {
                const meta = imageById[result.imageId]
                const src = meta?.src ?? ''
                const isIncorrect = !result.correct
                return (
                  <div
                    key={result.imageId}
                    className="relative shrink-0"
                    style={{
                      width: DETAIL_THUMB_PX,
                      height: DETAIL_THUMB_PX,
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className={`object-cover w-full h-full ${isIncorrect ? 'border-2 border-[#FF0000]' : ''}`}
                      style={{
                        borderRadius: DETAIL_THUMB_RADIUS_PX,
                      }}
                    />
                    {isIncorrect && (
                      <div
                        className="absolute inset-0 bg-[#FF0000] pointer-events-none"
                        style={{
                          borderRadius: DETAIL_THUMB_RADIUS_PX,
                          opacity: 0.2,
                        }}
                        aria-hidden
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const { gameState } = useGameContext()
  const [detailOpenAcu, setDetailOpenAcu] = useState(false)
  const [detailOpenComp, setDetailOpenComp] = useState(false)

  const isDual = gameState.playerMode === 'dual'
  const player0 = gameState.players[0]
  const player1 = gameState.players[1]
  const player = player0

  const score = player?.score
  const elapsedSeconds = player?.elapsedSeconds ?? null
  const hasResultsSingle = score !== null && score.total > 0
  const hasResultsDual =
    isDual &&
    player0?.score != null &&
    player0.score.total > 0 &&
    player1?.score != null &&
    player1.score.total > 0
  const hasResults = isDual ? hasResultsDual : hasResultsSingle

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

  return (
    <div className="w-full h-full bg-page-bg flex flex-col items-center justify-center p-3 relative">
      <div className="absolute top-3 left-3">
        <SecondaryButton onPress={() => navigate('/')}>
          <img src="/icons/icon_home.svg" alt="Home" className="w-[28px] h-[28px]" />
        </SecondaryButton>
      </div>

      {isDual ? (
        <div
          className="flex flex-row items-start justify-center shrink-0"
          style={{ gap: DUAL_RESULTS_GAP_PX }}
        >
          <div
            className="relative flex flex-col items-center gap-6 shrink-0"
            style={{ width: DUAL_RESULTS_TITLE_W_PX }}
          >
            <PlayerResultColumn
              headerLabel="Our Solution"
              pool="acusensus"
              score={player0.score}
              elapsedSeconds={player0.elapsedSeconds}
              titlePanelWidth={DUAL_RESULTS_TITLE_W_PX}
              resultsPanelWidth={DUAL_RESULTS_PANEL_W_PX}
            />
            {detailOpenAcu && (
              <div
                className="absolute left-0 z-10 rounded-ui bg-panel-acusensus flex flex-col"
                style={{ top: TITLE_PANEL_H_PX + DETAIL_PANEL_GAP_TOP_PX, width: DUAL_RESULTS_TITLE_W_PX, height: DETAIL_PANEL_H_PX }}
              >
                <div className="absolute top-2 right-2">
                  <SecondaryButton
                    onPress={() => setDetailOpenAcu(false)}
                    className="!bg-[#619BC2] !shadow-[inset_0_0_0_3px_#2E81B8,-1px_7px_12px_0px_rgba(0,0,0,0.25)]"
                  >
                    <img src="/icons/icon_x.svg" alt="Close" className="w-[28px] h-[28px]" />
                  </SecondaryButton>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto pt-12 px-4 pb-4 flex flex-col items-center">
                  <DetailScorePanelBody roundResults={player0?.roundResults} />
                </div>
              </div>
            )}
            <div className="mt-6">
              <PrimaryButton theme="acusensus" onPress={() => setDetailOpenAcu(true)}>
                SEE DETAILED SCORE
              </PrimaryButton>
            </div>
          </div>
          <div
            className="relative flex flex-col items-center gap-6 shrink-0"
            style={{ width: DUAL_RESULTS_TITLE_W_PX }}
          >
            <PlayerResultColumn
              headerLabel="Alternative System"
              pool="competitor"
              score={player1.score}
              elapsedSeconds={player1.elapsedSeconds}
              titlePanelWidth={DUAL_RESULTS_TITLE_W_PX}
              resultsPanelWidth={DUAL_RESULTS_PANEL_W_PX}
            />
            {detailOpenComp && (
              <div
                className="absolute left-0 z-10 rounded-ui bg-panel-competitor flex flex-col"
                style={{ top: TITLE_PANEL_H_PX + DETAIL_PANEL_GAP_TOP_PX, width: DUAL_RESULTS_TITLE_W_PX, height: DETAIL_PANEL_H_PX }}
              >
                <div className="absolute top-2 right-2">
                  <SecondaryButton
                    onPress={() => setDetailOpenComp(false)}
                    className="!bg-[#B76BB7] !shadow-[inset_0_0_0_3px_#AC4CAC,-1px_7px_12px_0px_rgba(0,0,0,0.25)]"
                  >
                    <img src="/icons/icon_x.svg" alt="Close" className="w-[28px] h-[28px]" />
                  </SecondaryButton>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto pt-12 px-4 pb-4 flex flex-col items-center">
                  <DetailScorePanelBody roundResults={player1?.roundResults} />
                </div>
              </div>
            )}
            <div className="mt-6">
              <PrimaryButton theme="competitor" onPress={() => setDetailOpenComp(true)}>
                SEE DETAILED SCORE
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-6" style={{ width: TITLE_PANEL_W_PX }}>
          <PlayerResultColumn
            headerLabel="Our Solution"
            pool={player.pool ?? 'acusensus'}
            score={score}
            elapsedSeconds={elapsedSeconds}
            titlePanelWidth={TITLE_PANEL_W_PX}
            resultsPanelWidth={RESULTS_PANEL_W_PX}
          />
          {detailOpenAcu && (
            <div
              className="absolute left-0 z-10 rounded-ui bg-panel-acusensus flex flex-col"
              style={{ top: TITLE_PANEL_H_PX + DETAIL_PANEL_GAP_TOP_PX, width: TITLE_PANEL_W_PX, height: DETAIL_PANEL_H_PX }}
            >
              <div className="absolute top-2 right-2">
                <SecondaryButton
                  onPress={() => setDetailOpenAcu(false)}
                  className="!bg-[#619BC2] !shadow-[inset_0_0_0_3px_#2E81B8,-1px_7px_12px_0px_rgba(0,0,0,0.25)]"
                >
                  <img src="/icons/icon_x.svg" alt="Close" className="w-[28px] h-[28px]" />
                </SecondaryButton>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pt-12 px-4 pb-4 flex flex-col items-center">
                <DetailScorePanelBody roundResults={player?.roundResults} />
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-4 mt-6">
            <PrimaryButton theme="acusensus" onPress={() => setDetailOpenAcu(true)}>
              SEE DETAILED SCORE
            </PrimaryButton>
            <PrimaryButton theme="acusensus" onPress={() => {}} className="!text-[38px]">
              PLAY WITH THE ALTERNATIVE
              <br />
              SYSTEM'S IMAGES
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}
