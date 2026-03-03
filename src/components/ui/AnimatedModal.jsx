import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * Full-screen modal with enter/exit animations.
 * When the user requests close (e.g. via a button), exit animation runs;
 * when it completes, onClose() is called, then any callback passed to requestClose(cb).
 *
 * Props:
 *   open       boolean  — whether the modal is shown
 *   onClose    () => void  — called when the modal has fully closed (after exit animation)
 *   children   ({ requestClose }) => ReactNode  — render prop; requestClose(optionalCallback) starts close
 *   ariaLabelledBy  string  — id of the element that labels the dialog
 *   contentClassName  string  — optional classes for the content wrapper (e.g. overflow-y-auto)
 *   transitionDuration  number  — optional; duration in seconds for enter/exit (default 0.3)
 */
export default function AnimatedModal({
  open,
  onClose,
  children,
  ariaLabelledBy,
  contentClassName = '',
  transitionDuration = 0.3,
}) {
  const transition = { duration: transitionDuration, ease: 'easeInOut' }
  const [isExiting, setIsExiting] = useState(false)
  const afterCloseRef = useRef(null)

  const requestClose = (afterCloseCallback) => {
    afterCloseRef.current = afterCloseCallback ?? null
    setIsExiting(true)
  }

  const handleExitComplete = () => {
    setIsExiting(false)
    onClose?.()
    const cb = afterCloseRef.current
    afterCloseRef.current = null
    cb?.()
  }

  if (!open && !isExiting) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#DCDCDC]/85"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={transition}
    >
      <motion.div
        className={`flex flex-col items-center ${contentClassName}`.trim()}
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={
          isExiting
            ? { opacity: 0, scale: 0.98, y: 12 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={transition}
        onAnimationComplete={() => {
          if (isExiting) handleExitComplete()
        }}
      >
        {children({ requestClose })}
      </motion.div>
    </motion.div>
  )
}
