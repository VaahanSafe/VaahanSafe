import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon, SparklesIcon, CheckmarkBadgeIcon, CreditCardIcon, NotificationIcon, LogoutIcon, Shield01Icon } from "@hugeicons/core-free-icons"

import { authStore } from "@/store/authStore"
import SettingsModal from "@/components/settings/SettingsModal"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'security' | 'billing' | 'notifications' | 'privacy'>('general');

  const getInitials = (name: string) => {
    if (!name) return "U";
    // Check if name is a phone number
    if (/^\+?[0-9\s\-()]+$/.test(name)) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
              }
            >
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-brand/10 text-brand font-bold uppercase text-[10px] flex items-center justify-center size-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-fit"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-brand/10 text-brand font-bold uppercase text-[10px] flex items-center justify-center size-full">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => {
                  setSettingsTab('billing');
                  setSettingsOpen(true);
                }}>
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => {
                  setSettingsTab('general');
                  setSettingsOpen(true);
                }}>
                  <HugeiconsIcon icon={CheckmarkBadgeIcon} strokeWidth={2} />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSettingsTab('billing');
                  setSettingsOpen(true);
                }}>
                  <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSettingsTab('notifications');
                  setSettingsOpen(true);
                }}>
                  <HugeiconsIcon icon={NotificationIcon} strokeWidth={2} />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSettingsTab('privacy');
                  setSettingsOpen(true);
                }}>
                  <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} />
                  Privacy & Data
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => authStore.logout()}>
                <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        defaultTab={settingsTab} 
      />
    </>
  )
}
