import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, authStore } from '@/store/authStore';
import { useUITheme } from '@/store/uiStore';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Sun01Icon, 
  MoonIcon, 
  Menu01Icon, 
  Notification01Icon, 
  User02Icon, 
  Logout01Icon,
  CreditCardIcon
} from '@hugeicons/core-free-icons';
import vaahanLogo from '@/assets/logo.svg';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface NavbarProps {
  variant?: 'marketing' | 'app';
}

export default function Navbar({ variant = 'app' }: NavbarProps) {
  const { owner } = useAuthStore();
  const phone = owner?.phone || '';
  const { theme, toggleTheme } = useUITheme();
  const location = useLocation();
  const navigate = useNavigate();

  const userName = owner?.full_name || owner?.name || 'Authorized Owner';
  
  // Marketing states
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Framer Motion scroll tracking for marketing
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.9]);
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 0.6]);
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const blurAmount = useTransform(scrollY, [0, 50], ["0px", "16px"]);

  if (variant === 'marketing') {
    return (
      <motion.header 
        style={{
          // Set custom CSS variables that Framer Motion updates directly
          // @ts-ignore
          "--navbar-bg-opacity": bgOpacity,
          // @ts-ignore
          "--navbar-border-opacity": borderOpacity,
          // @ts-ignore
          "--navbar-shadow-opacity": shadowOpacity,
          // @ts-ignore
          "--navbar-blur": blurAmount,
          backgroundColor: "var(--navbar-bg)",
          borderBottomColor: "var(--navbar-border)",
          boxShadow: "var(--navbar-shadow)",
          backdropFilter: "blur(var(--navbar-blur))",
        }}
        className="fixed top-0 left-0 w-full z-50 px-6 lg:px-10 py-3 lg:py-3.5 border-b transition-colors duration-300"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo & title */}
          <Link 
            to="/" 
            className="flex items-center gap-2 lg:gap-3 cursor-pointer select-none"
          >
            <img src={vaahanLogo} alt="VaahanSafe Logo" className="w-auto h-8 lg:h-9" />
            <div className="text-left">
              <span className="text-base lg:text-lg font-bold tracking-wider text-zinc-900 dark:text-white font-display">
                VAAHAN<span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">SAFE</span>
              </span>
              <p className="text-[7px] lg:text-[9px] text-zinc-500 tracking-widest font-semibold uppercase font-mono leading-none">Security Ecosystem</p>
            </div>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium">
            <NavLink 
              to="/"
              className={({ isActive }) => `tracking-wide transition-all cursor-pointer px-3.5 py-1.5 rounded-lg ${isActive ? 'text-zinc-900 dark:text-white bg-zinc-200/60 dark:bg-zinc-800/80 border border-zinc-300/50 dark:border-zinc-700/50' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg tracking-wide transition-all cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 focus:outline-none ${isExploreOpen ? 'text-zinc-900 dark:text-white bg-zinc-200/40 dark:bg-zinc-800/50 border border-zinc-300/30 dark:border-zinc-700/30' : ''}`}
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

            {/* Login / Dashboard Link */}
            {phone ? (
              <Link 
                to="/dashboard"
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-all active:scale-[0.98]"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/login"
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-[12px] font-semibold transition-all active:scale-[0.98]"
              >
                Login
              </Link>
            )}

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
              
              <SheetContent side="right" className="p-6 flex flex-col justify-between bg-white dark:bg-[#0a0a0c] text-zinc-900 dark:text-white border-l border-zinc-200 dark:border-zinc-900 h-full font-sans select-none w-[280px] sm:w-[350px]">
                <div className="space-y-6">
                  <SheetHeader className="p-0 border-b border-zinc-200 dark:border-zinc-900 pb-4">
                    <SheetTitle className="font-display tracking-widest text-lg uppercase text-zinc-900 dark:text-white">
                      VAAHAN<span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">SAFE</span>
                    </SheetTitle>
                    <SheetDescription className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                      Windshield Security System
                    </SheetDescription>
                  </SheetHeader>

                  <nav className="flex flex-col gap-4 text-sm font-semibold">
                    <Link 
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full text-left py-2 rounded-lg transition-colors cursor-pointer px-2 ${location.pathname === '/' ? 'text-zinc-900 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-900/50' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                      Home
                    </Link>

                    {/* Mobile Ecosystem Accordion */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                        className={`w-full flex items-center justify-between py-2 text-left transition-colors cursor-pointer px-2 ${mobileExploreOpen || ['/how-it-works', '/pricing', '/faq', '/legal'].includes(location.pathname) ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
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
                            className="overflow-hidden pl-4 flex flex-col gap-3.5 border-l border-zinc-200 dark:border-zinc-900 mt-1 pb-2"
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
                                  setMobileMenuOpen(false);
                                  setMobileExploreOpen(false);
                                }}
                                className={`block text-xs transition-colors cursor-pointer ${location.pathname === item.to ? 'text-brand font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mobile Login / Dashboard */}
                    {phone ? (
                      <Link 
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-lg bg-brand text-white text-xs font-semibold cursor-pointer"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link 
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold cursor-pointer border border-zinc-200 dark:border-transparent"
                      >
                        Login
                      </Link>
                    )}
                  </nav>
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wider uppercase font-bold">Theme</span>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950/60 hover:bg-zinc-200 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
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
      </motion.header>
    );
  }

  // App navbar implementation with Owner Avatar Dropdown Menu
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0 text-zinc-900 dark:text-white font-sans">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer" />
        <Separator orientation="vertical" className="h-4 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs font-mono text-zinc-500 font-bold uppercase">Windshield Workspace</span>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Notifications bell */}
        <Link 
          to="/dashboard/notifications"
          className="size-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white relative cursor-pointer flex items-center justify-center shrink-0 transition-colors"
        >
          <HugeiconsIcon icon={Notification01Icon} className="size-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        </Link>

        {/* Owner Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <Avatar size="default" className="cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                <AvatarFallback className="bg-brand/10 text-brand font-bold uppercase text-[10px] flex items-center justify-center size-full">
                  {userName ? userName.trim().charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            }
          />
          <DropdownMenuContent align="end" className="w-56 font-sans">
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-xs font-bold text-zinc-900 dark:text-white leading-none">{userName || 'VaahanSafe User'}</span>
                <span className="text-[10px] text-zinc-500 font-mono mt-1">{phone || 'Anonymous'}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => navigate('/dashboard/profile')}
                className="cursor-pointer"
              >
                <HugeiconsIcon icon={User02Icon} className="size-3.5 text-zinc-500" />
                <span>Profile Cockpit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/dashboard/billing')}
                className="cursor-pointer"
              >
                <HugeiconsIcon icon={CreditCardIcon} className="size-3.5 text-zinc-500" />
                <span>Plans & Invoices</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                authStore.logout();
                navigate('/login');
              }}
              className="text-red-500 focus:text-red-500 cursor-pointer"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-3.5 text-red-500" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
