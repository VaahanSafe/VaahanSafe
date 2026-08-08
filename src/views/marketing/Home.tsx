import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { motion, useInView, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import vaahanLogo from '../../assets/logo.svg'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ScanIcon,
  Shield01Icon,
  ZapIcon,
  Call02Icon,
  Message01Icon,
  MapPinpoint01Icon,
  CreditCardIcon,
  SentIcon,
  UserGroupIcon,
  TruckIcon,
  ArrowRight01Icon,
  QuoteDownIcon,
} from '@hugeicons/core-free-icons'

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM NOTES (for whoever edits this later)
// ─────────────────────────────────────────────────────────────────────────────
// Palette:   brand-start #fa8816 (highway amber) → brand-mid #f2603f (ember) →
//            brand-end #e14760 (signal rose). This 3-stop gradient IS the logo —
//            it never appears as generic decoration, only on: the mark itself,
//            the "Golden Hour" telemetry motif, and genuine emergency UI states.
// Reserved:  Solid crimson/red is used ONLY for real urgency (SOS, collisions,
//            live alerts) — never for decorative or "success" states. Compliance,
//            verification, and neutral success use amber (#FFB100) or zinc.
// Signature: The "Golden Hour Meter" — a speedometer-style arc that visualizes
//            dispatch time. It anchors the hero, threads through the response
//            timeline, and echoes as a watermark behind the closing CTA.
// ─────────────────────────────────────────────────────────────────────────────

// ─── The Golden Hour Meter (signature motif) ────────────────────────────────

const GoldenHourMeter = ({ size = 240 }: { size?: number }) => {
  const shouldReduceMotion = useReducedMotion()
  const r = 84
  const circumference = 2 * Math.PI * r
  const arcFraction = 0.72 // visible sweep of the dial
  const arcLength = circumference * arcFraction
  const gapLength = circumference - arcLength
  const rotate = 90 + (360 * (1 - arcFraction)) / 2 // center the gap at the bottom

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="overflow-visible">
      <defs>
        <linearGradient id="ghm-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fa8816" />
          <stop offset="55%" stopColor="#f2603f" />
          <stop offset="100%" stopColor="#e14760" />
        </linearGradient>
      </defs>

      {/* Track */}
      <circle
        cx="100" cy="100" r={r}
        stroke="currentColor" strokeWidth="10" fill="none"
        className="text-zinc-200 dark:text-zinc-800"
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={`rotate(${rotate} 100 100)`}
      />

      {/* Tick labels: 0s / 1s / 2s */}
      <text x="30" y="168" className="fill-zinc-400 dark:fill-zinc-600" fontSize="8" fontFamily="monospace">0s</text>
      <text x="96" y="20" className="fill-zinc-400 dark:fill-zinc-600" fontSize="8" fontFamily="monospace">1s</text>
      <text x="158" y="168" className="fill-zinc-400 dark:fill-zinc-600" fontSize="8" fontFamily="monospace">2s+</text>

      {/* Progress arc — breathes gently to suggest "live" telemetry */}
      <motion.circle
        cx="100" cy="100" r={r}
        stroke="url(#ghm-grad)" strokeWidth="10" fill="none"
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={`rotate(${rotate} 100 100)`}
        initial={{ strokeDashoffset: arcLength }}
        animate={
          shouldReduceMotion
            ? { strokeDashoffset: arcLength * 0.14 }
            : { strokeDashoffset: [arcLength, arcLength * 0.1, arcLength * 0.14] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 2.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.6 }
        }
      />

      {/* Needle-tip glow */}
      {!shouldReduceMotion && (
        <motion.circle
          cx="171" cy="150" r="4" fill="#FFB100"
          animate={{ opacity: [0, 1, 0.6], scale: [0.6, 1.15, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6 }}
        />
      )}

      {/* Center readout */}
      <text x="100" y="98" textAnchor="middle" fontSize="30" fontWeight="800" className="fill-zinc-900 dark:fill-white font-display">1.8s</text>
      <text x="100" y="118" textAnchor="middle" fontSize="8.5" letterSpacing="1.5" className="fill-zinc-500 dark:fill-zinc-400 font-mono uppercase">avg. dispatch</text>
    </svg>
  )
}

// ─── Framer Motion Animated SVG Icons (brand illustration set) ─────────────

const ShieldLockIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    <motion.ellipse cx="40" cy="40" rx="38" ry="38"
      stroke="rgba(250,136,22,0.12)" strokeWidth="1"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.path
      d="M40 8 L68 20 L68 42 C68 56 55 68 40 72 C25 68 12 56 12 42 L12 20 Z"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
    />
    <motion.rect x="28" y="38" width="24" height="18" rx="3"
      stroke="url(#logo-grad)" strokeWidth="1.8" fill="none"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    />
    <motion.path d="M32 38 L32 32 C32 27 48 27 48 32 L48 38"
      stroke="url(#logo-grad)" strokeWidth="1.8" fill="none" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    />
    <motion.circle cx="40" cy="46" r="2.5"
      fill="#FFB100"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 1.2, duration: 0.3 }}
    />
    {[20, 30, 50, 60].map((y, i) => (
      <motion.line key={i} x1="4" y1={y} x2="76" y2={y}
        stroke="rgba(250,136,22,0.08)" strokeWidth="0.5"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }}
        transition={{ delay: i * 0.2, duration: 2, repeat: Infinity, repeatDelay: 1 }}
      />
    ))}
  </motion.svg>
)

const SosAlertIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    {[1, 2, 3].map((ring) => (
      <motion.circle key={ring} cx="40" cy="40" r={12 + ring * 10}
        stroke="rgba(250,136,22,0.12)" strokeWidth="1" fill="none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: ring * 0.4, ease: 'easeOut' }}
      />
    ))}
    <motion.path
      d="M46 10 L28 42 H40 L34 70 L56 34 H44 Z"
      stroke="url(#logo-grad)" strokeWidth="2" fill="rgba(250,136,22,0.06)"
      strokeLinejoin="round" strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    />
    <motion.circle cx="40" cy="40" r="6"
      fill="rgba(255,177,0,0.12)"
      style={{ transformOrigin: '40px 40px' }}
      animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </motion.svg>
)

const MedicalCardIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    <motion.rect x="10" y="18" width="60" height="44" rx="5"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    />
    <motion.line x1="40" y1="30" x2="40" y2="50"
      stroke="#e14760" strokeWidth="3" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    />
    <motion.line x1="30" y1="40" x2="50" y2="40"
      stroke="#e14760" strokeWidth="3" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    />
    <motion.path d="M14 58 L22 58 L26 52 L30 64 L34 56 L38 58 L66 58"
      stroke="url(#logo-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
    />
    {[0, 1].map((i) => (
      <motion.line key={i} x1="14" y1={24 + i * 5} x2={30 + i * 10} y2={24 + i * 5}
        stroke="rgba(250,136,22,0.3)" strokeWidth="1.2" strokeLinecap="round"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 1.2 + i * 0.1 }}
        style={{ transformOrigin: 'left center' }}
      />
    ))}
  </motion.svg>
)

const QrScanIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    {[
      { x: 8, y: 8, rx: 12, ry: 0, dx: 0, dy: 12 },
      { x: 72, y: 8, rx: -12, ry: 0, dx: 0, dy: 12 },
      { x: 8, y: 72, rx: 12, ry: 0, dx: 0, dy: -12 },
      { x: 72, y: 72, rx: -12, ry: 0, dx: 0, dy: -12 },
    ].map(({ x, y, rx, ry, dx, dy }, i) => (
      <motion.g key={i}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1, duration: 0.4 }}
      >
        <motion.line x1={x} y1={y} x2={x + rx} y2={y + ry}
          stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        />
        <motion.line x1={x} y1={y} x2={x + dx} y2={y + dy}
          stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: i * 0.15 + 0.1, duration: 0.4 }}
        />
      </motion.g>
    ))}
    {[
      [22,22],[22,30],[22,38],[30,22],[38,22],[38,30],[38,38],[30,38],
      [46,22],[46,30],[54,22],[58,30],[46,38],
      [22,46],[22,54],[30,46],[38,46],[30,54],[38,54],
      [46,46],[54,46],[58,46],[50,54],[58,54]
    ].map(([cx, cy], i) => (
      <motion.rect key={i} x={cx} y={cy} width="6" height="6" rx="1"
        fill="var(--accent)" fillOpacity="0.8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 + i * 0.02, duration: 0.2 }}
      />
    ))}
    <motion.line x1="12" y1="20" x2="68" y2="20"
      stroke="#e14760" strokeWidth="2"
      animate={{ y: [0, 40, 0], opacity: [0.8, 0.3, 0.8] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.svg>
)

const AntiSpamIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    <motion.rect x="28" y="10" width="24" height="34" rx="12"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1 }}
    />
    <motion.path d="M18 38 C18 52 62 52 62 38"
      stroke="url(#logo-grad)" strokeWidth="1.8" fill="none" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    />
    <motion.line x1="40" y1="52" x2="40" y2="66"
      stroke="url(#logo-grad)" strokeWidth="1.8" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.9, duration: 0.4 }}
    />
    <motion.line x1="28" y1="66" x2="52" y2="66"
      stroke="url(#logo-grad)" strokeWidth="1.8" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 1.1, duration: 0.4 }}
    />
    {/* Ban slash — amber, not red: this is spam-prevention, not a live emergency */}
    <motion.line x1="16" y1="16" x2="64" y2="64"
      stroke="#FFB100" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 1.3, duration: 0.5 }}
    />
    {[1, 2].map((_, i) => (
      <motion.path key={i} d={`M${22 - i * 6} 27 Q${22 - i * 6} 40 ${22 - i * 6} 53`}
        stroke="rgba(250,136,22,0.2)" strokeWidth="1.2" fill="none" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
        transition={{ delay: 1.5 + i * 0.3, duration: 1.8, repeat: Infinity }}
      />
    ))}
  </motion.svg>
)

const ComplianceIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    {[
      { x: 12, h: 20, y: 48 },
      { x: 24, h: 36, y: 32 },
      { x: 36, h: 28, y: 40 },
      { x: 48, h: 44, y: 24 },
      { x: 60, h: 16, y: 52 },
    ].map(({ x, h, y }, i) => (
      <motion.rect key={i} x={x} y={y} width="10" height={h} rx="2"
        stroke="url(#logo-grad)" strokeWidth="1.2" fill="rgba(250,136,22,0.06)"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
        style={{ transformOrigin: `${x + 5}px 68px` }}
      />
    ))}
    <motion.path d="M20 44 L32 56 L56 28"
      stroke="#FFB100" strokeWidth="3" fill="none"
      strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1, duration: 0.7 }}
    />
    <motion.line x1="8" y1="68" x2="72" y2="68"
      stroke="url(#logo-grad)" strokeWidth="1.2" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    />
  </motion.svg>
)

const LocationPingIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    {[1, 2].map((r) => (
      <motion.circle key={r} cx="40" cy="40" r={10 + r * 12}
        stroke="rgba(250,136,22,0.12)" strokeWidth="1" fill="none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: r * 0.5 }}
      />
    ))}
    <motion.path
      d="M40 12 C30 12 22 20 22 30 C22 44 40 60 40 60 C40 60 58 44 58 30 C58 20 50 12 40 12 Z"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1.2 }}
    />
    <motion.circle cx="40" cy="30" r="5"
      stroke="#FFB100" strokeWidth="2" fill="none"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.8, duration: 0.4 }}
    />
    <motion.circle cx="40" cy="30" r="14"
      stroke="rgba(255,177,0,0.3)" strokeWidth="1" fill="none"
      style={{ transformOrigin: '40px 30px' }}
      animate={{ scale: [0.35, 1, 0.35], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.svg>
)

const ScanBracketsIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    {[
      { x1: 8, y1: 24, x2: 8, y2: 8, x3: 24, y3: 8 },
      { x1: 72, y1: 24, x2: 72, y2: 8, x3: 56, y3: 8 },
      { x1: 8, y1: 56, x2: 8, y2: 72, x3: 24, y3: 72 },
      { x1: 72, y1: 56, x2: 72, y2: 72, x3: 56, y3: 72 },
    ].map(({ x1, y1, x2, y2, x3, y3 }, i) => (
      <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
        <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="url(#logo-grad)" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: i * 0.12, duration: 0.35 }}
        />
        <motion.line x1={x2} y1={y2} x2={x3} y2={y3}
          stroke="url(#logo-grad)" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: i * 0.12 + 0.12, duration: 0.35 }}
        />
      </motion.g>
    ))}
    {[28, 36, 44].map((x) =>
      [28, 36, 44].map((y) => (
        <motion.rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1"
          fill="var(--accent)" fillOpacity="0.75"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + (x + y) * 0.003, duration: 0.2 }}
        />
      ))
    )}
    <motion.line x1="10" y1="18" x2="70" y2="18"
      stroke="#e14760" strokeWidth="2" strokeLinecap="round"
      animate={{ y: [0, 44, 0], opacity: [0.8, 0.2, 0.8] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.svg>
)

const CameraSnapIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    <motion.rect x="8" y="24" width="64" height="44" rx="6"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1 }}
    />
    <motion.circle cx="40" cy="46" r="14"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    />
    <motion.circle cx="40" cy="46" r="7"
      stroke="#FFB100" strokeWidth="1.5" fill="rgba(255,177,0,0.1)"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.75, duration: 0.4 }}
    />
    <motion.circle cx="40" cy="46" r="14"
      fill="rgba(250,136,22,0.06)"
      animate={{ opacity: [0, 0.3, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
    />
    <motion.path d="M28 24 L28 18 C28 16 32 14 36 14 L44 14 C48 14 52 16 52 18 L52 24"
      stroke="url(#logo-grad)" strokeWidth="2" fill="none" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    />
    <motion.circle cx="62" cy="30" r="3"
      fill="#FFB100"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    {[[22, 34], [58, 34], [22, 58], [58, 58]].map(([cx, cy], i) => (
      <motion.circle key={i} cx={cx} cy={cy} r="1.5"
        fill="#FFB100"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1 + i * 0.1 }}
      />
    ))}
  </motion.svg>
)

