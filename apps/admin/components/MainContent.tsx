'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <main className={`
      min-h-screen transition-all duration-300
      ${isCollapsed ? 'pl-16' : 'pl-64'}
      pt-16 md:pt-0
    `}>
      {children}
    </main>
  );
}