'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, UserCircle, Settings, BarChart3, FileJson, LogOut, Shield, History, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }
  
  // Don't show navigation if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  const navItems = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/cards', label: 'Карты', icon: CreditCard },
    { href: '/npcs', label: 'НПС', icon: UserCircle },
    { href: '/config', label: 'Настройки', icon: Settings },
    { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
    { href: '/import-export', label: 'Импорт/Экспорт', icon: FileJson },
    { href: '/logs', label: 'Журнал', icon: History },
  ];

  return (
    <nav className="bg-admin-card border-b border-admin-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg md:text-xl font-bold text-admin-text flex-shrink-0">
            <span className="hidden sm:inline">Администрирование Fantasy Tavern</span>
            <span className="sm:hidden">Fantasy Tavern</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <nav className="flex items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md transition-colors text-sm ${
                    pathname === item.href
                      ? 'bg-admin-primary text-white'
                      : 'text-gray-400 hover:text-admin-text hover:bg-admin-bg'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-700">
              <div className="hidden lg:flex items-center gap-2">
                <Shield className="w-4 h-4 text-admin-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300 leading-tight">
                    {user?.displayName || 'Администратор'}
                  </span>
                  <span className="text-xs text-gray-500 leading-tight">
                    {user?.email}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-red-600/20 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Выйти</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-admin-text hover:bg-admin-bg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-admin-primary text-white'
                      : 'text-gray-400 hover:text-admin-text hover:bg-admin-bg'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="border-t border-gray-700 mt-2 pt-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Shield className="w-5 h-5 text-admin-primary" />
                  <div>
                    <div className="text-sm text-gray-300">{user?.displayName || 'Администратор'}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-red-600/20 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}