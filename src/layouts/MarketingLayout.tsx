import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  Call02Icon, 
  AlertCircleIcon 
} from '@hugeicons/core-free-icons';
import vaahanLogo from '../assets/logo.svg';
import PageLoader from '@/components/loader/PageLoader';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import Navbar from '@/components/layout/Navbar';
import CommandPalette from '@/components/layout/CommandPalette';

interface SimulatedAlert {
  id: number;
  title: string;
  body: string;
  type: 'call' | 'whatsapp';
}

export default function MarketingLayout() {
  const location = useLocation();
  const { phone: loggedInPhone } = useAuthStore();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Inject SEO metadata and JSON-LD structured data
  useDocumentHead({
    title: 'Windshield QR Security System',
    description: 'VaahanSafe protects your vehicle windshield with anonymous calling, emergency contact alerts, and DPDP-compliant data handling.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "VaahanSafe Windshield QR System",
      "image": "https://vaahansafe.com/og-image.png",
      "description": "Premium vehicle security system using anonymous QR calling to connect bystanders with vehicle owners securely.",
      "brand": {
        "@type": "Brand",
        "name": "VaahanSafe"
      }
    }
  });

  useEffect(() => {
    setIsLoading(true);
  }, [location.pathname]);

  const handleLoaderComplete = () => {
    setIsLoading(false);
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  };

  // Floating Simulated Alerts State
  const [simulatedAlerts, setSimulatedAlerts] = useState<SimulatedAlert[]>([]);

  useEffect(() => {
    const handleActiveCall = (e: Event) => {
      const customEvent = e as CustomEvent<{ bridgeId: string; licensePlate: string; ownerName: string }>;
      const newAlert: SimulatedAlert = {
        id: Date.now(),
        type: 'call',
        title: 'Exotel Call Bridge Connected',
        body: `Bystander connected anonymously to owner ${customEvent.detail.ownerName} (${customEvent.detail.licensePlate}). Bridge ID: ${customEvent.detail.bridgeId}`
      };
      setSimulatedAlerts(prev => [...prev, newAlert]);
      removeAlertAfterDelay(newAlert.id);
    };

    const handleWhatsAppSent = (e: Event) => {
      const customEvent = e as CustomEvent<{ licensePlate: string; message: string; contacts: string[] }>;
      const newAlert: SimulatedAlert = {
        id: Date.now(),
        type: 'whatsapp',
        title: 'AiSensy WhatsApp Alert Dispatched',
        body: `Emergency message containing live GPS maps link and license plate ${customEvent.detail.licensePlate} sent to emergency contacts: ${customEvent.detail.contacts.join(', ')}`
      };
      setSimulatedAlerts(prev => [...prev, newAlert]);
      removeAlertAfterDelay(newAlert.id);
    };

    window.addEventListener('vs_call_active', handleActiveCall);
    window.addEventListener('vs_whatsapp_sent', handleWhatsAppSent);
    
    return () => {
      window.removeEventListener('vs_call_active', handleActiveCall);
      window.removeEventListener('vs_whatsapp_sent', handleWhatsAppSent);
    };
  }, []);

  const removeAlertAfterDelay = (id: number) => {
    setTimeout(() => {
      setSimulatedAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 7000);
  };

  const hideNavbar = location.pathname === '/login' || (location.pathname === '/dashboard' && !loggedInPhone);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col justify-between transition-colors duration-300 font-sans">
      {isLoading && (
        <PageLoader 
          onComplete={handleLoaderComplete} 
          duration={isFirstLoad ? 1.8 : 0.65} 
        />
      )}

      {/* Main Header bar - Transparent, solidifies on scroll */}
      {!hideNavbar && <Navbar variant="marketing" />}

      {/* Main viewport */}
      <main className={`w-full flex-grow flex flex-col ${
        hideNavbar 
          ? 'pt-0 pb-0 justify-center items-center' 
          : 'pt-20 pb-8'
      }`}>
        <Outlet />
      </main>

      {/* Full Footer with Sitemap */}
      {!hideNavbar && (
        <footer className="border-t border-zinc-200 dark:border-zinc-900/60 bg-zinc-50/50 dark:bg-[#08080a] py-16 px-6 md:px-12 text-xs text-zinc-500 transition-colors duration-300 select-none">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={vaahanLogo} alt="Logo footer" className="h-8 w-auto opacity-75" />
                <div className="text-left font-mono">
                  <span className="font-extrabold text-zinc-900 dark:text-white block tracking-wider">VAAHANSAFE</span>
                  <span className="text-[9px] block text-zinc-500">Securing Windshields Nationwide</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-sans pr-4">
                Deploying state-of-the-art windshield QR tags to bridge bystanders anonymously and safeguard owners from wrong parking alerts.
              </p>
            </div>

            {/* Sitemap Column 1 - Product */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-zinc-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">Product</h4>
              <ul className="space-y-2.5 font-medium">
                <li><Link to="/how-it-works" className="hover:text-brand transition-colors">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-brand transition-colors">Pricing Plans</Link></li>
                <li><Link to="/features" className="hover:text-brand transition-colors">Ecosystem Features</Link></li>
              </ul>
            </div>

            {/* Sitemap Column 2 - Compliance */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-zinc-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">Compliance</h4>
              <ul className="space-y-2.5 font-medium">
                <li><Link to="/legal" className="hover:text-brand transition-colors">Privacy Policy</Link></li>
                <li><Link to="/legal" className="hover:text-brand transition-colors">Terms of Service</Link></li>
                <li><span className="text-zinc-400 dark:text-zinc-600 block text-[10px]">DPDP Act 2023 Compliant</span></li>
              </ul>
            </div>

            {/* Sitemap Column 3 - Company */}
            <div className="space-y-3.5 text-left">
              <h4 className="text-zinc-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">Support</h4>
              <ul className="space-y-2.5 font-medium">
                <li><Link to="/faq" className="hover:text-brand transition-colors">Help &amp; FAQ</Link></li>
                <li><Link to="/contact-sales" className="hover:text-brand transition-colors">Contact Sales</Link></li>
                <li><span className="text-zinc-400 dark:text-zinc-600 block text-[10px]">Grievance Desk Active</span></li>
              </ul>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-900/60 text-[10px] text-zinc-400 dark:text-zinc-600 flex flex-col sm:flex-row justify-between gap-4">
            <p>© 2026 VaahanSafe Inc. All rights reserved. Compliant with Digital Personal Data Protection Act 2023.</p>
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
            <div className="flex-1 space-y-1 text-left">
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

      {/* Global Shortcut Command Palette */}
      <CommandPalette />
    </div>
  );
}
