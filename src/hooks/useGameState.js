import { useCallback } from 'react'
import { useGameContext } from '../context/GameContext'
import { acusensusImages, competitorImages, labelByImageId } from '../data/imageManifest'

/**
 * Fisher-Yates in-place shuffle. Returns the mutated array.
 * Always called on a copy — the original manifest arrays are never mutated.
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Returns a shuffled array of IDs from the given pool array */
function shuffledIds(poolArray) {
  return shuffleArray([...poolArray]).map((img) => img.id)
}

/**
 * High-level game state helpers built on top of GameContext.
 * Import this hook in pages that need to start or reset the game.
 */
export function useGameState() {
  const { gameState, dispatch, resetGame } = useGameContext()

  /**
   * Shuffle the appropriate image pool(s) and dispatch START_GAME.
   *
   * @param {object} options
   * @param {'single'|'dual'} options.mode
   * @param {'acusensus'|'competitor'} [options.p0pool='acusensus']
   *   Pool for player 0. In dual mode this is always 'acusensus' (ignored if passed).
   *   In single mode, pass 'competitor' to start the bonus round.
   *
   * Examples:
   *   startGame({ mode: 'single' })                          → acusensus round 1
   *   startGame({ mode: 'single', p0pool: 'competitor' })   → competitor bonus round
   *   startGame({ mode: 'dual' })                           → acusensus vs competitor
   */
  const startGame = useCallback(
    ({ mode, p0pool = 'acusensus' }) => {
      let playerAssignments

      if (mode === 'dual') {
        playerAssignments = [
          { pool: 'acusensus', imageIds: shuffledIds(acusensusImages) },
          { pool: 'competitor', imageIds: shuffledIds(competitorImages) },
        ]
      } else {
        const pool = p0pool
        const sourceImages = pool === 'competitor' ? competitorImages : acusensusImages
        playerAssignments = [
          { pool, imageIds: shuffledIds(sourceImages) },
          { pool: null, imageIds: [] },
        ]
      }

      dispatch({ type: 'START_GAME', payload: { playerMode: mode, playerAssignments } })
    },
    [dispatch]
  )

  /**
   * Record a player's classification for an image and advance their card index.
   */
  const classifyImage = useCallback(
    (playerIndex, imageId, label) => {
      dispatch({ type: 'CLASSIFY_IMAGE', payload: { playerIndex, imageId, label } })
      dispatch({ type: 'ADVANCE_CARD', payload: { playerIndex } })
    },
    [dispatch]
  )

  /**
   * Mark the game as complete and calculate scores.
   */
  const completeGame = useCallback(() => {
    dispatch({ type: 'COMPLETE_GAME', payload: { labelByImageId } })
  }, [dispatch])

  return {
    gameState,
    startGame,
    classifyImage,
    completeGame,
    resetGame,
  }
}
