'use client';

import { useState, useEffect } from 'react';
import { getAllCards, getAllNPCs } from '@repo/firebase';
import { Card, NPC } from '@repo/shared';
import { BarChart3, Users, CreditCard, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
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
      setCards(cardsData);
      setNpcs(npcsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const cardsByType = cards.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cardsByPriority = cards.reduce((acc, card) => {
    acc[card.priority] = (acc[card.priority] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const npcsByClass = npcs.reduce((acc, npc) => {
    acc[npc.class] = (acc[npc.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Game Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="admin-card">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Cards</p>
              <p className="text-2xl font-bold">{cards.length}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total NPCs</p>
              <p className="text-2xl font-bold">{npcs.length}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Options/Card</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Card Types</p>
              <p className="text-2xl font-bold">{Object.keys(cardsByType).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="text-xl font-semibold mb-4">Cards by Type</h2>
          <div className="space-y-2">
            {Object.entries(cardsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-400 capitalize">{type}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-semibold mb-4">Cards by Priority</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(priority => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-gray-400">
                  Priority {priority} ({priority === 1 ? 'Critical' : priority === 2 ? 'Risk' : priority === 3 ? 'Story' : 'Normal'})
                </span>
                <span className="font-bold">{cardsByPriority[priority] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-semibold mb-4">NPCs by Class</h2>
          <div className="space-y-2">
            {Object.entries(npcsByClass).map(([className, count]) => (
              <div key={className} className="flex justify-between items-center">
                <span className="text-gray-400 capitalize">{className.replace('_', ' ')}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-semibold mb-4">Content Coverage</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cards per NPC</span>
              <span className="font-bold">{npcs.length > 0 ? (cards.length / npcs.length).toFixed(1) : 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Critical Cards</span>
              <span className="font-bold">{cardsByPriority[1] || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Risk Cards</span>
              <span className="font-bold">{cardsByPriority[2] || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}