import * as React from "react"
import { useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  DashboardCircleIcon, 
  Car01Icon, 
  CreditCardIcon, 
  Notification01Icon
} from "@hugeicons/core-free-icons"

import vaahanLogo from "@/assets/logo.svg"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { phone, owner } = useAuthStore();
  const location = useLocation();

  const userNavMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <HugeiconsIcon icon={DashboardCircleIcon} strokeWidth={2} />,
      isActive: location.pathname === '/dashboard',
    },
    {
      title: "Vehicles",
      url: "/dashboard/vehicles",
      icon: <HugeiconsIcon icon={Car01Icon} strokeWidth={2} />,
      items: [
        { title: "My Fleet", url: "/dashboard/vehicles" },
        { title: "Register Sticker", url: "/dashboard/vehicles/register" }
      ]
    },
    {
      title: "Billing & Plans",
      url: "/dashboard/billing",
      icon: <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />,
      isActive: location.pathname === '/dashboard/notifications',
    }
  ];

  const data = {
    user: {
      name: owner?.full_name || owner?.name || phone || "Authorized Owner",
      email: owner?.email || "secure@vaahansafe.com",
      avatar: "",
    },
    teams: [
      {
        name: "VaahanSafe",
        logo: <img src={vaahanLogo} alt="VaahanSafe" className="size-6 shrink-0 object-contain" />,
        plan: "Secured Windshield",
      }
    ],
    navMain: userNavMain
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
