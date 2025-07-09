'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CreditCard, 
  UserCircle, 
  Settings, 
  BarChart3, 
  FileJson, 
  LogOut, 
  Shield, 
  History, 
  Menu, 
  X,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  
  // Don't show sidebar on login page
  if (pathname === '/login' || !isAuthenticated) {
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
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-admin-card rounded-lg md:hidden"
        onClick={toggleCollapsed}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-admin-card border-r border-admin-border z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isCollapsed && 'md:w-16'}
        ${!isCollapsed && 'md:w-64'}
      `}>
        {/* Header */}
        <div className="h-16 border-b border-admin-border flex items-center justify-between px-4">
          {!isCollapsed && (
            <Link href="/" className="text-lg font-bold text-admin-text">
              Fantasy Tavern
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-1.5 hover:bg-admin-bg rounded-lg transition-colors hidden md:block"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${pathname === item.href 
                      ? 'bg-admin-primary text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-admin-bg'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-admin-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Shield className="w-5 h-5 text-admin-primary flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-gray-300 truncate">
                  {user?.displayName || 'Администратор'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-600/20 transition-colors w-full"
            title={isCollapsed ? 'Выйти' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleCollapsed}
        />
      )}
    </>
  );
}