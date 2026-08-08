import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  UserGroupIcon,
  Car01Icon,
  LockIcon,
  AlertCircleIcon,
  DashboardCircleIcon,
  Settings01Icon,
  QrCodeIcon,
  CreditCardIcon,
  Key01Icon,
  Notification01Icon
} from '@hugeicons/core-free-icons'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import AmbientBackground from '@/components/shared/AmbientBackground'
import { useAuthStore } from '@/store/authStore'

// Floating message flags that hover above the car
const FLAG_MESSAGES = [
  { text: 'Vehicle Protected' },
  { text: 'Scan Your Vehicle' },
  { text: 'Check RC Status' },
  { text: 'Anti-Theft Active' },
  { text: 'GPS Tracking On' },
  { text: 'Route Not Found!' },
  { text: 'Drive Safe Today' },
  { text: 'Alert System Active' },
]

export const NotFound: React.FC = () => {
  const [carProgress, setCarProgress] = useState(0)
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0)
  const [flagVisible, setFlagVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { role } = useAuthStore()
  const isOperator = role === 'operator'


  // Animate the car along the road path
  useEffect(() => {
    let animId: number
    let start: number | null = null
    const duration = 8000 // 8 seconds for one loop

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = (elapsed % duration) / duration
      setCarProgress(progress)
      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Cycle through flag messages — one at a time, following the car
  useEffect(() => {
    const interval = setInterval(() => {
      // Brief fade out
      setFlagVisible(false)
      setTimeout(() => {
        setCurrentFlagIndex(prev => (prev + 1) % FLAG_MESSAGES.length)
        setFlagVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Road S-curve path
  const roadPath = 'M -80 150 C 100 20, 300 200, 550 90 C 800 -20, 900 210, 1280 110'

  // Bezier path evaluator for 2-segment S-curve
  const getPointOnPath = useMemo(() => (t: number) => {
    let x: number, y: number, dx: number, dy: number

    if (t < 0.5) {
      const st = t * 2
      const mt = 1 - st
      x = mt*mt*mt*(-80) + 3*mt*mt*st*100 + 3*mt*st*st*300 + st*st*st*550
      y = mt*mt*mt*150 + 3*mt*mt*st*20 + 3*mt*st*st*200 + st*st*st*90
      dx = 3*mt*mt*(100-(-80)) + 6*mt*st*(300-100) + 3*st*st*(550-300)
      dy = 3*mt*mt*(20-150) + 6*mt*st*(200-20) + 3*st*st*(90-200)
    } else {
      const st = (t - 0.5) * 2
      const mt = 1 - st
      x = mt*mt*mt*550 + 3*mt*mt*st*800 + 3*mt*st*st*900 + st*st*st*1280
      y = mt*mt*mt*90 + 3*mt*mt*st*(-20) + 3*mt*st*st*210 + st*st*st*110
      dx = 3*mt*mt*(800-550) + 6*mt*st*(900-800) + 3*st*st*(1280-900)
      dy = 3*mt*mt*((-20)-90) + 6*mt*st*(210-(-20)) + 3*st*st*(110-210)
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    return { x, y, angle }
  }, [])

  const carPos = getPointOnPath(carProgress)

  // Generate barrier posts along the path
  const barrierPosts = useMemo(() => {
    const posts = []
    for (let i = 0; i <= 28; i++) {
      const t = i / 28
      const point = getPointOnPath(t)
      const tanAngleRad = point.angle * (Math.PI / 180)
      const normalX = -Math.sin(tanAngleRad)
      const normalY = Math.cos(tanAngleRad)
      const offset = 56
      posts.push({
        topX: point.x + normalX * offset,
        topY: point.y + normalY * offset,
        bottomX: point.x - normalX * offset,
        bottomY: point.y - normalY * offset,
      })
    }
    return posts
  }, [getPointOnPath])

  // Detect dark mode for SVG hardcoded colors
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Theme-aware SVG colors
  const svgColors = isDark
    ? {
        shoulderShadow: '#0d0d0d',
        shoulder: '#1a1a1a',
        edgeTrim: '#333',
        roadSurface: ['#1f1f1f', '#181818', '#141414'],
        roadHighlight: 0.015,
        edgeLine: '#555',
        edgeLineGlow: 'rgba(255,255,255,0.08)',
        carBody: ['#374151', '#1f2937', '#111827'],
        carRoof: ['#1f2937', '#0f172a'],
        carStroke: '#4b5563',
        carHighlight: '#6b7280',
        wheelOuter: '#0a0a0a',
        wheelInner: '#1a1a1a',
        wheelHub: '#333',
        wheelCenter: '#555',
        wheelSpoke: '#444',
        wheelStroke: '#333',
        wheelArch: '#374151',
        doorLine: '#374151',
        flagBg: '#0a0a0a',
        flagText: '#e5e5e5',
        flagPole: '#f97316',
        shadow: 'rgba(0,0,0,0.5)',
      }
    : {
        shoulderShadow: '#d1d5db',
        shoulder: '#e5e7eb',
        edgeTrim: '#9ca3af',
        roadSurface: ['#d4d4d4', '#c4c4c4', '#b8b8b8'],
        roadHighlight: 0.05,
        edgeLine: '#9ca3af',
        edgeLineGlow: 'rgba(0,0,0,0.06)',
        carBody: ['#6b7280', '#4b5563', '#374151'],
        carRoof: ['#4b5563', '#374151'],
        carStroke: '#9ca3af',
        carHighlight: '#9ca3af',
        wheelOuter: '#1f2937',
        wheelInner: '#374151',
        wheelHub: '#4b5563',
        wheelCenter: '#6b7280',
        wheelSpoke: '#6b7280',
        wheelStroke: '#4b5563',
        wheelArch: '#6b7280',
        doorLine: '#6b7280',
        flagBg: '#ffffff',
        flagText: '#1f2937',
        flagPole: '#ea580c',
        shadow: 'rgba(0,0,0,0.15)',
      }

  return (
    <div className="relative h-screen w-full bg-neutral-50 dark:bg-[#050507] text-neutral-900 dark:text-white flex flex-col items-center justify-between select-none font-sans text-center"
      style={{ maxHeight: '100vh' }}
    >
      
      {/* Reusable Multi-Layer Glowing Ambient Background */}
      <AmbientBackground />

      {/* ─── Header ─── */}
      <div className="w-full max-w-2xl px-6 space-y-3 z-10 pt-8 md:pt-12 flex-shrink-0">
       

        {/* 404 with glitch layers */}
        <div className="relative">
          <h1
            aria-hidden="true"
            className="absolute inset-0 text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none text-orange-500/10 select-none"
            style={{ transform: 'translate(-3px, -2px)' }}
          >
            404
          </h1>
          <h1
            aria-hidden="true"
            className="absolute inset-0 text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none text-cyan-500/[0.06] select-none"
            style={{ transform: 'translate(3px, 2px)' }}
          >
            404
          </h1>
          <h1 className="relative text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none bg-gradient-to-b from-neutral-700 via-neutral-500 to-neutral-300 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        <h2 className="text-lg md:text-xl font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-[0.15em] -mt-2">
          Road Closed Ahead
        </h2>
        <p className="text-neutral-400 dark:text-neutral-500 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
          The safety scanner couldn't locate this route. Your vehicle has been rerouted to a closed highway detour.
        </p>

        {/* Dynamic Command Search Box with suggestions */}
        <div className="w-full max-w-xs mx-auto mt-5 px-4 relative z-20">
          <Command className="border-0 bg-transparent rounded-lg text-left overflow-visible relative [&_[data-slot=command-input-wrapper]_div]:bg-white/10 dark:[&_[data-slot=command-input-wrapper]_div]:bg-neutral-900/80 [&_[data-slot=command-input-wrapper]_div]:backdrop-blur-md [&_[data-slot=command-input-wrapper]_div]:border [&_[data-slot=command-input-wrapper]_div]:border-neutral-200/50 dark:[&_[data-slot=command-input-wrapper]_div]:border-neutral-800/80">
            <CommandInput
              placeholder="Search VaahanSafe..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {searchQuery.trim().length > 0 && (
              <CommandList className="absolute top-full left-0 right-0 mt-1.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-[#0c0c0f]/95 backdrop-blur-md overflow-y-auto rounded-lg shadow-xl z-50 max-h-[200px]">
                <CommandEmpty className="py-4 text-center text-xs text-neutral-400">
                  No matching sections found.
                </CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {isOperator ? (
                    <>
                      <CommandItem
                        value="admin owners list verification status"
                        onSelect={() => window.location.href = '/admin/owners'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={UserGroupIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Admin: Vehicle Owners Directory</span>
                      </CommandItem>
                      <CommandItem
                        value="admin vehicles status override subscription status"
                        onSelect={() => window.location.href = '/admin/vehicles'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={Car01Icon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Admin: Vehicle Fleet Registry</span>
                      </CommandItem>
                      <CommandItem
                        value="admin audit log security action logging"
                        onSelect={() => window.location.href = '/admin/audit-log'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={LockIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Admin: Compliance Security Audit Logs</span>
                      </CommandItem>
                      <CommandItem
                        value="admin alert failures outbound dispatch retry calls sms"
                        onSelect={() => window.location.href = '/admin/alert-failures'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Admin: Dispatch Failures Dashboard</span>
                      </CommandItem>
                      <CommandItem
                        value="admin dead letter queue celery redis retry task"
                        onSelect={() => window.location.href = '/admin/dead-letter'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={DashboardCircleIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Admin: Celery Dead Letter Queue</span>
                      </CommandItem>
                      <CommandItem
                        value="admin abuse reports nightly risk scanning geofencing threat"
                        onSelect={() => window.location.href = '/admin/abuse-reports'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={LockIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Admin: AI Abuse Nightly Reports</span>
                      </CommandItem>
                    </>
                  ) : (
                    <>
                      <CommandItem
                        value="dashboard cockpit home central controller"
                        onSelect={() => window.location.href = '/dashboard'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={DashboardCircleIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Dashboard: Central Cockpit</span>
                      </CommandItem>
                      <CommandItem
                        value="dashboard vehicles my fleet linked subscription status activation"
                        onSelect={() => window.location.href = '/dashboard/vehicles'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={Car01Icon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Vehicles: My Fleet details</span>
                      </CommandItem>
                      <CommandItem
                        value="register qr code sticker activation pairing qr-sticker"
                        onSelect={() => window.location.href = '/dashboard/vehicles/register'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={QrCodeIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Vehicles: Register QR Sticker</span>
                      </CommandItem>
                      <CommandItem
                        value="billing plans subscription invoices receipts packages pricing"
                        onSelect={() => window.location.href = '/dashboard/billing'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={CreditCardIcon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Billing: Plans & Invoices</span>
                      </CommandItem>
                      <CommandItem
                        value="dashboard profile settings account user contact phone mail details"
                        onSelect={() => window.location.href = '/dashboard/profile'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={Settings01Icon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Settings: Profile details</span>
                      </CommandItem>
                      <CommandItem
                        value="dashboard security 2fa hardware security passkey authentication keys"
                        onSelect={() => window.location.href = '/dashboard/security'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={Key01Icon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Settings: Security Passkeys</span>
                      </CommandItem>
                      <CommandItem
                        value="dashboard notifications channels sms whatsapp alert settings routing"
                        onSelect={() => window.location.href = '/dashboard/notifications'}
                        className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                      >
                        <HugeiconsIcon icon={Notification01Icon} className="size-3.5 text-orange-500 shrink-0" />
                        <span>Settings: Routing Notifications</span>
                      </CommandItem>
                    </>
                  )}
                  {/* Public action available for both roles */}
                  <CommandItem
                    value="wrong parking sticker qr scanning emergency dispatch check in wrong-parking report"
                    onSelect={() => window.location.href = '/wrong-parking'}
                    className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 gap-2 flex items-center"
                  >
                    <HugeiconsIcon icon={QrCodeIcon} className="size-3.5 text-orange-500 shrink-0" />
                    <span>Parking: QR Code Scan Portal</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </div>
      </div>

      <div className={`relative w-full flex-1 min-h-0 flex items-center justify-center select-none overflow-visible transition-all duration-300 ${
        searchQuery.trim().length > 0 ? 'opacity-35 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}>

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 240"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Road surface gradient */}
            <linearGradient id="roadSurface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svgColors.roadSurface[0]} />
              <stop offset="50%" stopColor={svgColors.roadSurface[1]} />
              <stop offset="100%" stopColor={svgColors.roadSurface[2]} />
            </linearGradient>
            {/* Barrier stripe pattern */}
            <pattern id="barrierStripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="3" height="6" fill="#dc2626" />
              <rect x="3" width="3" height="6" fill="#fafafa" />
            </pattern>
            {/* Headlight beam gradient */}
            <radialGradient id="headlightBeam" cx="0.3" cy="0.5" r="0.7">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            {/* Car body gradient */}
            <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svgColors.carBody[0]} />
              <stop offset="40%" stopColor={svgColors.carBody[1]} />
              <stop offset="100%" stopColor={svgColors.carBody[2]} />
            </linearGradient>
            {/* Car roof gradient */}
            <linearGradient id="carRoofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svgColors.carRoof[0]} />
              <stop offset="100%" stopColor={svgColors.carRoof[1]} />
            </linearGradient>
            {/* Windshield reflection */}
            <linearGradient id="windshieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.5" />
            </linearGradient>
            {/* Logo gradient for car */}
            <linearGradient id="carLogoGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#e14760" />
              <stop offset="100%" stopColor="#fa8816" />
            </linearGradient>
          </defs>

          {/* ── Road Layers ── */}
          <path d={roadPath} stroke={svgColors.shoulderShadow} strokeWidth="115" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke={svgColors.shoulder} strokeWidth="108" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke={svgColors.edgeTrim} strokeWidth="100" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke="url(#roadSurface)" strokeWidth="96" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke="#ffffff" strokeWidth="96" fill="none" strokeLinecap="round" opacity={svgColors.roadHighlight} />
          {/* Edge lines */}
          <path
            d={roadPath}
            stroke={svgColors.edgeLine}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${svgColors.edgeLineGlow})` }}
          />
          {/* Center yellow dashed line */}
          <path
            d={roadPath}
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="18 26"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.35))' }}
          />

          {/* ── Traffic Barrier Posts ── */}
          {barrierPosts.map((post, i) => (
            <g key={`barrier-${i}`}>
              <rect x={post.topX - 2.5} y={post.topY - 7} width="5" height="14" rx="1.2" fill="url(#barrierStripe)" opacity="0.65" />
              <circle cx={post.topX} cy={post.topY - 3} r="1.2" fill="#fbbf24" opacity="0.85" />
              <rect x={post.bottomX - 2.5} y={post.bottomY - 7} width="5" height="14" rx="1.2" fill="url(#barrierStripe)" opacity="0.65" />
              <circle cx={post.bottomX} cy={post.bottomY - 3} r="1.2" fill="#fbbf24" opacity="0.85" />
            </g>
          ))}

          {/* ── Animated Car ── */}
          <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}>
            {/* Ground shadow */}
            <ellipse cx="0" cy="14" rx="30" ry="6" fill={svgColors.shadow} />
            
            {/* Headlight beam cone */}
            <ellipse cx="42" cy="0" rx="28" ry="14" fill="url(#headlightBeam)" />

            {/* Car Body */}
            <path
              d="M-30,-4 Q-30,-12 -24,-12 L24,-12 Q30,-12 30,-4 L30,8 Q30,12 26,12 L-26,12 Q-30,12 -30,8 Z"
              fill="url(#carBodyGrad)"
              stroke={svgColors.carStroke}
              strokeWidth="0.6"
            />
            <path d="M-28,-4 L28,-4" stroke={svgColors.carHighlight} strokeWidth="0.4" opacity="0.5" />

            {/* Roof */}
            <path
              d="M-12,-12 L-6,-24 Q-4,-26 0,-26 L10,-26 Q14,-26 16,-24 L22,-12"
              fill="url(#carRoofGrad)"
              stroke={svgColors.carStroke}
              strokeWidth="0.5"
            />

            {/* Windows */}
            <path d="M14,-12 L18,-23 Q19,-25 16,-25 L12,-25 L14,-12 Z" fill="url(#windshieldGrad)" />
            <path d="M-10,-12 L-5,-23 Q-4,-25 -2,-25 L2,-25 L-6,-12 Z" fill="url(#windshieldGrad)" opacity="0.7" />
            <path d="M-4,-12 L-2,-23 Q-1,-24.5 2,-24.5 L10,-24.5 Q12,-24.5 13,-23 L13,-12 Z" fill="url(#windshieldGrad)" opacity="0.5" />
            <line x1="5" y1="-12" x2="6" y2="-24" stroke={svgColors.doorLine} strokeWidth="1.2" />
            <line x1="2" y1="-11" x2="2" y2="10" stroke={svgColors.doorLine} strokeWidth="0.5" opacity="0.6" />
            <rect x="4" y="-2" width="5" height="1.5" rx="0.75" fill={svgColors.carHighlight} opacity="0.7" />

            {/* Headlights */}
            <rect x="28" y="-9" width="4" height="5" rx="1.5" fill="#fde68a">
              <animate attributeName="opacity" values="0.85;1;0.85" dur="1.5s" repeatCount="indefinite" />
            </rect>
            <rect x="28" y="4" width="4" height="5" rx="1.5" fill="#fde68a">
              <animate attributeName="opacity" values="0.85;1;0.85" dur="1.5s" repeatCount="indefinite" />
            </rect>
            <rect x="29" y="-8" width="2" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="29" y="5" width="2" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="27" y="-3" width="5" height="1" rx="0.5" fill="#f59e0b" opacity="0.6" />
            <rect x="27" y="2" width="5" height="1" rx="0.5" fill="#f59e0b" opacity="0.6" />

            {/* Tail lights */}
            <rect x="-32" y="-9" width="3" height="5" rx="1" fill="#ef4444" opacity="0.9">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
            </rect>
            <rect x="-32" y="4" width="3" height="5" rx="1" fill="#ef4444" opacity="0.9">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
            </rect>
            <rect x="-31.5" y="-8" width="1.5" height="3" rx="0.5" fill="#fca5a5" opacity="0.6" />
            <rect x="-31.5" y="5" width="1.5" height="3" rx="0.5" fill="#fca5a5" opacity="0.6" />

            {/* Bumpers */}
            <path d="M26,-12 Q32,-12 32,-6 L32,6 Q32,12 26,12" fill="none" stroke={svgColors.carStroke} strokeWidth="0.6" />
            <path d="M-26,-12 Q-32,-12 -32,-6 L-32,6 Q-32,12 -26,12" fill="none" stroke={svgColors.carStroke} strokeWidth="0.6" />
            <line x1="28" y1="-1" x2="31" y2="-1" stroke={svgColors.carHighlight} strokeWidth="0.5" opacity="0.5" />
            <line x1="28" y1="1" x2="31" y2="1" stroke={svgColors.carHighlight} strokeWidth="0.5" opacity="0.5" />

            {/* Wheels */}
            <circle cx="18" cy="12" r="5.5" fill={svgColors.wheelOuter} stroke={svgColors.wheelStroke} strokeWidth="1" />
            <circle cx="18" cy="12" r="4" fill={svgColors.wheelInner} />
            <circle cx="18" cy="12" r="2" fill={svgColors.wheelHub} />
            <circle cx="18" cy="12" r="0.8" fill={svgColors.wheelCenter} />
            <line x1="18" y1="8.5" x2="18" y2="15.5" stroke={svgColors.wheelSpoke} strokeWidth="0.5" />
            <line x1="14.5" y1="12" x2="21.5" y2="12" stroke={svgColors.wheelSpoke} strokeWidth="0.5" />

            <circle cx="-18" cy="12" r="5.5" fill={svgColors.wheelOuter} stroke={svgColors.wheelStroke} strokeWidth="1" />
            <circle cx="-18" cy="12" r="4" fill={svgColors.wheelInner} />
            <circle cx="-18" cy="12" r="2" fill={svgColors.wheelHub} />
            <circle cx="-18" cy="12" r="0.8" fill={svgColors.wheelCenter} />
            <line x1="-18" y1="8.5" x2="-18" y2="15.5" stroke={svgColors.wheelSpoke} strokeWidth="0.5" />
            <line x1="-21.5" y1="12" x2="-14.5" y2="12" stroke={svgColors.wheelSpoke} strokeWidth="0.5" />

            {/* Wheel arches */}
            <path d="M12,12 Q12,5 18,5 Q24,5 24,12" fill="none" stroke={svgColors.wheelArch} strokeWidth="0.8" />
            <path d="M-24,12 Q-24,5 -18,5 Q-12,5 -12,12" fill="none" stroke={svgColors.wheelArch} strokeWidth="0.8" />
            <line x1="-12" y1="11" x2="12" y2="11" stroke={svgColors.doorLine} strokeWidth="0.4" opacity="0.5" />
            <path d="M-24,-10 Q0,-14 24,-10" fill="none" stroke={svgColors.carHighlight} strokeWidth="0.3" opacity="0.4" />

            {/* ── VaahanSafe Logo on car roof ── */}
            <g transform="translate(5, -27) scale(0.09)">
              <path
                d="M128 5 C70 30 30 60 30 115 C30 170 70 205 128 224 C186 205 226 170 226 115 C226 60 186 30 128 5 Z"
                fill="url(#carLogoGrad)"
                fillOpacity="0.3"
                stroke="url(#carLogoGrad)"
                strokeWidth="10"
                strokeLinejoin="round"
              />
              <path fill="url(#carLogoGrad)" d="M0.758 81.328 L61.2 4.2 L194.5 3.0 L254.777 80.172 L200 90 H56 Z" />
              <path
                fill="url(#carLogoGrad)"
                d="m254.777 80.172l-60.284-77.13c-3.468-4.294-9.91-3.964-13.048.496l-25.6 36.5c-8.093-4.624-17.672-7.102-27.582-6.937c-10.735 0-20.81 2.643-29.233 7.268L74.256 4.694c-3.138-4.46-9.745-4.79-13.048-.496L.758 81.328c-2.476 3.139 1.653 7.103 4.625 4.46l52.026-46.41c1.487-1.322 3.964-1.157 5.285.33l6.442 20.15c-29.564 7.267-51.53 34.023-51.53 65.734c.165 35.51 27.746 64.578 62.596 67.22c.99 12.883 8.258 26.922 32.04 35.345c1.983.66 3.47-1.486 2.313-3.138c-2.312-3.138-4.79-7.432-5.615-12.057c5.615 1.982 11.56 3.138 18.002 3.138c5.616 0 10.9-.99 16.186-2.642c-.826 4.459-3.303 8.588-5.45 11.56c-1.156 1.653.33 3.8 2.312 3.139c23.948-8.423 32.041-22.627 33.528-35.51c36.5-.99 65.734-31.05 65.569-67.716c-.165-32.206-22.627-58.962-52.687-65.734l6.607-20.645c1.321-1.652 3.633-1.817 5.285-.33l52.026 46.41c2.807 2.642 6.936-1.487 4.459-4.46"
              />
              <ellipse cx="72.688" cy="133.438" fill="#fff" rx="48.39" ry="35.508" transform="rotate(58.445 72.688 133.438)" />
              <path fill="#e54d42" d="M58 120 H86 V132 L96 142 H92 L84 134 C84 134 72 148 72 148 C72 148 58 142 58 132 V120 Z" fillRule="evenodd" />
              <ellipse cx="184.51" cy="133.956" fill="#fff" rx="48.721" ry="36.169" transform="rotate(-58.445 184.51 133.956)" />
              <path fill="#e54d42" d="M198 120 H170 V132 L160 142 H164 L172 134 C172 134 184 148 184 148 C184 148 198 142 198 132 V120 Z" fillRule="evenodd" />
            </g>

            {/* Logo glow on roof */}
            <circle cx="5" cy="-26" r="6" fill="rgba(249,115,22,0.1)">
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* ── Message Flag ── */}
            <g transform={`rotate(${-carPos.angle})`}>
              <line x1="0" y1="-30" x2="0" y2="-58" stroke={svgColors.flagPole} strokeWidth="1" opacity="0.4" />
              <rect
                x="-55"
                y="-80"
                width="110"
                height="22"
                rx="5"
                fill={svgColors.flagBg}
                stroke={svgColors.flagPole}
                strokeWidth="0.8"
                opacity={flagVisible ? 0.92 : 0}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              <text
                x="0"
                y="-65"
                textAnchor="middle"
                fill={svgColors.flagText}
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                opacity={flagVisible ? 1 : 0}
                style={{ transition: 'opacity 0.3s ease' }}
              >
                {FLAG_MESSAGES[currentFlagIndex].text}
              </text>
              <circle
                cx="-45"
                cy="-69"
                r="3.5"
                fill={svgColors.flagPole}
                opacity={flagVisible ? 0.85 : 0}
                style={{ transition: 'opacity 0.3s ease' }}
              />
            </g>
          </g>

        </svg>
      </div>

      {/* ─── Return Button ─── */}
      <div className="w-full max-w-xs px-6 z-10 pb-8 md:pb-10 flex-shrink-0">
        <Link
          to="/"
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-bold text-white dark:text-neutral-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 dark:from-orange-400 dark:to-amber-500 dark:hover:from-orange-300 dark:hover:to-amber-400 active:scale-[0.97] rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound