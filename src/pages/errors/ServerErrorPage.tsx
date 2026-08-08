import { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import AmbientBackground from '@/components/shared/AmbientBackground';

export default function ServerErrorPage() {
  const [carProgress, setCarProgress] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // Monitor document theme class (dark/light)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Drive from left edge and stall/stop in the middle
  useEffect(() => {
    let animId: number;
    let start: number | null = null;
    const duration = 2500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min((elapsed / duration) * 0.49, 0.49);
      setCarProgress(progress);
      if (progress < 0.49) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  // S-Curve highway path coordinates
  const roadPath = 'M -80 150 C 100 20, 300 200, 550 90 C 800 -20, 900 210, 1280 110';

  const getPointOnPath = useMemo(() => (t: number) => {
    let x: number, y: number, dx: number, dy: number;

    if (t < 0.5) {
      const st = t * 2;
      const mt = 1 - st;
      x = mt * mt * mt * (-80) + 3 * mt * mt * st * 100 + 3 * mt * st * st * 300 + st * st * st * 550;
      y = mt * mt * mt * 150 + 3 * mt * mt * st * 20 + 3 * mt * st * st * 200 + st * st * st * 90;
      dx = 3 * mt * mt * (100 - (-80)) + 6 * mt * st * (300 - 100) + 3 * st * st * (550 - 300);
      dy = 3 * mt * mt * (20 - 150) + 6 * mt * st * (200 - 20) + 3 * st * st * (90 - 200);
    } else {
      const st = (t - 0.5) * 2;
      const mt = 1 - st;
      x = mt * mt * mt * 550 + 3 * mt * mt * st * 800 + 3 * mt * st * st * 900 + st * st * st * 1280;
      y = mt * mt * mt * 90 + 3 * mt * mt * st * (-20) + 3 * mt * st * st * 210 + st * st * st * 110;
      dx = 3 * mt * mt * (800 - 550) + 6 * mt * st * (900 - 800) + 3 * st * st * (1280 - 900);
      dy = 3 * mt * mt * ((-20) - 90) + 6 * mt * st * (210 - (-20)) + 3 * st * st * (110 - 210);
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x, y, angle };
  }, []);

  const carPos = getPointOnPath(carProgress);

  const barrierPosts = useMemo(() => {
    const posts = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const point = getPointOnPath(t);
      const tanAngleRad = point.angle * (Math.PI / 180);
      const normalX = -Math.sin(tanAngleRad);
      const normalY = Math.cos(tanAngleRad);
      const offset = 56;
      posts.push({
        topX: point.x + normalX * offset,
        topY: point.y + normalY * offset,
        bottomX: point.x - normalX * offset,
        bottomY: point.y - normalY * offset,
      });
    }
    return posts;
  }, [getPointOnPath]);

  const svgColors = isDark
    ? {
        shoulderShadow: '#09090b',
        shoulder: '#18181b',
        edgeTrim: '#27272a',
        roadSurface: ['#0f0f13', '#14141a', '#0f0f13'],
        roadHighlight: 0.03,
        edgeLine: '#f59e0b',
        edgeLineGlow: 'rgba(245,158,11,0.25)',
        carBody: ['#dc2626', '#b91c1c', '#991b1b'],
        carRoof: ['#1e1b4b', '#0f172a'],
        carStroke: '#020617',
        carHighlight: '#fca5a5',
        wheelOuter: '#09090b',
        wheelStroke: '#1f2937',
        wheelInner: '#111827',
        wheelHub: '#374151',
        wheelCenter: '#4b5563',
        wheelSpoke: '#9ca3af',
        wheelArch: '#374151',
        doorLine: '#1f2937',
        flagBg: '#f59e0b',
        flagText: '#050507',
        flagPole: '#ea580c',
        shadow: 'rgba(0,0,0,0.5)',
      }
    : {
        shoulderShadow: '#e4e4e7',
        shoulder: '#f4f4f5',
        edgeTrim: '#e4e4e7',
        roadSurface: ['#1c1c24', '#272733', '#1c1c24'],
        roadHighlight: 0.06,
        edgeLine: '#ea580c',
        edgeLineGlow: 'rgba(234,88,12,0.2)',
        carBody: ['#ef4444', '#dc2626', '#b91c1c'],
        carRoof: ['#312e81', '#1e1b4b'],
        carStroke: '#090d16',
        carHighlight: '#fee2e2',
        wheelOuter: '#18181b',
        wheelStroke: '#4b5563',
        wheelInner: '#374151',
        wheelHub: '#6b7280',
        wheelCenter: '#9ca3af',
        wheelSpoke: '#d1d5db',
        wheelArch: '#6b7280',
        doorLine: '#6b7280',
        flagBg: '#f59e0b',
        flagText: '#050507',
        flagPole: '#ea580c',
        shadow: 'rgba(0,0,0,0.15)',
      };

  return (
    <div className="relative h-screen w-full bg-neutral-50 dark:bg-[#050507] text-neutral-900 dark:text-white flex flex-col items-center justify-between select-none font-sans text-center overflow-hidden"
      style={{ maxHeight: '100vh' }}
    >
      <AmbientBackground />

      {/* ─── Header ─── */}
      <div className="w-full max-w-2xl px-6 space-y-3 z-10 pt-8 md:pt-16 flex-shrink-0">
        <div className="relative">
          <h1
            aria-hidden="true"
            className="absolute inset-0 text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none text-amber-500/10 select-none text-center"
            style={{ transform: 'translate(-3px, -2px)' }}
          >
            500
          </h1>
          <h1 className="relative text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none text-transparent bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 bg-clip-text select-none drop-shadow-[0_10px_20px_rgba(245,158,11,0.2)] text-center">
            500
          </h1>
        </div>

        <h2 className="text-lg md:text-xl font-bold text-neutral-400 uppercase tracking-[0.15em] -mt-2">
          System Anomaly Detected
        </h2>
        <p className="text-neutral-400 dark:text-neutral-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          Our telemetry servers hit an unexpected bump in the road. A report was automatically compiled and sent to Sentry. We apologize for the inconvenience.
        </p>
      </div>

      {/* ─── Road Section with Stalled Car ─── */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-visible">
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
            <linearGradient id="roadSurface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svgColors.roadSurface[0]} />
              <stop offset="50%" stopColor={svgColors.roadSurface[1]} />
              <stop offset="100%" stopColor={svgColors.roadSurface[2]} />
            </linearGradient>
            <pattern id="barrierStripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="3" height="6" fill="#dc2626" />
              <rect x="3" width="3" height="6" fill="#fafafa" />
            </pattern>
            <radialGradient id="headlightBeam" cx="0.3" cy="0.5" r="0.7">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svgColors.carBody[0]} />
              <stop offset="40%" stopColor={svgColors.carBody[1]} />
              <stop offset="100%" stopColor={svgColors.carBody[2]} />
            </linearGradient>
            <linearGradient id="carRoofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svgColors.carRoof[0]} />
              <stop offset="100%" stopColor={svgColors.carRoof[1]} />
            </linearGradient>
            <linearGradient id="windshieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="carLogoGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#e14760" />
              <stop offset="100%" stopColor="#fa8816" />
            </linearGradient>
          </defs>

          {/* Road layers */}
          <path d={roadPath} stroke={svgColors.shoulderShadow} strokeWidth="115" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke={svgColors.shoulder} strokeWidth="108" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke={svgColors.edgeTrim} strokeWidth="100" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke="url(#roadSurface)" strokeWidth="96" fill="none" strokeLinecap="round" />
          <path d={roadPath} stroke="#ffffff" strokeWidth="96" fill="none" strokeLinecap="round" opacity={svgColors.roadHighlight} />
          
          <path
            d={roadPath}
            stroke={svgColors.edgeLine}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${svgColors.edgeLineGlow})` }}
          />
          <path
            d={roadPath}
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="18 26"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.35))' }}
          />

          {/* Shoulder posts */}
          {barrierPosts.map((post, i) => (
            <g key={`barrier-${i}`}>
              <rect x={post.topX - 2.5} y={post.topY - 7} width="5" height="14" rx="1.2" fill="url(#barrierStripe)" opacity="0.65" />
              <circle cx={post.topX} cy={post.topY - 3} r="1.2" fill="#fbbf24" opacity="0.85" />
              <rect x={post.bottomX - 2.5} y={post.bottomY - 7} width="5" height="14" rx="1.2" fill="url(#barrierStripe)" opacity="0.65" />
              <circle cx={post.bottomX} cy={post.bottomY - 3} r="1.2" fill="#fbbf24" opacity="0.85" />
            </g>
          ))}

          {/* Large Realistic Warning Sign Stand on Road */}
          <g transform="translate(565, 83) rotate(-15)">
            {/* Soft drop shadow on road */}
            <ellipse cx="0" cy="24" rx="24" ry="4" fill="rgba(0,0,0,0.5)" />
            {/* Metal stand support legs */}
            <line x1="-16" y1="24" x2="0" y2="8" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="16" y1="24" x2="0" y2="8" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="0" y1="24" x2="0" y2="8" stroke="#111827" strokeWidth="4.5" strokeLinecap="round" />
            {/* Warning pulse glow */}
            <circle r="36" fill="rgba(245, 158, 11, 0.15)" className="animate-pulse" />
            <circle r="14" fill="#f59e0b" className="animate-ping" opacity="0.3" />
            {/* Outer reflective border triangle */}
            <polygon points="-22,12 0,-24 22,12" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            {/* Inner warning yellow/orange triangle */}
            <polygon points="-17,9 0,-18 17,9" fill="#fbbf24" />
            {/* Bold Exclamation point */}
            <rect x="-1.5" y="-10" width="3" height="10" rx="0.8" fill="#1e293b" />
            <circle cx="0" cy="3" r="1.8" fill="#1e293b" />
          </g>

          {/* Animated Car */}
          <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}>
            <ellipse cx="0" cy="14" rx="30" ry="6" fill={svgColors.shadow} />
            <ellipse cx="42" cy="0" rx="28" ry="14" fill="url(#headlightBeam)" />

            <path
              d="M-30,-4 Q-30,-12 -24,-12 L24,-12 Q30,-12 30,-4 L30,8 Q30,12 26,12 L-26,12 Q-30,12 -30,8 Z"
              fill="url(#carBodyGrad)"
              stroke={svgColors.carStroke}
              strokeWidth="0.6"
            />
            <path d="M-28,-4 L28,-4" stroke={svgColors.carHighlight} strokeWidth="0.4" opacity="0.5" />

            <path
              d="M-12,-12 L-6,-24 Q-4,-26 0,-26 L10,-26 Q14,-26 16,-24 L22,-12"
              fill="url(#carRoofGrad)"
              stroke={svgColors.carStroke}
              strokeWidth="0.5"
            />

            <path d="M14,-12 L18,-23 Q19,-25 16,-25 L12,-25 L14,-12 Z" fill="url(#windshieldGrad)" />
            <path d="M-10,-12 L-5,-23 Q-4,-25 -2,-25 L2,-25 L-6,-12 Z" fill="url(#windshieldGrad)" opacity="0.7" />
            <path d="M-4,-12 L-2,-23 Q-1,-24.5 2,-24.5 L10,-24.5 Q12,-24.5 13,-23 L13,-12 Z" fill="url(#windshieldGrad)" opacity="0.5" />
            <line x1="5" y1="-12" x2="6" y2="-24" stroke={svgColors.doorLine} strokeWidth="1.2" />
            <line x1="2" y1="-11" x2="2" y2="10" stroke={svgColors.doorLine} strokeWidth="0.5" opacity="0.6" />
            <rect x="4" y="-2" width="5" height="1.5" rx="0.75" fill={svgColors.carHighlight} opacity="0.7" />

            {/* Headlights */}
            <rect x="28" y="-9" width="4" height="5" rx="1.5" fill="#fde68a" />
            <rect x="28" y="4" width="4" height="5" rx="1.5" fill="#fde68a" />
            <rect x="29" y="-8" width="2" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="29" y="5" width="2" height="3" rx="1" fill="#ffffff" opacity="0.9" />

            {/* Tail lights */}
            <rect x="-32" y="-9" width="3" height="5" rx="1" fill="#ef4444" opacity="0.9" />
            <rect x="-32" y="4" width="3" height="5" rx="1" fill="#ef4444" opacity="0.9" />

            {/* Bumpers */}
            <path d="M26,-12 Q32,-12 32,-6 L32,6 Q32,12 26,12" fill="none" stroke={svgColors.carStroke} strokeWidth="0.6" />
            <path d="M-26,-12 Q-32,-12 -32,-6 L-32,6 Q-32,12 -26,12" fill="none" stroke={svgColors.carStroke} strokeWidth="0.6" />

            {/* Wheels */}
            <circle cx="18" cy="12" r="5.5" fill={svgColors.wheelOuter} stroke={svgColors.wheelStroke} strokeWidth="1" />
            <circle cx="18" cy="12" r="4" fill={svgColors.wheelInner} />
            <circle cx="18" cy="12" r="2" fill={svgColors.wheelHub} />
            <circle cx="18" cy="12" r="0.8" fill={svgColors.wheelCenter} />

            <circle cx="-18" cy="12" r="5.5" fill={svgColors.wheelOuter} stroke={svgColors.wheelStroke} strokeWidth="1" />
            <circle cx="-18" cy="12" r="4" fill={svgColors.wheelInner} />
            <circle cx="-18" cy="12" r="2" fill={svgColors.wheelHub} />
            <circle cx="-18" cy="12" r="0.8" fill={svgColors.wheelCenter} />

            {/* Message Flag pops up when stalled */}
            <g transform={`rotate(${-carPos.angle})`}>
              <line x1="0" y1="-30" x2="0" y2="-58" stroke={svgColors.flagPole} strokeWidth="1" opacity="0.4" />
              <rect
                x="-45"
                y="-80"
                width="90"
                height="22"
                rx="5"
                fill={svgColors.flagBg}
                stroke={svgColors.flagPole}
                strokeWidth="0.8"
                opacity={carProgress >= 0.48 ? 0.95 : 0}
                style={{ transition: 'opacity 0.5s ease' }}
              />
              <text
                x="0"
                y="-66"
                textAnchor="middle"
                fill={svgColors.flagText}
                fontSize="9"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                opacity={carProgress >= 0.48 ? 1 : 0}
                style={{ transition: 'opacity 0.5s ease' }}
              >
                Telemetry Lost!
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* ─── Return/Retry Buttons ─── */}
      <div className="w-full max-w-xs px-6 z-10 pb-8 md:pb-10 flex-shrink-0 flex flex-col gap-2.5 mx-auto">
        <button
          onClick={handleReload}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-bold text-white dark:text-neutral-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 dark:from-orange-400 dark:to-amber-500 dark:hover:from-orange-300 dark:hover:to-amber-400 active:scale-[0.97] rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 cursor-pointer"
        >
          <HugeiconsIcon icon={RefreshIcon} className="size-4" />
          Try Again
        </button>
        <a
          href="mailto:support@vaahansafe.com?subject=Server%20Error%20Report"
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 active:scale-[0.98] rounded-lg shadow-md transition-all duration-200"
        >
          <HugeiconsIcon icon={Mail01Icon} className="size-3.5 text-zinc-500 dark:text-zinc-400" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
