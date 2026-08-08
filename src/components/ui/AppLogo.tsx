import React from 'react'

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | number
  hideText?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  hideText = false,
  className = '',
  iconClassName = '',
  textClassName = ''
}) => {
  // Compute width and height based on size prop
  let iconSize = 36
  let textClass = 'text-xl'
  let containerGap = 'gap-2.5'

  if (typeof size === 'number') {
    iconSize = size
    textClass = size > 40 ? 'text-2xl' : size < 30 ? 'text-lg' : 'text-xl'
  } else {
    switch (size) {
      case 'sm':
        iconSize = 28
        textClass = 'text-lg'
        containerGap = 'gap-2'
        break
      case 'lg':
        iconSize = 48
        textClass = 'text-2xl'
        containerGap = 'gap-3.5'
        break
      case 'md':
      default:
        iconSize = 36
        textClass = 'text-xl'
        containerGap = 'gap-2.5'
        break
    }
  }

  return (
    <div className={`inline-flex items-center ${containerGap} select-none ${className}`}>
      {/* Premium Shield and Car Brand Mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-transform duration-300 hover:scale-105 ${iconClassName}`}
      >
        <defs>
          {/* Main Shield Gradient */}
          <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" /> {/* Emerald 500 */}
            <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan 500 */}
          </linearGradient>
          {/* Inner Glow Gradient */}
          <linearGradient id="glowGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.2" />
          </linearGradient>
          {/* Car Metallic Accent */}
          <linearGradient id="carGrad" x1="14" y1="24" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>

        {/* Outer Shield Outline */}
        <path
          d="M24 4L6 9.5V22C6 33.5 13.8 41.5 24 44C34.2 41.5 42 33.5 42 22V9.5L24 4Z"
          stroke="url(#shieldGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Shield Inner Glowing Semi-Fill */}
        <path
          d="M24 7L10 11.2V21.5C10 30.5 16 37 24 39.5C32 37 38 30.5 38 21.5V11.2L24 7Z"
          fill="url(#glowGrad)"
          opacity="0.15"
        />

        {/* Stylized Car Front Profile (Safety Shield Emblem) */}
        {/* Car Windshield/Roof */}
        <path
          d="M17 21L21.5 15.5H26.5L31 21H17Z"
          fill="url(#carGrad)"
          opacity="0.85"
        />
        {/* Car Body/Grille */}
        <path
          d="M14 23.5C14 22.67 14.67 22 15.5 22H32.5C33.33 22 34 22.67 34 23.5V28C34 29.5 32.5 30 24 30C15.5 30 14 29.5 14 28V23.5Z"
          fill="url(#carGrad)"
        />
        {/* Glowing Headlights */}
        <circle cx="17.5" cy="25.5" r="1.5" fill="#34D399" />
        <circle cx="30.5" cy="25.5" r="1.5" fill="#34D399" />
        
        {/* Dynamic Speed Grille Lines */}
        <line x1="20" y1="27.5" x2="28" y2="27.5" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="29" x2="26" y2="29" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Brand Text styling */}
      {!hideText && (
        <div className={`flex items-center font-sans tracking-tight font-extrabold select-none ${textClass} ${textClassName}`}>
          <span className="text-slate-100 font-bold tracking-tight">Vaahan</span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent ml-0.5">
            Safe
          </span>
          <span className="text-emerald-400 ml-0.5 font-black text-2xl leading-none animate-pulse">.</span>
        </div>
      )}
    </div>
  )
}

export default AppLogo
