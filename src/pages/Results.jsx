import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const RESULTS_LINGER_MS = Number(import.meta.env.VITE_RESULTS_LINGER_MS) || 15000

export default function Results() {
  const navigate = useNavigate()
  const timerRef = useRef(null)

  // Auto-advance back to Welcome after the linger timeout
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigate('/', { replace: true })
    }, RESULTS_LINGER_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [navigate])

  return <div></div>
}
