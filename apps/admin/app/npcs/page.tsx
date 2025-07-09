'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { NPC, NPCClass } from '@repo/shared';
import { getAllNPCs, deleteNPC } from '@repo/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function NPCsPage() {
  const { user } = useAuth();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<NPCClass | 'all'>('all');
  const [wealthFilter, setWealthFilter] = useState<number | 'all'>('all');
  const [reliabilityFilter, setReliabilityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const npcClasses: NPCClass[] = [
    'commoner', 'merchant', 'noble', 'adventurer', 'criminal', 'guard', 'cleric', 'mage', 'royal', 'crime_boss', 'dragon',
    'bard', 'alchemist', 'dwarf', 'elf', 'halfling', 'orc', 'vampire', 'pirate', 'monk', 'witch', 'knight',
    'necromancer', 'barbarian', 'artisan', 'scholar', 'blacksmith', 'hunter', 'sailor', 'healer', 'beggar',
    'artist', 'official', 'mystic'
  ];

  useEffect(() => {
    loadNPCs();
  }, []);

  const loadNPCs = async () => {
    try {
      const npcsData = await getAllNPCs();
      setNpcs(npcsData);
    } catch (error) {
      console.error('Error loading NPCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (npcId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого НПС?')) return;
    
    console.log('=== handleDelete called ===', { npcId, user });
    
    try {
      const userInfo = user ? { userId: user.uid, userEmail: user.email || 'unknown' } : undefined;
      console.log('=== Calling deleteNPC with userInfo ===', { npcId, userInfo });
      await deleteNPC(npcId, userInfo);
      setNpcs(npcs.filter(n => n.id !== npcId));
      console.log('=== NPC deleted from UI ===');
    } catch (error) {
      console.error('Error deleting NPC:', error);
    }
  };

  const getClassColor = (npcClass: NPC['class']) => {
    const colors: Record<NPC['class'], string> = {
      commoner: 'text-gray-400',
      merchant: 'text-emerald-500',
      noble: 'text-purple-500',
      adventurer: 'text-blue-500',
      criminal: 'text-red-500',
      guard: 'text-slate-500',
      cleric: 'text-green-500',
      mage: 'text-indigo-500',
      royal: 'text-yellow-500',
      crime_boss: 'text-orange-500',
      dragon: 'text-pink-500',
      bard: 'text-cyan-500',
      alchemist: 'text-teal-500',
      dwarf: 'text-amber-600',
      elf: 'text-green-400',
      halfling: 'text-lime-500',
      orc: 'text-red-700',
      vampire: 'text-red-800',
      pirate: 'text-blue-600',
      monk: 'text-orange-400',
      witch: 'text-purple-600',
      knight: 'text-blue-700',
      necromancer: 'text-gray-800',
      barbarian: 'text-red-600',
      artisan: 'text-yellow-600',
      scholar: 'text-blue-400',
      blacksmith: 'text-gray-600',
      hunter: 'text-green-600',
      sailor: 'text-blue-500',
      healer: 'text-green-400',
      beggar: 'text-gray-500',
      artist: 'text-pink-400',
      official: 'text-slate-600',
      mystic: 'text-purple-400',
    };
    return colors[npcClass] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  // Filter NPCs based on search and filters
  const filteredNPCs = npcs.filter(npc => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Class filter
    const matchesClass = selectedClass === 'all' || npc.class === selectedClass;
    
    // Wealth filter
    const matchesWealth = wealthFilter === 'all' || npc.wealth === wealthFilter;
    
    // Reliability filter
    const matchesReliability = reliabilityFilter === 'all' ||
      (reliabilityFilter === 'low' && npc.reliability < 40) ||
      (reliabilityFilter === 'medium' && npc.reliability >= 40 && npc.reliability < 70) ||
      (reliabilityFilter === 'high' && npc.reliability >= 70);
    
    return matchesSearch && matchesClass && matchesWealth && matchesReliability;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление НПС</h1>
        <Link href="/npcs/new" className="admin-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Новый НПС
        </Link>
      </div>

      {/* Statistics Summary */}
      {npcs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-admin-primary">{npcs.length}</div>
            <div className="text-sm text-gray-400">Всего НПС</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {Math.round(npcs.reduce((sum, npc) => sum + npc.reliability, 0) / npcs.length)}%
            </div>
            <div className="text-sm text-gray-400">Средняя надёжность</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {(npcs.reduce((sum, npc) => sum + npc.wealth, 0) / npcs.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Среднее богатство</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {Array.from(new Set(npcs.map(npc => npc.class))).length}
            </div>
            <div className="text-sm text-gray-400">Уникальных классов</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по имени, описанию или ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`admin-button ${showFilters ? 'bg-admin-primary' : ''} flex items-center gap-2`}
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
        
        {showFilters && (
          <div className="admin-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Класс НПС
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as NPCClass | 'all')}
                className="admin-input w-full"
              >
                <option value="all">Все классы</option>
                {npcClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls.charAt(0).toUpperCase() + cls.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Богатство
              </label>
              <select
                value={wealthFilter}
                onChange={(e) => setWealthFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="admin-input w-full"
              >
                <option value="all">Любое богатство</option>
                <option value="0">⭐ Нищий (0)</option>
                <option value="1">⭐ Бедный (1)</option>
                <option value="2">⭐⭐ Скромный (2)</option>
                <option value="3">⭐⭐⭐ Зажиточный (3)</option>
                <option value="4">⭐⭐⭐⭐ Богатый (4)</option>
                <option value="5">⭐⭐⭐⭐⭐ Очень богатый (5)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Надёжность
              </label>
              <select
                value={reliabilityFilter}
                onChange={(e) => setReliabilityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                className="admin-input w-full"
              >
                <option value="all">Любая надёжность</option>
                <option value="low">Низкая (0-39%)</option>
                <option value="medium">Средняя (40-69%)</option>
                <option value="high">Высокая (70-100%)</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Найдено: {filteredNPCs.length} из {npcs.length} НПС
          </span>
          {(searchTerm || selectedClass !== 'all' || wealthFilter !== 'all' || reliabilityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('all');
                setWealthFilter('all');
                setReliabilityFilter('all');
              }}
              className="text-admin-primary hover:underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredNPCs.map((npc) => (
          <div key={npc.id} className="admin-card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold">{npc.name}</h3>
                  <span className={`text-sm font-medium ${getClassColor(npc.class)}`}>
                    {npc.class}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Богатство:</span>{' '}
                    <span className="text-game-gold">{'⭐'.repeat(npc.wealth)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Надёжность:</span>{' '}
                    <span className="text-admin-text">{npc.reliability}%</span>
                  </div>
                </div>

                {npc.description && (
                  <p className="text-gray-400 mt-2">{npc.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-admin-bg p-2 rounded text-center">
                    <span className="text-xs text-gray-400">Нейтральный</span>
                    {npc.portraits.neutral ? '✓' : '✗'}
                  </div>
                  <div className="bg-admin-bg p-2 rounded text-center">
                    <span className="text-xs text-gray-400">Позитивный</span>
                    {npc.portraits.positive ? '✓' : '✗'}
                  </div>
                  <div className="bg-admin-bg p-2 rounded text-center">
                    <span className="text-xs text-gray-400">Негативный</span>
                    {npc.portraits.negative ? '✓' : '✗'}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/npcs/edit?id=${npc.id}`}
                  className="p-2 hover:bg-admin-bg rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(npc.id)}
                  className="p-2 hover:bg-admin-bg rounded transition-colors text-admin-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNPCs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {npcs.length === 0 ? 'НПС ещё не созданы.' : 'Не найдено НПС, соответствующих фильтрам.'}
        </div>
      )}
    </div>
  );
}