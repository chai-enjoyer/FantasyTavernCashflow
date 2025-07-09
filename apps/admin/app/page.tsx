'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  UserCircle, 
  Settings,
  BarChart3,
  FileJson,
  History,
  Activity
} from 'lucide-react';
import { getRecentActivity, ActivityLog } from '@repo/firebase';

export default function AdminDashboard() {
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  
  useEffect(() => {
    loadRecentActivity();
  }, []);
  
  const loadRecentActivity = async () => {
    try {
      const logs = await getRecentActivity(5);
      setRecentLogs(logs);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoadingLogs(false);
    }
  };
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
    {
      title: 'Журнал активности',
      description: 'Просмотр всех изменений и действий',
      icon: History,
      href: '/logs',
      color: 'bg-indigo-500',
    },
  ];
  
  const formatTimestamp = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };
  
  const getActionLabel = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create': return 'Создание';
      case 'update': return 'Обновление';
      case 'delete': return 'Удаление';
      case 'import': return 'Импорт';
      case 'export': return 'Экспорт';
      case 'login': return 'Вход';
      case 'logout': return 'Выход';
      default: return action;
    }
  };

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
      
      {/* Recent Activity Widget */}
      <div className="mt-8">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-admin-primary" />
              Последняя активность
            </h2>
            <Link href="/logs" className="text-admin-primary hover:underline text-sm">
              Показать все →
            </Link>
          </div>
          
          {loadingLogs ? (
            <div className="text-center py-4 text-gray-400">Загрузка...</div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-4 text-gray-400">Нет активности</div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-admin-bg rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-300">{log.userEmail}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-admin-primary">{getActionLabel(log.action)}</span>
                      {log.entityName && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-300">{log.entityName}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}