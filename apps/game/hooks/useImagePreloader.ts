'use client';

import { useEffect } from 'react';
import { ImagePreloader } from '@/services/imagePreloader';
import { DataCache } from '@repo/firebase';

export function useImagePreloader() {
  useEffect(() => {
    const preloader = ImagePreloader.getInstance();
    const cache = DataCache.getInstance();
    
    // Preload top priority NPC portraits
    const preloadTopNPCPortraits = async () => {
      const npcs = cache.getNPCs();
      if (!npcs || npcs.length === 0) return;
      
      // Sort NPCs by their occurrence in cards (most used first)
      const cards = cache.getCards();
      const npcUsage = new Map<string, number>();
      
      if (cards) {
        cards.forEach(card => {
          const count = npcUsage.get(card.npcId) || 0;
          npcUsage.set(card.npcId, count + 1);
        });
      }
      
      const sortedNPCs = [...npcs].sort((a, b) => {
        const aUsage = npcUsage.get(a.id) || 0;
        const bUsage = npcUsage.get(b.id) || 0;
        return bUsage - aUsage;
      });
      
      // Preload neutral portraits for top 10 NPCs
      const topNPCs = sortedNPCs.slice(0, 10);
      const neutralPortraits = topNPCs
        .map(npc => npc.portraits.neutral)
        .filter(Boolean);
      
      console.log(`🖼️ Preloading ${neutralPortraits.length} top NPC portraits...`);
      await preloader.preloadImages(neutralPortraits);
      
      // Queue other emotions for background loading
      topNPCs.forEach(npc => {
        const otherPortraits = [
          npc.portraits.positive,
          npc.portraits.negative
        ].filter(Boolean);
        preloader.queueForPreload(otherPortraits);
      });
    };
    
    // Start preloading after a short delay to not block initial render
    const timeoutId = setTimeout(() => {
      preloadTopNPCPortraits();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
}