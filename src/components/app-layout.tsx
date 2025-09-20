import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { AppNav } from '@/components/nav';
import { type PropsWithChildren } from 'react';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between p-2">
              <div className="group-data-[collapsible=icon]:hidden">
                <Logo />
              </div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AppNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
                <SidebarTrigger />
                <Logo />
            </header>
            <div className="p-2 sm:p-4 lg:p-6">
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
