'use client';

import { useEffect, useState } from 'react';
import { getAllNPCs } from '@repo/firebase';
import { NPC } from '@repo/shared';
import NPCPortrait from '@/components/NPCPortrait';
import { ImagePreloader } from '@/services/imagePreloader';

export default function TestImagesPage() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emotion, setEmotion] = useState<'neutral' | 'positive' | 'negative'>('neutral');
  const [loadTime, setLoadTime] = useState<number>(0);
  const [preloaderStatus, setPreloaderStatus] = useState<any>({});
  
  const imagePreloader = ImagePreloader.getInstance();

  useEffect(() => {
    const loadNPCs = async () => {
      const startTime = performance.now();
      const loadedNPCs = await getAllNPCs();
      const endTime = performance.now();
      setNpcs(loadedNPCs);
      setLoadTime(endTime - startTime);
    };
    loadNPCs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPreloaderStatus(imagePreloader.getStatus());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const currentNPC = npcs[currentIndex];

  const handleNext = () => {
    const startTime = performance.now();
    setCurrentIndex((prev) => (prev + 1) % npcs.length);
    requestAnimationFrame(() => {
      const endTime = performance.now();
      console.log(`Card switch took: ${(endTime - startTime).toFixed(2)}ms`);
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + npcs.length) % npcs.length);
  };

  const handlePreloadAll = async () => {
    console.log('Starting bulk preload...');
    const allUrls = npcs.flatMap(npc => 
      Object.values(npc.portraits).filter(Boolean)
    );
    
    const startTime = performance.now();
    await imagePreloader.preloadImages(allUrls);
    const endTime = performance.now();
    
    console.log(`Preloaded ${allUrls.length} images in ${(endTime - startTime).toFixed(2)}ms`);
  };

  if (npcs.length === 0) {
    return (
      <div className="min-h-screen bg-game-bg text-game-text p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Image Loading Test</h1>
          <p>Loading NPCs... ({loadTime.toFixed(2)}ms)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg text-game-text p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Loading Optimization Test</h1>
        
        {/* Preloader Status */}
        <div className="bg-game-card p-4 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-2">Preloader Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Preloaded:</span> {preloaderStatus.preloadedCount || 0}
            </div>
            <div>
              <span className="text-gray-400">Loading:</span> {preloaderStatus.loadingCount || 0}
            </div>
            <div>
              <span className="text-gray-400">Queued:</span> {preloaderStatus.queuedCount || 0}
            </div>
            <div>
              <span className="text-gray-400">Memory:</span> {((preloaderStatus.totalSize || 0) / 1024 / 1024).toFixed(2)}MB
            </div>
          </div>
          <button
            onClick={handlePreloadAll}
            className="mt-4 px-4 py-2 bg-game-gold text-black rounded hover:bg-yellow-600 transition-colors"
          >
            Preload All Images
          </button>
        </div>

        {/* Current NPC Display */}
        {currentNPC && (
          <div className="bg-game-card p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">
              {currentNPC.name} ({currentIndex + 1}/{npcs.length})
            </h2>
            
            <NPCPortrait npc={currentNPC} emotion={emotion} />
            
            {/* Emotion Selector */}
            <div className="flex justify-center gap-4 mt-6">
              {(['neutral', 'positive', 'negative'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className={`px-4 py-2 rounded transition-colors ${
                    emotion === e
                      ? 'bg-game-gold text-black'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-game-gold text-black hover:bg-yellow-600 rounded transition-colors font-bold"
          >
            Next NPC (Test Speed)
          </button>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Optimizations Applied:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>Next.js Image component with lazy loading</li>
            <li>Image preloading service with queue management</li>
            <li>Skeleton loading states during image load</li>
            <li>Background preloading of other emotions</li>
            <li>Firebase Storage URL optimization with caching</li>
            <li>Browser link preloading for better caching</li>
            <li>Memory-efficient preload queue (max 3 concurrent)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}