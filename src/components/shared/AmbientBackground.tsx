import { useState, useEffect } from 'react';

export default function AmbientBackground() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Layer 1: Multi-point vibrant radial mesh */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark ? `
            radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 122, 0, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 65% 50% at 15% 45%, rgba(255, 90, 0, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 65% 50% at 85% 55%, rgba(255, 140, 0, 0.20) 0%, transparent 55%),
            radial-gradient(ellipse 95% 60% at 50% 110%, rgba(255, 100, 0, 0.30) 0%, transparent 60%)
          ` : `
            radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 122, 0, 0.12) 0%, transparent 65%),
            radial-gradient(ellipse 65% 50% at 15% 45%, rgba(255, 90, 0, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 65% 50% at 85% 55%, rgba(255, 140, 0, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 95% 60% at 50% 110%, rgba(255, 100, 0, 0.10) 0%, transparent 65%)
          `
        }}
      />

      {/* Layer 2: Central intense glowing core behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[110px] pointer-events-none"
        style={{
          background: isDark 
            ? 'radial-gradient(circle, rgba(255, 122, 0, 0.30) 0%, rgba(255, 80, 0, 0.15) 45%, transparent 75%)'
            : 'radial-gradient(circle, rgba(255, 122, 0, 0.10) 0%, rgba(255, 80, 0, 0.05) 45%, transparent 75%)'
        }}
      />

      {/* Layer 3: Floating high-intensity luminous halos */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[130px]"
        style={{ 
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 136, 0, 0.35) 0%, rgba(255, 90, 0, 0.18) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 136, 0, 0.12) 0%, rgba(255, 90, 0, 0.06) 40%, transparent 70%)'
        }}
      />
      <div className="absolute top-[25%] -left-36 w-[500px] h-[500px] rounded-full blur-[110px]"
        style={{ 
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 110, 0, 0.22) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(255, 110, 0, 0.08) 0%, transparent 60%)'
        }}
      />
      <div className="absolute top-[45%] -right-32 w-[450px] h-[450px] rounded-full blur-[100px]"
        style={{ 
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 155, 30, 0.20) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(255, 155, 30, 0.08) 0%, transparent 60%)'
        }}
      />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
        style={{ 
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 110, 0, 0.28) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(255, 110, 0, 0.10) 0%, transparent 60%)'
        }}
      />

      {/* Layer 4: High-visibility hex grid lines */}
      <svg className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-[0.14]' : 'opacity-[0.06]'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="scan-hex-grid-glow" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke="#ff8a00" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scan-hex-grid-glow)" />
      </svg>

      {/* Layer 5: Fine dot matrix texture overlay */}
      <svg className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-[0.09]' : 'opacity-[0.04]'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="scan-dot-texture-glow" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="#ffa000" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scan-dot-texture-glow)" />
      </svg>

      {/* Layer 6: Vignette contrast gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 65% 55% at 50% 50%, transparent 15%, rgba(5, 5, 7, 0.70) 100%)`
            : `radial-gradient(ellipse 65% 55% at 50% 50%, transparent 15%, rgba(250, 250, 250, 0.65) 100%)`
        }}
      />
    </div>
  );
}
