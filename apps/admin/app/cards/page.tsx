'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { Card, NPC, CardType } from '@repo/shared';
import { getAllCards, deleteCard, getAllNPCs } from '@repo/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<CardType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<number | 'all'>('all');
  const [selectedNpc, setSelectedNpc] = useState<string>('all');
  
  const cardTypes: CardType[] = ['immediate', 'passive_income', 'debt', 'social', 'modifier'];
  const cardCategories = [
    'service', 'business', 'entertainment', 'incident', 'legal', 'social', 'event', 
    'unusual', 'goods', 'crisis', 'information', 'illegal', 'decoration', 'upgrade', 
    'reputation', 'spiritual', 'magical', 'mystical', 'corruption', 'conflict',
    'moral', 'threat', 'underworld', 'royal', 'legendary'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardsData, npcsData] = await Promise.all([
        getAllCards(),
        getAllNPCs(),
      ]);
      
      // Filter out invalid cards
      const validCards = cardsData.filter(card => 
        card && 
        typeof card === 'object' && 
        card.id &&
        card.title &&
        card.type &&
        card.options &&
        Array.isArray(card.options)
      );
      
      setCards(validCards);
      setNpcs(npcsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту карту?')) return;
    
    try {
      const userInfo = user ? { userId: user.uid, userEmail: user.email || 'unknown' } : undefined;
      await deleteCard(cardId, userInfo);
      setCards(cards.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const filteredCards = cards.filter(card => {
    if (!card || typeof card !== 'object') return false;
    
    // Search filter
    const matchesSearch = searchTerm === '' ||
      (card.title && typeof card.title === 'string' && card.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.situation && typeof card.situation === 'string' && card.situation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.description && typeof card.description === 'string' && card.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.id && card.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = selectedType === 'all' || card.type === selectedType;
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    
    // Priority filter
    const matchesPriority = selectedPriority === 'all' || card.priority === selectedPriority;
    
    // NPC filter
    const matchesNpc = selectedNpc === 'all' || card.npcId === selectedNpc;
    
    return matchesSearch && matchesType && matchesCategory && matchesPriority && matchesNpc;
  });

  const getNPCName = (npcId: string) => {
    const npc = npcs.find(n => n.id === npcId);
    return npc?.name || 'Неизвестный НПС';
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Критический';
      case 2: return 'Рисковый';
      case 3: return 'Сюжетный';
      case 4: return 'Обычный';
      default: return 'Неизвестный';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление картами</h1>
        <Link href="/cards/new" className="admin-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Новая карта
        </Link>
      </div>

      {/* Statistics Summary */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-admin-primary">{cards.length}</div>
            <div className="text-sm text-gray-400">Всего карт</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Array.from(new Set(cards.map(card => card.type))).length}
            </div>
            <div className="text-sm text-gray-400">Типов карт</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {Array.from(new Set(cards.map(card => card.category))).length}
            </div>
            <div className="text-sm text-gray-400">Категорий</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-cyan-500">
              {Array.from(new Set(cards.map(card => card.npcId))).length}
            </div>
            <div className="text-sm text-gray-400">Связанных НПС</div>
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
              placeholder="Поиск по названию, ситуации или ID..."
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
          <div className="admin-card p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Тип карты
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as CardType | 'all')}
                className="admin-input w-full"
              >
                <option value="all">Все типы</option>
                <option value="immediate">Немедленная</option>
                <option value="passive_income">Пассивный доход</option>
                <option value="debt">Долг</option>
                <option value="social">Социальная</option>
                <option value="modifier">Модификатор</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Категория
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="admin-input w-full"
              >
                <option value="all">Все категории</option>
                {cardCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Приоритет
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="admin-input w-full"
              >
                <option value="all">Любой приоритет</option>
                <option value="1">Критический (1)</option>
                <option value="2">Рисковый (2)</option>
                <option value="3">Сюжетный (3)</option>
                <option value="4">Обычный (4)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                НПС
              </label>
              <select
                value={selectedNpc}
                onChange={(e) => setSelectedNpc(e.target.value)}
                className="admin-input w-full"
              >
                <option value="all">Все НПС</option>
                {npcs.map(npc => (
                  <option key={npc.id} value={npc.id}>
                    {npc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Найдено: {filteredCards.length} из {cards.length} карт
          </span>
          {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedNpc !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSelectedNpc('all');
              }}
              className="text-admin-primary hover:underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCards.map((card) => (
          <div key={card.id} className="admin-card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold">{card.title || 'Без названия'}</h3>
                  <span className={`text-sm font-medium ${getPriorityColor(card.priority || 4)}`}>
                    {getPriorityLabel(card.priority || 4)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {card.type || 'неизвестный'}
                  </span>
                </div>
                <p className="text-gray-400 mb-2">{getNPCName(card.npcId || '')}</p>
                <p className="text-admin-text mb-4">{card.situation || 'Описание отсутствует'}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {card.options && Array.isArray(card.options) ? card.options.map((option, idx) => (
                    <div key={idx} className="bg-admin-bg p-2 rounded">
                      <span className="text-gray-400">Вариант {idx + 1}:</span> {option?.text || 'Нет текста'}
                    </div>
                  )) : <div className="text-gray-400">Нет доступных вариантов</div>}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/cards/edit?id=${card.id}`}
                  className="p-2 hover:bg-admin-bg rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-2 hover:bg-admin-bg rounded transition-colors text-admin-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {searchTerm ? 'Не найдено карт, соответствующих запросу.' : 'Карты ещё не созданы.'}
        </div>
      )}
    </div>
  );
}