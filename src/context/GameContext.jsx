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

    case 'START_GAME':
      // payload: { playerAssignments: [{ pool, imageIds }, { pool, imageIds }] }
      return {
        ...state,
        playerMode: action.payload.playerMode,
        players: action.payload.playerAssignments.map(({ pool, imageIds }) => ({
          pool,
          assignedImageIds: imageIds,
          classifications: {},
          currentIndex: 0,
          score: null,
        })),
        phase: 'playing',
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

    case 'COMPLETE_GAME': {
      // labelByImageId is passed in as payload to keep the reducer dependency-free
      const { labelByImageId } = action.payload
      const scoredPlayers = state.players.map((player) => {
        if (player.assignedImageIds.length === 0) return { ...player, score: null }
        const correct = player.assignedImageIds.filter(
          (id) => player.classifications[id] === labelByImageId[id]
        ).length
        return {
          ...player,
          score: {
            correct,
            total: player.assignedImageIds.length,
            percent: Math.round((correct / player.assignedImageIds.length) * 100),
          },
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
