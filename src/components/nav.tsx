"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookText, BrainCircuit, Languages, BarChart3 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export const navLinks = [
  { href: '/', label: 'Learn', icon: BookText, tooltip: 'Curriculum Q&A' },
  { href: '/math', label: 'Math', icon: BrainCircuit, tooltip: 'Math Problem Explainer' },
  { href: '/translate', label: 'Translate', icon: Languages, tooltip: 'Offline Translation' },
  { href: '/progress', label: 'Progress', icon: BarChart3, tooltip: 'Your Progress' },
];

export function AppNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {navLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            href={link.href}
            isActive={pathname === link.href}
            onClick={handleClick}
            tooltip={{ children: link.tooltip }}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
