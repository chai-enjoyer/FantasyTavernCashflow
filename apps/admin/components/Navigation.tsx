'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, UserCircle, Settings, BarChart3, FileJson, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  
  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }
  
  // Don't show navigation if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/cards', label: 'Cards', icon: CreditCard },
    { href: '/npcs', label: 'NPCs', icon: UserCircle },
    { href: '/config', label: 'Config', icon: Settings },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/import-export', label: 'Import/Export', icon: FileJson },
  ];

  return (
    <nav className="bg-admin-card border-b border-admin-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-admin-text">
            Fantasy Tavern Admin
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-admin-primary text-white'
                      : 'text-gray-400 hover:text-admin-text hover:bg-admin-bg'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
              <Shield className="w-4 h-4 text-admin-primary" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 hidden md:inline">
                  {user?.displayName || 'Admin'}
                </span>
                <span className="text-xs text-gray-500 hidden md:inline">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-400 hover:text-admin-text hover:bg-admin-bg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}