'use client';

import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  UserCircle, 
  Settings,
  BarChart3,
  FileJson
} from 'lucide-react';

export default function AdminDashboard() {
  const menuItems = [
    {
      title: 'Cards Management',
      description: 'Create and manage game cards',
      icon: CreditCard,
      href: '/cards',
      color: 'bg-blue-500',
    },
    {
      title: 'NPCs Management',
      description: 'Manage non-player characters',
      icon: UserCircle,
      href: '/npcs',
      color: 'bg-green-500',
    },
    {
      title: 'Game Configuration',
      description: 'Configure game settings',
      icon: Settings,
      href: '/config',
      color: 'bg-purple-500',
    },
    {
      title: 'Analytics',
      description: 'View game statistics',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500',
    },
    {
      title: 'Import/Export',
      description: 'Manage game content',
      icon: FileJson,
      href: '/import-export',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fantasy Tavern Admin</h1>
        <p className="text-gray-400">Manage your game content and configuration</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="admin-card hover:border-admin-primary transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-400">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}