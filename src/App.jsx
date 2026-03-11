import { useState, useEffect } from 'react'
import { BrowserRouter, Navigate, useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider } from './context/GameContext'
import { useIdleTimer } from './hooks/useIdleTimer'
import { usePreventZoom } from './hooks/usePreventZoom'
import { usePreventContextMenu } from './hooks/usePreventContextMenu'
import FullscreenLayout from './components/layout/FullscreenLayout'
import { PrimaryButton, PrimaryText } from './components/ui'
import Welcome from './pages/Welcome'
import Instructions from './pages/Instructions'
import PlayerMode from './pages/PlayerMode'
import GamePlay from './pages/GamePlay'
import Results from './pages/Results'

const routes = [
  { path: '/', element: <Welcome /> },
  { path: '/instructions', element: <Instructions /> },
  { path: '/player-mode', element: <PlayerMode /> },
  { path: '/gameplay', element: <GamePlay /> },
  { path: '/results', element: <Results /> },
  { path: '*', element: <Navigate to="/" replace /> },
]

const PAGE_TRANSITION_DURATION = 1.1
const GA_MEASUREMENT_ID = 'G-BKQF0WDKTY'

function AnimatedRoutes() {
  const location = useLocation()

  // Send page_view to Google Analytics on route change (SPA); skip when offline
  useEffect(() => {
    if (navigator.onLine && typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, { page_path: location.pathname })
    }
  }, [location.pathname])
  const element = useRoutes(routes)
  return (
    <AnimatePresence mode="wait">
      {element && (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: PAGE_TRANSITION_DURATION, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            width: 1920,
            height: 1080,
          }}
        >
          {element}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const IDLE_FIRST_MS = 30_000 // 30 seconds of inactivity → show "Are you still there?" popup (other pages)
const IDLE_RESULTS_MS = 60_000 // 60 seconds on Results page
const POPUP_RESPONSE_MS = 8_000 // 8 seconds to respond or return to Welcome
// Set to true to pause idle timeout during development; set back to false for production
const PAUSE_IDLE_TIMEOUT_FOR_DEV = false

/**
 * Wraps all routes. After N seconds of no activity, shows "Are you still there?" popup.
 * N = 20s on Results, 10s on all other pages. User has POPUP_RESPONSE_MS to respond or we navigate to Welcome.
 */
function IdleTimerWrapper({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showStillTherePopup, setShowStillTherePopup] = useState(false)

  usePreventZoom()
  usePreventContextMenu()

  const idleTimeoutMs =
    PAUSE_IDLE_TIMEOUT_FOR_DEV || location.pathname === '/'
      ? 0
      : location.pathname === '/results'
        ? IDLE_RESULTS_MS
        : IDLE_FIRST_MS

  const { resetTimer } = useIdleTimer({
    timeoutMs: idleTimeoutMs,
    onIdle: () => setShowStillTherePopup(true),
  })

  // When popup is shown, give user 8 seconds to respond or go to Welcome
  useEffect(() => {
    if (!showStillTherePopup) return
    const id = setTimeout(() => {
      setShowStillTherePopup(false)
      navigate('/', { replace: true })
    }, POPUP_RESPONSE_MS)
    return () => clearTimeout(id)
  }, [showStillTherePopup, navigate])

  const handleStillHere = () => {
    setShowStillTherePopup(false)
    resetTimer()
  }

  return (
    <FullscreenLayout>
      {children}
      {showStillTherePopup && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#DCDCDC]/90"
          role="dialog"
          aria-modal="true"
          aria-labelledby="still-there-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <PrimaryText
            id="still-there-title"
            as="p"
            className="text-text-default text-center"
          >
            Are you still there?
          </PrimaryText>
          <div style={{ height: 120 }} aria-hidden />
          <PrimaryButton theme="acusensus" onPress={handleStillHere}>
            YES, I'M HERE
          </PrimaryButton>
        </motion.div>
      )}
    </FullscreenLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <IdleTimerWrapper>
          <AnimatedRoutes />
        </IdleTimerWrapper>
      </GameProvider>
    </BrowserRouter>
  )
}
