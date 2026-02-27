import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../context/GameContext'

export default function GamePlay() {
  const navigate = useNavigate()
  const { gameState } = useGameContext()

  // Guard: if playerMode is not set, the user arrived here directly (e.g. via URL).
  // Redirect back to the start.
  useEffect(() => {
    if (!gameState.playerMode) {
      navigate('/', { replace: true })
    }
  }, [gameState.playerMode, navigate])

  return <div></div>
}
