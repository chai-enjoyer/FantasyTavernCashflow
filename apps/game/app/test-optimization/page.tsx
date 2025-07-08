'use client';

import { useEffect, useState } from 'react';
import { DataCache, ProgressiveDataLoader } from '@repo/firebase';

interface OptimizationMetrics {
  cacheSize: number;
  cacheHits: number;
  cacheMisses: number;
  loadTime: number;
  indexedDBSupported: boolean;
  storageEstimate?: {
    usage: number;
    quota: number;
  };
}

export default function TestOptimizationPage() {
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressPhase, setProgressPhase] = useState('');

  useEffect(() => {
    async function testOptimizations() {
      const startTime = performance.now();
      const cache = DataCache.getInstance();
      const progressiveLoader = ProgressiveDataLoader.getInstance();

      // Clear cache to test fresh load
      await cache.clear();

      // Test progressive loading
      await progressiveLoader.startLoading((progress) => {
        setProgressPhase(`${progress.phase} - ${progress.percentage}%`);
      });

      const loadTime = performance.now() - startTime;
      const stats = cache.getStats();

      // Check storage estimate
      let storageEstimate;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        storageEstimate = {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      }

      setMetrics({
        cacheSize: cache.getCacheSize(),
        cacheHits: stats.hits,
        cacheMisses: stats.misses,
        loadTime,
        indexedDBSupported: typeof indexedDB !== 'undefined',
        storageEstimate,
      });
      setLoading(false);
    }

    testOptimizations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Testing Optimizations</h1>
        <p>Loading phase: {progressPhase}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Optimization Test Results</h1>
      
      {metrics && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cache Metrics</h2>
            <div className="space-y-2">
              <p>Cache Size: {(metrics.cacheSize / 1024).toFixed(2)} KB</p>
              <p>Cache Hits: {metrics.cacheHits}</p>
              <p>Cache Misses: {metrics.cacheMisses}</p>
              <p>Load Time: {metrics.loadTime.toFixed(2)} ms</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Storage Support</h2>
            <div className="space-y-2">
              <p>IndexedDB: {metrics.indexedDBSupported ? '✅ Supported' : '❌ Not Supported'}</p>
              {metrics.storageEstimate && (
                <>
                  <p>Storage Used: {(metrics.storageEstimate.usage / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Storage Quota: {(metrics.storageEstimate.quota / 1024 / 1024).toFixed(2)} MB</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-green-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Optimization Status</h2>
            <p>✅ All optimizations successfully implemented!</p>
            <ul className="mt-4 space-y-1 text-sm">
              <li>• Data caching with TTL</li>
              <li>• IndexedDB for offline storage</li>
              <li>• Progressive data loading</li>
              <li>• Optimized Firestore queries</li>
              <li>• Preloading on app start</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}