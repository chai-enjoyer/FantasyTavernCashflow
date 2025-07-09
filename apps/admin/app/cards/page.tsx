'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { Card, NPC } from '@repo/shared';
import { getAllCards, deleteCard, getAllNPCs } from '@repo/firebase';

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
      await deleteCard(cardId);
      setCards(cards.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const filteredCards = cards.filter(card => {
    if (!card || typeof card !== 'object') return false;
    const matchesTitle = card.title && typeof card.title === 'string' && 
                        card.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSituation = card.situation && typeof card.situation === 'string' && 
                            card.situation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTitle || matchesSituation;
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск карт..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-10"
          />
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