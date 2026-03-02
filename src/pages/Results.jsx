import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState'
import { SecondaryButton, SecondaryText, PrimaryText, PrimaryButton } from '../components/ui'
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
const DETAIL_THUMB_PANEL_W_PX_SINGLE = 680
const DETAIL_THUMB_PX = 78
const DETAIL_THUMB_PX_SINGLE = 96
const DETAIL_ICON_PX_SINGLE = 96
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
      <div className="flex flex-col items-center gap-2 w-full">
        <SecondaryText as="p" className="text-center whitespace-nowrap">
          Images correctly classified
        </SecondaryText>
        <div
          className={`rounded-ui flex flex-col items-center justify-center ${panelBg} shadow-btn py-8 px-12 w-full`}
          style={{ width: resultsPanelWidth, minHeight: 200 }}
        >
          <span className="text-text-panel font-bold text-[104px] tabular-nums">
            {score.percent}%
          </span>
          <span className="text-text-panel/80 text-secondary-text mt-2 tabular-nums">
            {score.correct}/{score.total}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 w-full">
        <SecondaryText as="p" className="text-center">
          Time to completion
        </SecondaryText>
        <div
          className={`rounded-ui flex items-center justify-center ${panelBg} shadow-btn py-4 px-10 w-full`}
          style={{ width: resultsPanelWidth }}
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
function DetailScorePanelBody({
  roundResults,
  thumbPanelWidthPx = DETAIL_THUMB_PANEL_W_PX,
  iconSizePx = DETAIL_ICON_PX,
  thumbSizePx = DETAIL_THUMB_PX,
}) {
  if (!roundResults || !Array.isArray(roundResults)) return null

  const byCategory = { seatbelt: [], distracted: [], safe: [] }
  for (const r of roundResults) {
    const cat = r.correctLabel
    if (byCategory[cat]) byCategory[cat].push(r)
  }
  const iconInnerSize = Math.round(iconSizePx * 0.51)

  return (
    <div className="flex flex-col gap-3">
      {/* Header row — first column width includes icon margin (m-3 = 12px each side) so Category centers over icons */}
      <div className="flex flex-row items-center gap-4 shrink-0">
        <div
          style={{ width: iconSizePx + 24, fontSize: 24 }}
          className="text-text-panel font-medium flex justify-center text-center"
        >
          Category
        </div>
        <div
          style={{ width: thumbPanelWidthPx, fontSize: 24 }}
          className="text-text-panel font-medium flex justify-center text-center"
        >
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
              style={{ width: iconSizePx, height: iconSizePx, borderColor }}
            >
              <img
                src={DETAIL_ICONS[category]}
                alt=""
                className="object-contain"
                style={{ width: iconInnerSize, height: iconInnerSize }}
                aria-hidden
              />
            </div>
            <div
              className="rounded-ui flex flex-wrap gap-4 p-3 shrink-0"
              style={{
                width: thumbPanelWidthPx,
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
                      width: thumbSizePx,
                      height: thumbSizePx,
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
  const { gameState, startGame } = useGameState()
  const [detailOpenAcu, setDetailOpenAcu] = useState(false)
  const [detailOpenComp, setDetailOpenComp] = useState(false)
  const [pendingNavigateToAlternative, setPendingNavigateToAlternative] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

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

  // Redirect to home when no results or not complete; skip when pending navigate to alternative round
  useEffect(() => {
    if (pendingNavigateToAlternative) return
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
  }, [pendingNavigateToAlternative, hasResults, gameState.phase, navigate])

  // When user chose "play with alternative": after game state is updated, navigate to gameplay
  useEffect(() => {
    if (!pendingNavigateToAlternative) return
    if (gameState.phase !== 'playing' || gameState.playerMode !== 'single') return
    const p0 = gameState.players[0]
    if (p0?.pool !== 'competitor') return
    const id = setTimeout(() => {
      navigate('/gameplay')
      setPendingNavigateToAlternative(false)
    }, 0)
    return () => clearTimeout(id)
  }, [pendingNavigateToAlternative, gameState.phase, gameState.playerMode, gameState.players, navigate])

  if (!hasResults || gameState.phase !== 'complete') return null

  return (
    <div className="w-full h-full bg-page-bg flex flex-col items-center justify-center p-3 relative">
      <div className="absolute top-3 left-3">
        <SecondaryButton onPress={() => setShowExitConfirm(true)}>
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
                <div className="flex-1 min-h-0 overflow-y-auto pt-8 px-4 pb-4 flex flex-col items-center">
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
                <div className="flex-1 min-h-0 overflow-y-auto pt-8 px-4 pb-4 flex flex-col items-center">
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
        <div
          className="relative flex flex-col items-center gap-6"
          style={{ width: TITLE_PANEL_W_PX, ...(player?.pool === 'competitor' ? { marginTop: -96 } : {}) }}
        >
          <PlayerResultColumn
            headerLabel={player?.pool === 'competitor' ? 'Alternative System' : 'Our Solution'}
            pool={player.pool ?? 'acusensus'}
            score={score}
            elapsedSeconds={elapsedSeconds}
            titlePanelWidth={TITLE_PANEL_W_PX}
            resultsPanelWidth={RESULTS_PANEL_W_PX}
          />
          {detailOpenAcu && (
            <div
              className={`absolute left-0 z-10 rounded-ui flex flex-col ${player?.pool === 'competitor' ? 'bg-panel-competitor' : 'bg-panel-acusensus'}`}
              style={{ top: TITLE_PANEL_H_PX + DETAIL_PANEL_GAP_TOP_PX, width: TITLE_PANEL_W_PX, height: 744 }}
            >
              <div className="absolute top-2 right-2">
                <SecondaryButton
                  onPress={() => setDetailOpenAcu(false)}
                  className={player?.pool === 'competitor' ? '!bg-[#B76BB7] !shadow-[inset_0_0_0_3px_#AC4CAC,-1px_7px_12px_0px_rgba(0,0,0,0.25)]' : '!bg-[#619BC2] !shadow-[inset_0_0_0_3px_#2E81B8,-1px_7px_12px_0px_rgba(0,0,0,0.25)]'}
                >
                  <img src="/icons/icon_x.svg" alt="Close" className="w-[28px] h-[28px]" />
                </SecondaryButton>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pt-8 px-4 pb-4 flex flex-col items-center">
                <DetailScorePanelBody
                roundResults={player?.roundResults}
                thumbPanelWidthPx={DETAIL_THUMB_PANEL_W_PX_SINGLE}
                iconSizePx={DETAIL_ICON_PX_SINGLE}
                thumbSizePx={DETAIL_THUMB_PX_SINGLE}
              />
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-4 mt-6">
            <PrimaryButton theme={player?.pool === 'competitor' ? 'competitor' : 'acusensus'} onPress={() => setDetailOpenAcu(true)}>
              SEE DETAILED SCORE
            </PrimaryButton>
            {!isDual && player?.pool === 'acusensus' && (
              <PrimaryButton
                theme="acusensus"
                onPress={() => {
                  startGame({ mode: 'single', p0pool: 'competitor' })
                  setPendingNavigateToAlternative(true)
                }}
                className="!text-[38px]"
              >
                PLAY WITH THE ALTERNATIVE
                <br />
                SYSTEM'S IMAGES
              </PrimaryButton>
            )}
          </div>
        </div>
      )}

      {/* Exit Results confirmation popup */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#DCDCDC]/85"
          role="dialog"
          aria-modal="true"
          aria-labelledby="results-exit-confirm-title"
        >
          <div className="flex flex-col items-center">
            <PrimaryText id="results-exit-confirm-title" as="p" className="text-text-default text-center">
              Exit Results page?
            </PrimaryText>
            <div style={{ height: 200 }} aria-hidden />
            <div className="flex flex-col items-center gap-4">
              <PrimaryButton theme="acusensus" onPress={() => setShowExitConfirm(false)}>
                STAY HERE
              </PrimaryButton>
              <PrimaryButton theme="acusensus" onPress={() => { setShowExitConfirm(false); navigate('/') }}>
                EXIT
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
