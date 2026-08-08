import { useEffect, useState } from 'react';
import { uiStore } from '@/store/uiStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';

interface IdleTimeoutModalProps {
  loggedInPhone: string | null;
  onLogout: () => void;
}

export default function IdleTimeoutModal({ loggedInPhone, onLogout }: IdleTimeoutModalProps) {
  const [isOpen, setIsOpen] = useState(uiStore.getIsIdleModalOpen());

  useEffect(() => {
    const unsubscribe = uiStore.subscribe(() => {
      setIsOpen(uiStore.getIsIdleModalOpen());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loggedInPhone) {
      uiStore.setIdleModalOpen(false);
      return;
    }

    const IDLE_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes
    let timeoutId: any;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (!uiStore.getIsIdleModalOpen()) {
        timeoutId = setTimeout(() => {
          uiStore.setIdleModalOpen(true);
          onLogout();
        }, IDLE_TIME_LIMIT);
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [loggedInPhone, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none">
      <Card className="glass-panel border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/95 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
          <HugeiconsIcon icon={Clock01Icon} className="size-5 text-red-500 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Session Expired</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
          You have been logged out automatically due to 15 minutes of inactivity. Please log back in to secure your windshield portal.
        </p>
        <Button 
          onClick={() => {
            uiStore.setIdleModalOpen(false);
          }}
          className="w-full h-9 bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer border-none"
        >
          Acknowledge
        </Button>
      </Card>
    </div>
  );
}
