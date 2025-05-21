'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/Logo';
import { LayoutDashboard, Archive, ShoppingBag, UserCircle, Settings, LogOut, Wand2 as QuickCounterIcon } from 'lucide-react'; // Changed Paintbrush to Wand2 and used an alias
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Archive },
  { href: '/restock', label: 'Restock Suggestions', icon: ShoppingBag },
  { href: '/quick-counter', label: 'Quick Counter', icon: QuickCounterIcon }, // Updated href and label, changed icon
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center justify-between">
        <Logo />
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Placeholder for user profile/settings - RBAC related */}
        <SidebarMenu>
           <SidebarMenuItem>
                <SidebarMenuButton className="justify-start" tooltip="Profile">
                    <UserCircle className="h-5 w-5" />
                    <span>User Name</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton className="justify-start" tooltip="Settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                 </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
