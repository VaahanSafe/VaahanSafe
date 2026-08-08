import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export interface NavMainProps {
  items: NavItem[]
  title?: string
}

function NavMainCollapsibleItem({ item, currentPath }: { item: NavItem; currentPath: string }) {
  let activeSubIdx = item.items?.findIndex(sub => currentPath === sub.url);
  if (activeSubIdx === -1 || activeSubIdx === undefined) {
    activeSubIdx = item.items?.findIndex(sub => currentPath.startsWith(sub.url + '/'));
  }

  const isSomeChildActive = activeSubIdx !== -1 && activeSubIdx !== undefined;
  const [open, setOpen] = useState(Boolean(isSomeChildActive || item.isActive));

  useEffect(() => {
    if (isSomeChildActive) {
      setOpen(true);
    }
  }, [isSomeChildActive]);

  return (
    <Collapsible
      key={item.title}
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton 
            tooltip={item.title} 
            isActive={isSomeChildActive} 
          />
        }
      >
        {item.icon}
        <span>{item.title}</span>
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem, idx) => {
            const isSubActive = idx === activeSubIdx;
            return (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton 
                  render={<Link to={subItem.url} />} 
                  isActive={isSubActive}
                >
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function NavMain({ items, title = "Platform" }: NavMainProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;

          if (!hasChildren) {
            const isParentActive = item.url === '/dashboard' || item.url === '/admin'
              ? currentPath === item.url
              : currentPath === item.url || currentPath.startsWith(item.url + '/');

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  render={<Link to={item.url} />} 
                  isActive={isParentActive}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return <NavMainCollapsibleItem key={item.title} item={item} currentPath={currentPath} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
