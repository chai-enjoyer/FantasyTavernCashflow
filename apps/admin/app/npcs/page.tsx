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
    if (!confirm('Are you sure you want to delete this NPC?')) return;
    
    try {
      await deleteNPC(npcId);
      setNpcs(npcs.filter(n => n.id !== npcId));
    } catch (error) {
      console.error('Error deleting NPC:', error);
    }
  };

  const getClassColor = (npcClass: NPC['class']) => {
    const colors = {
      commoner: 'text-gray-400',
      adventurer: 'text-blue-500',
      criminal: 'text-red-500',
      noble: 'text-purple-500',
      royal: 'text-yellow-500',
      cleric: 'text-green-500',
      mage: 'text-indigo-500',
      crime_boss: 'text-orange-500',
      dragon: 'text-pink-500',
    };
    return colors[npcClass] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">NPCs Management</h1>
        <Link href="/npcs/new" className="admin-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New NPC
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
                    <span className="text-gray-400">Wealth:</span>{' '}
                    <span className="text-game-gold">{'⭐'.repeat(npc.wealth)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Reliability:</span>{' '}
                    <span className="text-admin-text">{npc.reliability}%</span>
                  </div>
                </div>

                {npc.description && (
                  <p className="text-gray-400 mt-2">{npc.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-admin-bg p-2 rounded text-center">
                    <span className="text-xs text-gray-400">Neutral</span>
                    {npc.portraits.neutral ? '✓' : '✗'}
                  </div>
                  <div className="bg-admin-bg p-2 rounded text-center">
                    <span className="text-xs text-gray-400">Positive</span>
                    {npc.portraits.positive ? '✓' : '✗'}
                  </div>
                  <div className="bg-admin-bg p-2 rounded text-center">
                    <span className="text-xs text-gray-400">Negative</span>
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
          No NPCs created yet.
        </div>
      )}
    </div>
  );
}