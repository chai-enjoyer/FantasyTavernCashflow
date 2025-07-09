'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { NPC } from '@repo/shared';
import { getAllNPCs, deleteNPC } from '@repo/firebase';

export default function NPCsPage() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);

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
    
    try {
      await deleteNPC(npcId);
      setNpcs(npcs.filter(n => n.id !== npcId));
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление НПС</h1>
        <Link href="/npcs/new" className="admin-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Новый НПС
        </Link>
      </div>

      <div className="grid gap-4">
        {npcs.map((npc) => (
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

      {npcs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          НПС ещё не созданы.
        </div>
      )}
    </div>
  );
}