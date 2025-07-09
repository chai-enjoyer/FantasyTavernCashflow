'use client';

import { NPC } from '@repo/shared';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageSkeleton from './ImageSkeleton';
import { ImagePreloader } from '@/services/imagePreloader';
import { ImageCachingService } from '@repo/firebase';

interface NPCPortraitProps {
  npc: NPC;
  emotion: 'neutral' | 'positive' | 'negative';
  preloadOtherEmotions?: boolean;
}

export default function NPCPortrait({ npc, emotion, preloadOtherEmotions = true }: NPCPortraitProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imagePreloader = ImagePreloader.getInstance();
  const imageCaching = ImageCachingService.getInstance();
  
  // Optimize the portrait URL for better caching
  const portraitUrl = npc.portraits[emotion] ? 
    imageCaching.optimizeImageUrl(npc.portraits[emotion]) : 
    null;

  useEffect(() => {
    // Preload other emotions in the background
    if (preloadOtherEmotions) {
      const otherEmotions = Object.entries(npc.portraits)
        .filter(([key]) => key !== emotion)
        .map(([_, url]) => url)
        .filter(Boolean)
        .map(url => imageCaching.optimizeImageUrl(url));
      
      imagePreloader.queueForPreload(otherEmotions);
      
      // Also use link preloading for better browser caching
      imageCaching.batchPreloadImages(otherEmotions);
    }
  }, [npc.id, preloadOtherEmotions]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Check if image is already preloaded
  const isPreloaded = portraitUrl ? imagePreloader.isPreloaded(portraitUrl) : false;

  return (
    <div className="relative w-60 h-60 mx-auto bg-game-bg rounded-lg overflow-hidden">
      {!imageError && portraitUrl ? (
        <>
          {isLoading && !isPreloaded && (
            <ImageSkeleton className="absolute inset-0 z-10" />
          )}
          <Image
            src={portraitUrl}
            alt={`${npc.name} - ${emotion}`}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isLoading && !isPreloaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={emotion === 'neutral'}
            sizes="240px"
            quality={90}
            placeholder="empty"
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-game-border to-game-bg">
          <div className="text-center">
            <div className="text-6xl mb-2">
              {emotion === 'positive' ? '😊' : emotion === 'negative' ? '😠' : '😐'}
            </div>
            <p className="text-game-text text-sm">{npc.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}