import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/store/authStore';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Home01Icon,
  DashboardCircleIcon, 
  Car01Icon, 
  CreditCardIcon, 
  Settings01Icon,
  Logout01Icon,
  PlusSignIcon
} from "@hugeicons/core-free-icons";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const generalCommands = [
    { 
      label: 'Go to Home / Landing', 
      icon: <HugeiconsIcon icon={Home01Icon} className="size-4 text-zinc-500" />,
      action: () => navigate('/') 
    },
    { 
      label: 'Go to Dashboard', 
      icon: <HugeiconsIcon icon={DashboardCircleIcon} className="size-4 text-zinc-500" />,
      action: () => navigate('/dashboard') 
    }
  ];

  const fleetCommands = [
    { 
      label: 'Manage Vehicles', 
      icon: <HugeiconsIcon icon={Car01Icon} className="size-4 text-zinc-500" />,
      action: () => navigate('/dashboard/vehicles') 
    },
    { 
      label: 'Register New Sticker', 
      icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4 text-zinc-500" />,
      action: () => navigate('/dashboard/vehicles/register') 
    }
  ];

  const preferencesCommands = [
    { 
      label: 'View Billing details', 
      icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4 text-zinc-500" />,
      action: () => navigate('/dashboard/billing') 
    },
    { 
      label: 'Open Settings Panel', 
      icon: <HugeiconsIcon icon={Settings01Icon} className="size-4 text-zinc-500" />,
      action: () => navigate('/dashboard/profile') 
    },
    { 
      label: 'Log Out of Session', 
      icon: <HugeiconsIcon icon={Logout01Icon} className="size-4 text-red-500/80" />,
      action: () => { authStore.logout(); navigate('/login'); } 
    }
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search workspace shortcuts..." />
      <CommandList className="p-2">
        <CommandEmpty>No matching workspace shortcuts found.</CommandEmpty>
        
        <CommandGroup heading="General Workspace">
          {generalCommands.map((cmd, idx) => (
            <CommandItem
              key={idx}
              onSelect={() => {
                cmd.action();
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              {cmd.icon}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Fleet Registry">
          {fleetCommands.map((cmd, idx) => (
            <CommandItem
              key={idx}
              onSelect={() => {
                cmd.action();
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              {cmd.icon}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Account Settings & Session">
          {preferencesCommands.map((cmd, idx) => (
            <CommandItem
              key={idx}
              onSelect={() => {
                cmd.action();
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              {cmd.icon}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cmd.label}</span>
              {cmd.label.includes('Log Out') && (
                <CommandShortcut className="text-red-500/80 font-mono text-[9px] uppercase font-bold">End Session</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      {/* Footer shortcut guide */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-between text-[9px] font-mono text-zinc-400 select-none">
        <span>Use ↑↓ keys to navigate</span>
      </div>
    </CommandDialog>
  );
}
