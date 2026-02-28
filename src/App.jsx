import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import { useIdleTimer } from './hooks/useIdleTimer'
import { usePreventZoom } from './hooks/usePreventZoom'
import FullscreenLayout from './components/layout/FullscreenLayout'
import Welcome from './pages/Welcome'
import Instructions from './pages/Instructions'
import PlayerMode from './pages/PlayerMode'
import GamePlay from './pages/GamePlay'
import Results from './pages/Results'

const IDLE_TIMEOUT_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 300000 // 5 minutes

/**
 * Wraps all routes. Activates the idle timer so any N seconds of inactivity
 * on any page redirects back to the Welcome screen.
 */
function IdleTimerWrapper({ children }) {
  const navigate = useNavigate()
  usePreventZoom()
  useIdleTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: () => navigate('/', { replace: true }),
  })
  return (
    <FullscreenLayout>
      {children}
    </FullscreenLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <IdleTimerWrapper>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/player-mode" element={<PlayerMode />} />
            <Route path="/gameplay" element={<GamePlay />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </IdleTimerWrapper>
      </GameProvider>
    </BrowserRouter>
  )
}
