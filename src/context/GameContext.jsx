import { createContext, useContext, useReducer, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Initial state — returned verbatim by RESET_GAME so resets are airtight
// ---------------------------------------------------------------------------
const initialPlayerState = () => ({
  pool: null,               // 'acusensus' | 'competitor'
  assignedImageIds: [],
  classifications: {},      // { [imageId]: 'seatbelt' | 'distracted' | 'safe' }
  currentIndex: 0,
  score: null,              // null during play; { correct, total, percent } after complete
  roundResults: null,       // null during play; after complete: [{ imageId, userLabel, correctLabel, correct }]
  elapsedSeconds: null,    // null until round complete; then time taken for this player (single: player 0 only)
})

const initialState = {
  playerMode: null,    // 'single' | 'dual'
  players: [initialPlayerState(), initialPlayerState()],
  phase: 'idle',       // 'idle' | 'playing' | 'complete'
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_MODE':
      return { ...state, playerMode: action.payload.mode }

    case 'START_GAME': {
      // payload: { playerAssignments: [{ pool, imageIds }, { pool, imageIds }] }
      const playerAssignments = action.payload.playerAssignments ?? []
      const players = playerAssignments.map((assignment) => {
        const { pool, imageIds } = assignment
        return {
          pool,
          assignedImageIds: Array.isArray(imageIds) ? [...imageIds] : [],
          classifications: {},
          currentIndex: 0,
          score: null,
          roundResults: null,
          elapsedSeconds: null,
        }
      })
      return {
        ...state,
        playerMode: action.payload.playerMode,
        players,
        phase: 'playing',
      }
    }

    case 'CLASSIFY_IMAGE': {
      const { playerIndex, imageId, label } = action.payload
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === playerIndex
            ? { ...p, classifications: { ...p.classifications, [imageId]: label } }
            : p
        ),
      }
    }

    case 'ADVANCE_CARD': {
      const { playerIndex } = action.payload
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === playerIndex ? { ...p, currentIndex: p.currentIndex + 1 } : p
        ),
      }
    }

    case 'UNDO_CLASSIFICATION': {
      const { playerIndex } = action.payload
      return {
        ...state,
        players: state.players.map((p, i) => {
          if (i !== playerIndex || p.currentIndex === 0) return p
          const prevIndex = p.currentIndex - 1
          const imageIdToRemove = p.assignedImageIds[prevIndex]
          const { [imageIdToRemove]: _, ...restClassifications } = p.classifications
          return {
            ...p,
            currentIndex: prevIndex,
            classifications: restClassifications,
          }
        }),
      }
    }

    case 'COMPLETE_GAME': {
      const { labelByImageId, elapsedSecondsByPlayer } = action.payload
      const scoredPlayers = state.players.map((player, i) => {
        if (player.assignedImageIds.length === 0) {
          return { ...player, score: null, roundResults: null, elapsedSeconds: null }
        }
        const roundResults = player.assignedImageIds.map((imageId) => {
          const userLabel = player.classifications[imageId]
          const correctLabel = labelByImageId[imageId]
          return {
            imageId,
            userLabel,
            correctLabel,
            correct: userLabel === correctLabel,
          }
        })
        const correct = roundResults.filter((r) => r.correct).length
        const total = player.assignedImageIds.length
        const elapsedSeconds = Array.isArray(elapsedSecondsByPlayer) ? elapsedSecondsByPlayer[i] ?? null : (i === 0 ? elapsedSecondsByPlayer : null)
        return {
          ...player,
          score: { correct, total, percent: Math.round((correct / total) * 100) },
          roundResults,
          elapsedSeconds,
        }
      })
      return { ...state, players: scoredPlayers, phase: 'complete' }
    }

    case 'RESET_GAME':
      // Fresh copies — not references to initialState — so past state is GC'd
      return {
        playerMode: null,
        players: [initialPlayerState(), initialPlayerState()],
        phase: 'idle',
      }

    // Corrects bug where a player can have currentIndex > 0 but no classifications (e.g. comp starting at 2/24)
    case 'RESET_PLAYER_IF_NOT_STARTED': {
      const players = state.players.map((p, i) => {
        const hasNoClassifications = !p.classifications || Object.keys(p.classifications).length === 0
        if (p.assignedImageIds?.length > 0 && hasNoClassifications && (p.currentIndex ?? 0) > 0) {
          return { ...p, currentIndex: 0 }
        }
        return p
      })
      return { ...state, players }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])

  return (
    <GameContext.Provider value={{ gameState, dispatch, resetGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameContext must be used within a GameProvider')
  return ctx
}
