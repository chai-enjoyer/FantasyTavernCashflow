'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ClientOnly from '@/components/ClientOnly';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  // Wrap all other pages in ClientOnly to prevent static rendering of protected content
  return (
    <ClientOnly>
      <ProtectedRoute>{children}</ProtectedRoute>
    </ClientOnly>
  );
}