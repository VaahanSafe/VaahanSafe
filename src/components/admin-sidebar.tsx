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
  Shield01Icon,
  LeftToRightListDashIcon,
  UserGroupIcon,
  Alert02Icon,
  Calendar03Icon
} from "@hugeicons/core-free-icons"

import vaahanLogo from "@/assets/logo.svg"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { phone } = useAuthStore();
  const location = useLocation();

  const adminNavMain = [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} />,
      isActive: location.pathname === '/admin',
    },
    {
      title: "Scan & Alert Logs",
      url: "/admin/scans",
      icon: <HugeiconsIcon icon={LeftToRightListDashIcon} strokeWidth={2} />,
      items: [
        { title: "QR Scan Activity", url: "/admin/scans" },
        { title: "Flagged Incident Scans", url: "/admin/scans/flagged" }
      ]
    },
    {
      title: "Owners & Vehicles",
      url: "/admin/owners",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
      items: [
        { title: "Vehicle Owners", url: "/admin/owners" },
        { title: "Sticker Fleet Registry", url: "/admin/vehicles" }
      ]
    },
    {
      title: "Failure Diagnostics",
      url: "/admin/alert-failures",
      icon: <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />,
      items: [
        { title: "Alert Failures", url: "/admin/alert-failures" },
        { title: "Dead-Letter Queue", url: "/admin/dead-letter" },
        { title: "Abuse Reports", url: "/admin/abuse-reports" }
      ]
    },
    {
      title: "System Audit",
      url: "/admin/audit-log",
      icon: <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />,
    }
  ];

  const data = {
    user: {
      name: "System Operator",
      email: phone ? `operator (${phone})` : "operator@vaahansafe.com",
      avatar: "",
    },
    teams: [
      {
        name: "Operator Board",
        logo: <img src={vaahanLogo} alt="VaahanSafe" className="size-6 shrink-0 object-contain" />,
        plan: "System Privilege Level 1",
      }
    ],
    navMain: adminNavMain
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
