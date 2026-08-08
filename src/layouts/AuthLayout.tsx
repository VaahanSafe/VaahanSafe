import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import vaahanLogo from '../assets/logo.svg';
import AmbientBackground from '@/components/shared/AmbientBackground';

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#050507] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Reusable Multi-Layer Glowing Ambient Background */}
      <AmbientBackground />

      {/* Unified Branding Header & Centered Form Portal */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm relative z-10">
        
        {/* Centered Top App Logo */}
        <div className="flex flex-col items-center gap-1.5 select-none">
          <img src={vaahanLogo} alt="VaahanSafe Logo" className="h-10 w-auto drop-shadow-[0_4px_15px_rgba(255,122,0,0.3)]" />
          <div className="text-center">
            <span className="text-xl font-black tracking-wider text-white font-display">
              VAAHAN<span className="bg-gradient-to-r from-brand via-amber-400 to-orange-500 bg-clip-text text-transparent">SAFE</span>
            </span>
            <p className="text-[8px] text-orange-400/80 tracking-widest font-bold uppercase font-mono mt-0.5">Security Ecosystem</p>
          </div>
        </div>

        {/* Transitioning Form Wrapper Card */}
        <div className="w-full relative">
          {/* Ambient aura ring around card */}
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-orange-600/20 blur-xl opacity-70 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full relative z-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