const HazardAlertIcon = ({ size = 80 }: { size?: number }) => (
  <motion.svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e14760" />
        <stop offset="100%" stopColor="#fa8816" />
      </linearGradient>
    </defs>
    <motion.path d="M40 10 L72 66 L8 66 Z"
      stroke="url(#logo-grad)" strokeWidth="2.5" fill="none"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 1.2 }}
    />
    <motion.line x1="40" y1="34" x2="40" y2="52"
      stroke="#e14760" strokeWidth="3.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.8, duration: 0.4 }}
    />
    <motion.circle cx="40" cy="58" r="2.5"
      fill="#e14760"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 1.1, duration: 0.3 }}
    />
    <motion.path d="M40 4 L78 70 L2 70 Z"
      stroke="rgba(250,136,22,0.12)" strokeWidth="1" fill="none"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.svg>
)

// ─── Layout helpers ──────────────────────────────────────────────────────────

const FadeInSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const StaggerGrid = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  )
}

const StaggerItem = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 32 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
    }}
  >
    {children}
  </motion.div>
)

// Reusable "reflective sticker" texture — a nod to the physical product and to
// Indian highway retroreflective signage, used sparingly as a section accent.
const PlusTexture = ({ variant = 'top' }: { variant?: 'top' | 'bottom' | 'full' }) => {
  const mask =
    variant === 'top'
      ? { maskImage: 'radial-gradient(ellipse at 50% 0%, black 15%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 15%, transparent 75%)' }
      : variant === 'bottom'
      ? { maskImage: 'radial-gradient(ellipse at 50% 100%, black 15%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 100%, black 15%, transparent 75%)' }
      : {}
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none opacity-20 hidden dark:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8v3H8v2h3v3h2v-3h3v-2h-3V8h-2z' fill='rgba(255,255,255,0.45)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px',
          ...mask,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-10 block dark:hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8v3H8v2h3v3h2v-3h3v-2h-3V8h-2z' fill='rgba(9,9,11,0.45)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px',
          ...mask,
        }}
      />
    </>
  )
}

// Thin diagonal hazard-stripe rule — echoes reflective road signage.
// Used exactly twice on the page so it reads as a deliberate mark, not wallpaper.
const HazardRule = () => (
  <div
    className="h-[3px] w-full"
    style={{
      backgroundImage:
        'repeating-linear-gradient(-45deg, #fa8816 0px, #fa8816 10px, transparent 10px, transparent 20px)',
      opacity: 0.35,
    }}
  />
)

const IconCircle = ({ children, size = 72 }: { children: React.ReactNode; size?: number }) => (
  <div
    className="relative flex items-center justify-center rounded-full overflow-hidden border border-zinc-200 dark:border-brand/40 bg-zinc-100 dark:bg-gradient-to-br dark:from-[#e14760]/20 dark:to-[#fa8816]/5 shadow-md dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_4px_24px_rgba(0,0,0,0.6)] shrink-0"
    style={{ width: size, height: size }}
  >
    <div
      className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 2v3H2v2h3v3h2v-3h3v-2h-3V2h-2z' fill='rgb(250,136,22)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '12px 12px'
      }}
    />
    <div className="absolute inset-[4px] rounded-full z-0 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-brand/20 dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_inset_0_-1px_8px_rgba(0,0,0,0.8)]" />
    <div className="relative z-10 flex items-center justify-center text-brand" style={{ width: size * 0.44, height: size * 0.44 }}>
      {children}
    </div>
  </div>
)

// ─── Content data ────────────────────────────────────────────────────────────

const HERO_STATS = [
  { label: 'avg. alert dispatch after a collision scan', value: '< 2s' },
  { label: 'of calls stay number-masked, always', value: '100%' },
  { label: 'scans per vehicle — no prank fatigue', value: '2 / hr' },
]

const RESPONSE_STEPS = [
  {
    time: '0.0s',
    Icon: ScanIcon,
    title: 'Scan',
    desc: 'Anyone — a neighbor, a passerby, a paramedic — scans the windshield sticker with any phone camera. No app, no sign-up.',
  },
  {
    time: '~0.6s',
    Icon: Shield01Icon,
    title: 'Verify',
    desc: 'A quick camera-snap check and rate limit filter out prank scans before anything is dispatched to you.',
  },
  {
    time: '< 2s',
    Icon: ZapIcon,
    title: 'Connect or Alert',
    desc: 'Wrong-parking calls route through a masked Exotel bridge. Collisions trigger GPS coordinates to every emergency contact by WhatsApp and SMS.',
  },
]

const WHY_ITEMS = [
  {
    Icon: ShieldLockIcon,
    title: '100% Privacy Protection',
    desc: 'Your actual phone number is never printed on the vehicle. Bystanders reach you through an Exotel masked bridge — completely anonymous, both ways.',
    featured: true,
  },
  {
    Icon: SosAlertIcon,
    title: 'Sub-2s SOS Dispatch',
    desc: 'In a serious collision, bystanders scan once to send your GPS position and crash details to your full emergency contact list.',
    featured: true,
  },
  {
    Icon: MedicalCardIcon,
    title: 'Critical Medical Access',
    desc: 'Optionally surface blood group and drug allergies to first responders the instant they scan, during the Golden Hour.',
  },
  {
    Icon: QrScanIcon,
    title: 'No App Installs Required',
    desc: 'Bystanders scan and call or alert your family from a standard browser — zero downloads on their end.',
  },
  {
    Icon: AntiSpamIcon,
    title: 'Anti-Spam Verification',
    desc: 'Mandatory camera-snap verification and rate limits keep prank calls and alert fatigue out of your emergency network.',
  },
  {
    Icon: ComplianceIcon,
    title: 'DPDP Act Compliant',
    desc: "Aligned with India's Digital Personal Data Protection Act, 2023. You decide what's visible on scan, and when.",
  },
]

const SOLUTIONS = [
  {
    Icon: ScanIcon,
    title: 'Basic Windshield QR Sticker',
    desc: 'A weatherproof, high-contrast QR tag. Connects bystanders anonymously for wrong-parking calls and notifies one emergency contact. Built for a single commuter.',
  },
  {
    Icon: Shield01Icon,
    title: 'Shield Reflective Tag',
    desc: 'Premium retroreflective film, visible at night under headlight beams. Adds Exotel call masking, multi-contact WhatsApp SOS alerts, and the medical card.',
  },
  {
    Icon: UserGroupIcon,
    title: 'Family Pro Bundle',
    desc: 'Register up to three vehicles on one subscription, with a shared family safety portal and a synchronized emergency contact list.',
  },
  {
    Icon: TruckIcon,
    title: 'Enterprise Fleet Safety',
    desc: 'Built for logistics providers and cab networks. A supervisor panel to monitor roadside incidents and driver emergency profiles at scale.',
  },
]

const WORKS = [
  {
    Icon: LocationPingIcon,
    title: 'Wrong Parking Resolution',
    desc: 'A neighbor blocked by your car scans the windshield QR and places a masked call. Exotel bridges the connection anonymously — the space clears in minutes, your number stays private.',
    category: 'Roadside · Everyday',
    date: 'June 2025',
  },
  {
    Icon: ScanBracketsIcon,
    title: 'Highway Collision Alerting',
    desc: 'A first responder scans the reflective sticker on a crashed vehicle. Coordinates are recorded automatically and a high-priority WhatsApp SOS reaches family within seconds.',
    category: 'Emergency · Highway',
    date: 'May 2025',
  },
  {
    Icon: CameraSnapIcon,
    title: 'Paramedic First Response',
    desc: 'During the Golden Hour, paramedics scan the sticker to retrieve blood group and medical history immediately, before the ambulance even arrives.',
    category: 'Emergency · Medical',
    date: 'April 2025',
  },
  {
    Icon: HazardAlertIcon,
    title: 'Vehicle Security Hazard',
    desc: 'A bystander notices smoke, or a window left open. Tapping "Vehicle Hazard" places an anonymous call to notify you — without ever exposing your number.',
    category: 'Roadside · Security',
    date: 'March 2025',
  },
]

const TESTIMONIALS = [
  {
    text: 'A stranger had parked blocking my gate. Normally that\u2019s an hour of waiting around. This time I called them anonymously through the QR on their windshield, and the car moved in five minutes.',
    name: 'Rohan Mehta',
    role: 'Delhi NCR Driver',
    initials: 'RM',
    color: 'bg-zinc-700',
  },
  {
    text: 'As a solo female traveler, privacy matters more to me than almost anything else. This lets people flag wrong parking without my number ever being on the window.',
    name: 'Shalini Iyer',
    role: 'Bengaluru Commuter',
    initials: 'SI',
    color: 'bg-zinc-600',
  },
  {
    text: 'I was in an accident on the highway last month. Paramedics scanned my tag, saw my emergency contacts, and my family had GPS details before I\u2019d even reached the hospital.',
    name: 'Amit Sharma',
    role: 'Mumbai Commuter',
    initials: 'AS',
    color: 'bg-zinc-800',
  },
]

const PARTNERS = [
  { name: 'Exotel API', title: 'Masked Calling Bridge', desc: 'Secures anonymous, prank-resistant voice calls between bystanders and vehicle owners.', Icon: Call02Icon },
  { name: 'AiSensy API', title: 'WhatsApp SOS Broadcast', desc: 'Dispatches high-priority WhatsApp alerts with a live map link in under two seconds.', Icon: Message01Icon },
  { name: 'DPDP Act 2023', title: 'Compliance Shield', desc: "Data collection is structured to match India's personal data protection guidelines.", Icon: Shield01Icon },
  { name: 'Fast2SMS API', title: 'Fallback SMS Alerts', desc: 'Sends an instant SMS fallback whenever WhatsApp delivery can\u2019t be confirmed.', Icon: SentIcon },
  { name: 'Razorpay', title: 'Secure Payment Gateway', desc: 'Handles subscriptions and sticker kit orders with PCI-DSS compliant processing.', Icon: CreditCardIcon },
  { name: 'Google Maps API', title: 'Real-Time GPS Location', desc: 'Embeds live coordinates into every SOS message for accurate incident location.', Icon: MapPinpoint01Icon },
]

