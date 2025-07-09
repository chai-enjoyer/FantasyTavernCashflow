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
      title: 'Управление картами',
      description: 'Создавайте и управляйте игровыми картами',
      icon: CreditCard,
      href: '/cards',
      color: 'bg-blue-500',
    },
    {
      title: 'Управление НПС',
      description: 'Управляйте неигровыми персонажами',
      icon: UserCircle,
      href: '/npcs',
      color: 'bg-green-500',
    },
    {
      title: 'Конфигурация игры',
      description: 'Настройте параметры игры',
      icon: Settings,
      href: '/config',
      color: 'bg-purple-500',
    },
    {
      title: 'Аналитика',
      description: 'Просмотр статистики игры',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500',
    },
    {
      title: 'Импорт/Экспорт',
      description: 'Управляйте игровым контентом',
      icon: FileJson,
      href: '/import-export',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Администрирование Fantasy Tavern</h1>
        <p className="text-gray-400">Управляйте контентом и настройками игры</p>
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