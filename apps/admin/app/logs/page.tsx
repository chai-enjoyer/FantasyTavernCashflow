'use client';

import { useState, useEffect } from 'react';
import { History, Filter, Calendar, User, FileText, Package, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActivityLogs, ActivityLog } from '@repo/firebase';
import { DocumentSnapshot } from 'firebase/firestore';

type FilterAction = ActivityLog['action'] | 'all';
type FilterEntityType = ActivityLog['entityType'] | 'all';

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [actionFilter, setActionFilter] = useState<FilterAction>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<FilterEntityType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  useEffect(() => {
    loadLogs();
  }, [actionFilter, entityTypeFilter, startDate, endDate]);

  const loadLogs = async (append = false) => {
    try {
      setLoading(true);
      
      const filters = {
        action: actionFilter !== 'all' ? actionFilter : undefined,
        entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate + 'T23:59:59') : undefined,
      };
      
      const result = await getActivityLogs(
        filters,
        append && lastDoc ? lastDoc : undefined
      );
      
      if (append) {
        setLogs(prev => [...prev, ...result.logs]);
      } else {
        setLogs(result.logs);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.logs.length === 50); // Assuming 50 is the page size
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadLogs(true);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(date);
  };

  const getActionIcon = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create': return '+';
      case 'update': return '✏';
      case 'delete': return '🗑';
      case 'import': return '📥';
      case 'export': return '📤';
      case 'login': return '🔑';
      case 'logout': return '🚪';
      default: return '•';
    }
  };

  const getActionColor = (action: ActivityLog['action']) => {
    switch (action) {
      case 'create': return 'text-green-500';
      case 'update': return 'text-blue-500';
      case 'delete': return 'text-red-500';
      case 'import': return 'text-purple-500';
      case 'export': return 'text-cyan-500';
      case 'login': return 'text-yellow-500';
      case 'logout': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getEntityTypeLabel = (type: ActivityLog['entityType']) => {
    switch (type) {
      case 'npc': return 'НПС';
      case 'card': return 'Карта';
      case 'config': return 'Конфигурация';
      case 'bulk': return 'Массовая операция';
      case 'auth': return 'Авторизация';
      default: return type;
    }
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

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка журнала...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-admin-primary" />
          <h1 className="text-3xl font-bold">Журнал активности</h1>
        </div>
        <button
          onClick={exportLogs}
          className="admin-button flex items-center gap-2"
          disabled={logs.length === 0}
        >
          <Download className="w-4 h-4" />
          Экспорт
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`admin-button ${showFilters ? 'bg-admin-primary' : ''} flex items-center gap-2`}
        >
          <Filter className="w-4 h-4" />
          Фильтры
        </button>
        
        {showFilters && (
          <div className="admin-card p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Действие
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as FilterAction)}
                className="admin-input w-full"
              >
                <option value="all">Все действия</option>
                <option value="create">Создание</option>
                <option value="update">Обновление</option>
                <option value="delete">Удаление</option>
                <option value="import">Импорт</option>
                <option value="export">Экспорт</option>
                <option value="login">Вход</option>
                <option value="logout">Выход</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Тип объекта
              </label>
              <select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value as FilterEntityType)}
                className="admin-input w-full"
              >
                <option value="all">Все типы</option>
                <option value="npc">НПС</option>
                <option value="card">Карты</option>
                <option value="config">Конфигурация</option>
                <option value="bulk">Массовые операции</option>
                <option value="auth">Авторизация</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="admin-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата окончания
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="admin-input w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Logs table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left">
                <th className="px-4 py-3 text-gray-300 font-medium">Время</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Пользователь</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Действие</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Объект</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Детали</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800 hover:bg-admin-bg/50">
                  <td className="px-4 py-3 text-sm">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{log.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center gap-1 ${getActionColor(log.action)}`}>
                      <span>{getActionIcon(log.action)}</span>
                      <span>{getActionLabel(log.action)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <span className="text-gray-400">{getEntityTypeLabel(log.entityType)}</span>
                      {log.entityName && (
                        <div className="text-gray-300 font-medium">{log.entityName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {log.changes && log.changes.length > 0 && (
                      <details className="cursor-pointer">
                        <summary className="text-gray-400 hover:text-gray-300">
                          {log.changes.length} изменений
                        </summary>
                        <div className="mt-2 space-y-1">
                          {log.changes.map((change, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="text-gray-500">{change.field}:</span>{' '}
                              <span className="text-red-400 line-through">{JSON.stringify(change.oldValue)}</span>{' '}
                              →{' '}
                              <span className="text-green-400">{JSON.stringify(change.newValue)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {log.details && (
                      <div className="text-xs text-gray-400">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key}>
                            {key}: {JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Нет записей в журнале
          </div>
        )}
        
        {hasMore && logs.length > 0 && (
          <div className="p-4 text-center border-t border-gray-700">
            <button
              onClick={loadMore}
              disabled={loading}
              className="admin-button inline-flex items-center gap-2"
            >
              {loading ? (
                <>Загрузка...</>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Загрузить ещё
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}