const faqs = [
  {
    id: 'faq-1', col: 0,
    q: 'How does masked calling work? Can someone see my number?',
    a: 'No. When a bystander scans your QR sticker and taps "Wrong Parking," the system uses our Exotel telephony bridge. It dials your number and the scanner\'s number simultaneously and connects the call anonymously. Neither party sees the other\'s actual mobile number.',
  },
  {
    id: 'faq-2', col: 1,
    q: 'Do I need to install an app to receive emergency alerts?',
    a: 'No. Alerts are sent via WhatsApp and SMS directly to your registered emergency contacts\' phones. The scanning bystander only needs a standard browser — nothing to install on either side.',
  },
  {
    id: 'faq-3', col: 0,
    q: 'What prevents people from sending prank emergency alerts?',
    a: 'Three layers: mandatory browser camera-snap verification, backend rate-limiting (max 2 scans/hour per vehicle), and prominent legal disclaimers about misuse of emergency services.',
  },
  {
    id: 'faq-4', col: 1,
    q: 'Can I temporarily disable alerts when leaving my car at a service center?',
    a: 'Yes. Toggle "Pause Alerts" from your dashboard. This blocks bystander scans from triggering calls or WhatsApp SOS dispatches, so you don\u2019t get false-alarm fatigue.',
  },
  {
    id: 'faq-5', col: 0,
    q: 'Why do you ask for blood group and medical notes?',
    a: 'In a collision, first responders need to act fast. These optional fields appear instantly on scan, saving critical time for transfusions or avoiding a severe drug allergy during the Golden Hour.',
  },
  {
    id: 'faq-6', col: 1,
    q: 'How do you comply with India\'s DPDP Act 2023?',
    a: 'You control exactly what data is visible on scan — phone, medical, contact list. Data is encrypted at rest and in transit, and you can delete or update it any time from your dashboard.',
  },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  // Parallax scroll motion values
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], [0, 120])
  const heroTextY = useTransform(scrollY, [0, 800], [0, -30])
  const heroMascotY = useTransform(scrollY, [0, 800], [0, -60])

  const leftFaqs = faqs.filter((f) => f.col === 0)
  const rightFaqs = faqs.filter((f) => f.col === 1)

  return (
    <div className="w-full bg-background text-foreground transition-colors duration-300 overflow-x-hidden">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative w-full bg-zinc-100 dark:bg-[#0c0c0e] transition-colors duration-300 overflow-hidden">

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-3px)]">

          {/* LEFT: Copy & CTAs */}
          <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-24 lg:py-20 relative">
            <PlusTexture variant="top" />

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ y: heroTextY }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-lg space-y-7 lg:ml-auto lg:mr-12 xl:mr-16"
            >
              <motion.h1
                className="text-[2.5rem] sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-black tracking-tight text-zinc-900 dark:text-white leading-[1.08] font-display"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
              >
                Your number stays hidden.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa8816] to-[#e14760]">
                  Your emergency contacts
                </span>
                <br />
                don&apos;t.
              </motion.h1>

              <motion.p
                className="text-[13px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                A windshield QR sticker lets anyone reach you about wrong parking — anonymously — and
                automatically alerts your emergency contacts with your exact location if you&apos;re ever
                in a collision.
              </motion.p>

              <motion.p
                className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 tracking-wide pt-1 font-mono uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
              >
                No app for bystanders · No number ever shown
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="h-10 px-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold transition-all cursor-pointer text-xs tracking-wide flex items-center justify-center border border-zinc-900 dark:border-zinc-300"
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate('/how-it-works')}
                  className="h-10 px-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white dark:border-zinc-700 font-bold transition-all cursor-pointer text-xs tracking-wide flex items-center justify-center gap-2"
                >
                  See How It Works <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Vertical Divider */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] hidden lg:block z-20 overflow-hidden">
            <motion.div
              className="w-full h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </div>

          {/* RIGHT: Mascot + live telemetry chips + Golden Hour Meter */}
          <motion.div
            className="flex items-center justify-center relative py-16 lg:py-0 min-h-[460px] lg:min-h-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ y: heroMascotY }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div 
              style={{ y: bgY }}
              className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[150px] pointer-events-none" 
            />

            <div className="relative z-10 flex flex-col items-center select-none">

              {/* Main Logo resting on shelf */}
              <img
                src={vaahanLogo}
                alt="VaahanSafe Logo"
                className="w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] lg:w-[210px] lg:h-[210px] drop-shadow-[0_15px_30px_rgba(250,136,22,0.15)] relative z-10"
              />

              {/* Glowing shelf/floor front edge */}
              <div className="w-[200px] sm:w-[240px] lg:w-[260px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2 relative z-20 shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />

              {/* Flipped floor reflection matching the footer VAAHANSAFE text reflection */}
              <div
                className="absolute top-[80%] opacity-20 pointer-events-none scale-y-[-0.8] blur-[1px] z-10"
                style={{
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 60%)',
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 60%)',
                }}
              >
                <img
                  src={vaahanLogo}
                  alt="VaahanSafe Logo Reflection"
                  className="w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] lg:w-[210px] lg:h-[210px]"
                />
              </div>


            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════ STAT STRIP ══════════════════ */}
      <section className="relative bg-zinc-50 dark:bg-[#0a0a0c] border-t border-zinc-200 dark:border-zinc-900">
        <HazardRule />
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-10">
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-900">
            {HERO_STATS.map((s) => (
              <StaggerItem key={s.label} className="flex flex-col items-center text-center px-4 pt-6 sm:pt-0 first:pt-0">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white font-display">{s.value}</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-2 max-w-[220px] leading-relaxed">{s.label}</span>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ HOW IT RESPONDS (Golden Hour timeline) ══════════════════ */}
      <section className="relative py-28 border-t border-zinc-200 dark:border-zinc-900 bg-background overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-16">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
            <FadeInSection className="space-y-4 max-w-xl">
              <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-mono">The Golden Hour</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
                How VaahanSafe responds
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
                Every scan moves through the same three steps, timed against the minutes that matter most
                after a collision.
              </p>
            </FadeInSection>

            <FadeInSection className="hidden lg:flex justify-center">
              <GoldenHourMeter size={200} />
            </FadeInSection>
          </div>

          <StaggerGrid className="relative">
            {/* Connecting gradient line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-[#fa8816] via-[#f2603f] to-[#e14760] opacity-30" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {RESPONSE_STEPS.map(({ time, Icon, title, desc }, i) => (
                <StaggerItem key={title} className="relative flex flex-col items-center text-center space-y-4">
                  <div className="relative z-10 w-16 h-16 rounded-full bg-white dark:bg-[#0c0c0e] border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-md">
                    <HugeiconsIcon icon={Icon} className="w-6 h-6 text-brand" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 font-mono tracking-widest">
                    STEP {i + 1} · {time}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">{desc}</p>
                </StaggerItem>
              ))}
            </div>
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ WHY CHOOSE US (bento) ══════════════════ */}
      <section className="relative py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#0a0a0c] overflow-hidden">
        <div className="max-w-[1250px] mx-auto px-6 lg:px-12 space-y-14">

          <FadeInSection className="text-center max-w-3xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight font-display">
              Reasons to choose VaahanSafe for <br />
              <span className="text-zinc-500 font-sans font-medium">your safety journey</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed max-w-2xl mx-auto">
              Secure telephony, instant alert broadcasting, and smart physical hardware, tuned for how
              India actually drives.
            </p>
          </FadeInSection>

          {/* Featured pair */}
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WHY_ITEMS.filter((i) => i.featured).map(({ Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-md">
                  <IconCircle size={84}>
                    <Icon size={38} />
                  </IconCircle>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-wide">{title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>

          {/* Remaining grid */}
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_ITEMS.filter((i) => !i.featured).map(({ Icon, title, desc }) => (
              <StaggerItem key={title} className="rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
                <IconCircle size={60}>
                  <Icon size={26} />
                </IconCircle>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white tracking-wide">{title}</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ OUR SOLUTIONS ══════════════════ */}
      <section className="relative py-28 border-t border-zinc-200 dark:border-zinc-900 bg-background overflow-hidden">
        {/* V-Shape Star Parallax Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          
          {/* Star pattern background inside V-Shape */}
          <div 
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.09]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          >
            <motion.div
              style={{ 
                y: bgY,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 10 L21.5 18.5 L28 20 L21.5 21.5 L20 30 L18.5 21.5 L12 20 L18.5 18.5 Z' fill='rgb(250,136,22)' fill-opacity='0.8'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px',
                height: '150%',
              }}
              className="absolute inset-0"
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-16 relative z-10">

          <FadeInSection className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-mono">Our Services</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
              Our safety offerings
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Retroreflective vehicle stickers, integrated directly with a secure communication portal,
              for any roadside situation.
            </p>
          </FadeInSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SOLUTIONS.map(({ Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="group rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 relative overflow-hidden flex flex-col items-center text-center p-10 space-y-5 h-full hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-300 shadow-md">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center top, rgba(250,136,22,0.05) 0%, transparent 75%)' }}
                  />
                  <div className="relative z-10 w-14 h-14 rounded-lg border border-brand/20 dark:border-brand/40 bg-zinc-50 dark:bg-[#0c0c0e] flex items-center justify-center text-brand shadow-sm group-hover:border-brand/40 transition-colors">
                    <HugeiconsIcon icon={Icon} className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-display">{title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans max-w-sm mx-auto">{desc}</p>
                  </div>
                  <button className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 bg-zinc-100/60 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:text-white dark:hover:border-zinc-700 transition-all cursor-pointer">
                    Learn More <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ OUR WORKS ══════════════════ */}
      <section className="relative py-28 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#0a0a0c] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-16">

          <FadeInSection className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-mono">Ecosystem in Action</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
              Our works
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Real roadside scenarios handled by the VaahanSafe secure alert framework.
            </p>
          </FadeInSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WORKS.map(({ Icon, title, desc, category, date }) => (
              <StaggerItem key={title}>
                <div className="group rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-5 flex flex-col space-y-5 hover:border-zinc-300 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-[#0f0f13] transition-all duration-300 shadow-lg">
                  <div className="relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-900/80 flex flex-col justify-center items-center h-56 select-none">
                    <PlusTexture variant="top" />
                    <div className="relative z-10 flex items-center justify-center">
                      <Icon size={64} />
                    </div>
                  </div>
                  <div className="space-y-3 px-1 text-left">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide">{title}</h3>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{category}</span>
                      <span>{date}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="relative py-28 border-t border-zinc-200 dark:border-zinc-900 bg-background overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-16">

          <FadeInSection className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-mono">Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
              What drivers say
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Vehicle owners, commuters, and solo travelers across Indian cities on privacy and emergency
              protection.
            </p>
          </FadeInSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ text, name, role, initials, color }) => (
              <StaggerItem key={name}>
                <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/30 flex flex-col justify-between space-y-6 h-full transition-all">
                  <HugeiconsIcon icon={QuoteDownIcon} className="w-6 h-6 text-brand/50" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans flex-grow">
                    {text}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${color} border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-white text-[10px]`}>
                      {initials}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">{name}</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-600 font-medium">{role}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="relative py-28 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#0a0a0c] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-16">

          <FadeInSection className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-mono">Support</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
              Frequently asked <span className="text-zinc-500 dark:text-zinc-400">questions</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Everything you need to know about vehicle privacy, masked calling, and emergency dispatch.
            </p>
          </FadeInSection>

          <FadeInSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <div className="space-y-4">
                {leftFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-3 min-h-[72px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 rounded-lg"
                    >
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">{faq.q}</span>
                      <motion.svg
                        animate={{ rotate: openFaq === faq.id ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </motion.svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans px-5 pb-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {rightFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-3 min-h-[72px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 rounded-lg"
                    >
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">{faq.q}</span>
                      <motion.svg
                        animate={{ rotate: openFaq === faq.id ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </motion.svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans px-5 pb-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════ PARTNERS & CLIENTS ══════════════════ */}
      <section className="relative py-28 border-t border-zinc-200 dark:border-zinc-900 bg-background overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-16">

          <FadeInSection className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase font-mono">Ecosystem</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
              Built on trusted infrastructure
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Industry-leading APIs for telecommunication, rapid broadcasting, and compliant data hosting.
            </p>
          </FadeInSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PARTNERS.map(({ name, title, desc, Icon }) => (
              <StaggerItem key={name}>
                <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 flex flex-col justify-between min-h-[140px] transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">{name}</span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-all">
                      <HugeiconsIcon icon={Icon} className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ══════════════════ CTA SECTION ══════════════════ */}
      <section className="relative py-32 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#08080a] text-center overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none opacity-20 hidden dark:block"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 pointer-events-none opacity-10 block dark:hidden"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Faint Golden Hour Meter watermark — bookends the hero motif */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-[0.06] pointer-events-none hidden sm:block">
          <GoldenHourMeter size={420} />
        </div>

        <HazardRule />

        <FadeInSection className="relative z-10 space-y-10 max-w-xl px-6 flex flex-col items-center pt-16">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-[0.2em] uppercase font-mono">
            Ready to secure your vehicle?
          </p>

          <div className="relative select-none pb-2 flex flex-col items-center">
            <motion.h1
              className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-300 dark:to-zinc-700 uppercase font-display leading-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              VAAHANSAFE
            </motion.h1>
            <div
              className="absolute top-[80%] opacity-15 pointer-events-none scale-y-[-0.8] blur-[0.5px]"
              style={{
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 60%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 60%)',
              }}
            >
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-300 dark:to-zinc-700 uppercase font-display leading-none">
                VAAHANSAFE
              </h1>
            </div>
          </div>

          <motion.p
            className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed max-w-md pt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Create an owner account, add your emergency contacts, register your license plate, and get
            your windshield sticker on the way.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => navigate('/dashboard')}
              className="h-10 px-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold transition-all cursor-pointer text-xs tracking-wide flex items-center justify-center border border-zinc-900 dark:border-zinc-300"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate('/how-it-works')}
              className="h-10 px-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white dark:border-zinc-700 font-bold transition-all cursor-pointer text-xs tracking-wide flex items-center justify-center gap-2"
            >
              See How It Works <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        </FadeInSection>
      </section>

    </div>
  )
}