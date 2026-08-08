import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Sun01Icon, 
  MoonIcon, 
  Menu01Icon, 
  Cancel01Icon, 
  Call02Icon, 
  AlertCircleIcon 
} from '@hugeicons/core-free-icons'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet"
import vaahanLogo from '../../assets/logo.svg'
import PageLoader from '@/components/loader/PageLoader'

interface SimulatedAlert {
  id: number
  title: string
  body: string
  type: 'call' | 'whatsapp'
}

interface AppLayoutProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  loggedInPhone: string | null
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  simulatedAlerts: SimulatedAlert[]
  setSimulatedAlerts: React.Dispatch<React.SetStateAction<SimulatedAlert[]>>
}

export function AppLayout({
  theme,
  toggleTheme,
  loggedInPhone,
  mobileMenuOpen,
  setMobileMenuOpen,
  simulatedAlerts,
  setSimulatedAlerts
}: AppLayoutProps) {
  const location = useLocation()
  const hideNavbar = location.pathname === '/dashboard' && !loggedInPhone
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [location.pathname])

  const handleLoaderComplete = () => {
    setIsLoading(false)
    if (isFirstLoad) {
      setIsFirstLoad(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col justify-between transition-colors duration-300 font-sans">
      {isLoading && (
        <PageLoader 
          onComplete={handleLoaderComplete} 
          duration={isFirstLoad ? 1.8 : 0.65} 
        />
      )}
   

 

      {/* Main Header bar */}
      {!hideNavbar && (
        <header 
          className='fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 lg:px-10 py-3 lg:py-3.5 bg-white/80 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50'
        >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo & title */}
          <Link 
            to="/home" 
            className="flex items-center gap-2 lg:gap-3 cursor-pointer select-none"
          >
            <img src={vaahanLogo} alt="VaahanSafe Logo" className="w-auto h-8 lg:h-9" />
            <div>
              <span className="text-base lg:text-lg font-bold tracking-wider text-zinc-900 dark:text-white font-display">VAAHAN<span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">SAFE</span></span>
              <p className="text-[7px] lg:text-[9px] text-zinc-500 tracking-widest font-semibold uppercase font-mono">Security Ecosystem</p>
            </div>
          </Link>
          
          {/* Desktop navigation - dropdown menu on hover */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium">
            <NavLink 
              to="/home"
              className={({ isActive }) => `tracking-wide transition-all cursor-pointer px-3.5 py-1.5 rounded-full ${isActive ? 'text-zinc-900 dark:text-white bg-zinc-200/60 dark:bg-zinc-800/80 border border-zinc-300/50 dark:border-zinc-700/50' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              Home
            </NavLink>

            {/* Explore Hover Dropdown */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setIsExploreOpen(true)}
              onMouseLeave={() => setIsExploreOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full tracking-wide transition-all cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 focus:outline-none ${isExploreOpen ? 'text-zinc-900 dark:text-white bg-zinc-200/40 dark:bg-zinc-800/50 border border-zinc-300/30 dark:border-zinc-700/30' : ''}`}
              >
                Ecosystem
                <svg
                  className={`size-2.5 transition-transform duration-300 ${isExploreOpen ? 'rotate-180 text-brand' : 'text-zinc-400 dark:text-zinc-500'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isExploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 top-[100%] mt-1 w-64 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-xl shadow-2xl p-3.5 space-y-1.5 z-50 text-left"
                  >
                    <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase font-mono px-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-900/50">
                      VaahanSafe Platform
                    </div>
                    {[
                      { to: '/how-it-works', label: 'How It Works', desc: 'Sub-2s alert response timeline' },
                      { to: '/pricing', label: 'Pricing Plans', desc: 'Stickers & subscriptions' },
                      { to: '/faq', label: 'Help & FAQ', desc: 'Privacy details & data questions' },
                      { to: '/legal', label: 'Legal Policies', desc: 'DPDP compliance & terms' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsExploreOpen(false)}
                        className={`block p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors ${location.pathname === item.to ? 'bg-zinc-100/60 dark:bg-zinc-900/40' : ''}`}
                      >
                        <span className="block text-xs font-bold text-zinc-900 dark:text-white">{item.label}</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5 leading-normal">{item.desc}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <HugeiconsIcon icon={Sun01Icon} className="size-4 text-brand" />
              ) : (
                <HugeiconsIcon icon={MoonIcon} className="size-4 text-brand" />
              )}
            </button>
          </nav>

          {/* Responsive Mobile Menu via Shadcn UI Sheet Drawer */}
          <div className="flex lg:hidden items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <button
                    className="text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none p-2 flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-6 text-zinc-900 dark:text-white" />
              </SheetTrigger>
              
              <SheetContent side="right" className="p-6 flex flex-col justify-between bg-[#0a0a0c] text-white border-l border-zinc-900 h-full font-sans select-none w-[280px] sm:w-[350px]">
                <div className="space-y-6">
                  <SheetHeader className="p-0 border-b border-zinc-900 pb-4">
                    <SheetTitle className="font-display tracking-widest text-lg uppercase text-white">
                      VAAHAN<span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">SAFE</span>
                    </SheetTitle>
                    <SheetDescription className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                      Windshield Security System
                    </SheetDescription>
                  </SheetHeader>

                  <nav className="flex flex-col gap-4 text-sm font-semibold">
                    <Link 
                      to="/home"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full text-left py-2 rounded-lg transition-colors cursor-pointer ${location.pathname === '/home' || location.pathname === '/' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Home
                    </Link>

                    {/* Mobile Ecosystem Accordion */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                        className={`w-full flex items-center justify-between py-2 text-left transition-colors cursor-pointer ${mobileExploreOpen || ['/how-it-works', '/pricing', '/faq', '/legal'].includes(location.pathname) ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                      >
                        <span>Ecosystem</span>
                        <svg
                          className={`size-3 transition-transform duration-200 ${mobileExploreOpen ? 'rotate-180 text-brand' : 'text-zinc-500'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileExploreOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden pl-4 flex flex-col gap-3.5 border-l border-zinc-900 mt-1 pb-2"
                          >
                            {[
                              { to: '/how-it-works', label: 'How It Works' },
                              { to: '/pricing', label: 'Pricing Plans' },
                              { to: '/faq', label: 'Help & FAQ' },
                              { to: '/legal', label: 'Legal Policies' },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => {
                                  setMobileMenuOpen(false)
                                  setMobileExploreOpen(false)
                                }}
                                className={`block text-xs transition-colors cursor-pointer ${location.pathname === item.to ? 'text-brand font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </nav>
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold">Theme</span>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900 text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                      aria-label="Toggle dark/light theme"
                    >
                      {theme === 'dark' ? (
                        <HugeiconsIcon icon={Sun01Icon} className="size-4 text-brand" />
                      ) : (
                        <HugeiconsIcon icon={MoonIcon} className="size-4 text-zinc-500" />
                      )}
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      )}

      {/* Main viewport - padded to offset fixed header, unless on the landing page */}
      <main className={`w-full flex-grow flex flex-col ${
        hideNavbar 
          ? 'pt-0 pb-0 justify-center items-center' 
          : (location.pathname === '/home' || location.pathname === '/' ? 'pt-0 pb-0' : 'pt-20 pb-8')
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-grow flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer bar with legal compliant links using Link */}
      {(location.pathname === '/home' || location.pathname === '/') && (
        <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#08080a] py-12 px-6 text-center text-xs text-zinc-500 transition-colors duration-300 select-none">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={vaahanLogo} alt="Logo footer" className="h-8 w-auto opacity-70" />
              <div className="text-left font-mono">
                <span className="font-bold text-zinc-900 dark:text-white block">VAAHANSAFE</span>
                <span className="text-[9px] block text-zinc-500">Securing Windshields Nationwide</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
              <Link to="/legal" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer">Privacy Guidelines</Link>
              <Link to="/legal" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer">Terms of Service</Link>
              <Link to="/faq" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer">Support</Link>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-900/60 text-[10px] text-zinc-400 dark:text-zinc-600 flex flex-col sm:flex-row justify-between gap-4">
            <p>© 2026 VaahanSafe Inc. Compliant with Digital Personal Data Protection (DPDP) Act 2023.</p>
            <p>Powered by Exotel &amp; AiSensy APIs.</p>
          </div>
        </footer>
      )}

      {/* Floating simulated WhatsApp/SMS/Call integration toasts */}
      <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full space-y-3 pointer-events-none">
        {simulatedAlerts.map(alert => (
          <div 
            key={alert.id} 
            className="p-4 rounded-lg border border-brand bg-card shadow-2xl pointer-events-auto flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300"
          >
            <div className="h-8 w-8 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={alert.type === 'call' ? Call02Icon : AlertCircleIcon} className="size-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-xs text-foreground uppercase tracking-wider font-display">{alert.title}</span>
                <button 
                  onClick={() => setSimulatedAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal font-sans">{alert.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
