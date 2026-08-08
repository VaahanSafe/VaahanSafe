import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PageLoaderProps {
  onComplete?: () => void
  duration?: number // in seconds
}

export default function PageLoader({ onComplete, duration = 2.2 }: PageLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    const updateProgress = () => {
      const now = Date.now()
      const percentage = Math.min(((now - startTime) / (duration * 1000)) * 100, 100)
      setProgress(percentage)

      if (now < endTime) {
        requestAnimationFrame(updateProgress)
      } else {
        setTimeout(() => {
          setIsVisible(false)
          if (onComplete) onComplete()
        }, 300)
      }
    }

    requestAnimationFrame(updateProgress)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 bg-[#0a0a0c] z-[9999] flex flex-col items-center justify-center select-none"
        >
          {/* Subtle background ambient glow */}
          <div className="absolute w-[350px] h-[350px] rounded-full bg-brand/5 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col items-center space-y-8 z-10">
            {/* Blinking Mascot Logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-28 h-28"
            >
              <svg 
                viewBox="0 0 256 229" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-full h-full drop-shadow-[0_15px_30px_rgba(250,136,22,0.15)]"
              >
                <defs>
                  <linearGradient id="loader-logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e14760" />
                    <stop offset="100%" stopColor="#fa8816" />
                  </linearGradient>
                </defs>

                {/* Outer Shield Outline */}
                <path 
                  d="M128 5 C70 30 30 60 30 115 C30 170 70 205 128 224 C186 205 226 170 226 115 C226 60 186 30 128 5 Z" 
                  fill="url(#loader-logo-grad)" 
                  fillOpacity="0.05" 
                  stroke="url(#loader-logo-grad)" 
                  strokeWidth="6" 
                  strokeLinejoin="round"
                />

                {/* Main Mascot Body */}
                <path 
                  fill="url(#loader-logo-grad)" 
                  d="m254.777 80.172l-60.284-77.13c-3.468-4.294-9.91-3.964-13.048.496l-25.6 36.5c-8.093-4.624-17.672-7.102-27.582-6.937c-10.735 0-20.81 2.643-29.233 7.268L74.256 4.694c-3.138-4.46-9.745-4.79-13.048-.496L.758 81.328c-2.476 3.139 1.653 7.103 4.625 4.46l52.026-46.41c1.487-1.322 3.964-1.157 5.285.33l6.442 20.15c-29.564 7.267-51.53 34.023-51.53 65.734c.165 35.51 27.746 64.578 62.596 67.22c.99 12.883 8.258 26.922 32.04 35.345c1.983.66 3.47-1.486 2.313-3.138c-2.312-3.138-4.79-7.432-5.615-12.057c5.615 1.982 11.56 3.138 18.002 3.138c5.616 0 10.9-.99 16.186-2.642c-.826 4.459-3.303 8.588-5.45 11.56c-1.156 1.653.33 3.8 2.312 3.139c23.948-8.423 32.041-22.627 33.528-35.51c36.5-.99 65.734-31.05 65.569-67.716c-.165-32.206-22.627-58.962-52.687-65.734l6.607-20.645c1.321-1.652 3.633-1.817 5.285-.33l52.026 46.41c2.807 2.642 6.936-1.487 4.459-4.46"
                />

                {/* Animated Blinking Eyes Group */}
                <motion.g
                  style={{ transformOrigin: '128px 133px' }}
                  animate={{ scaleY: [1, 1, 0.1, 1, 1, 0.1, 1, 1] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut'
                  }}
                >
                  {/* Left Eye */}
                  <ellipse 
                    cx="72.688" 
                    cy="133.438" 
                    fill="#fff" 
                    rx="48.39" 
                    ry="35.508" 
                    transform="rotate(58.445 72.688 133.438)"
                  />
                  <path 
                    fill="#e54d42" 
                    d="M58 120 H86 V132 L96 142 H92 L84 134 C84 134 72 148 72 148 C72 148 58 142 58 132 V120 Z" 
                    fillRule="evenodd"
                  />

                  {/* Right Eye */}
                  <ellipse 
                    cx="184.51" 
                    cy="133.956" 
                    fill="#fff" 
                    rx="48.721" 
                    ry="36.169" 
                    transform="rotate(-58.445 184.51 133.956)"
                  />
                  <path 
                    fill="#e54d42" 
                    d="M198 120 H170 V132 L160 142 H164 L172 134 C172 134 184 148 184 148 C184 148 198 142 198 132 V120 Z" 
                    fillRule="evenodd"
                  />
                </motion.g>
              </svg>
            </motion.div>

            {/* Progress Container */}
            <div className="flex flex-col items-center space-y-2.5 w-44 select-none">
              {/* Progress track */}
              <div className="w-full h-[3px] bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/30">
                {/* Progress fill */}
                <motion.div 
                  className="h-full bg-gradient-to-r from-brand to-accent rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold tracking-widest">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
