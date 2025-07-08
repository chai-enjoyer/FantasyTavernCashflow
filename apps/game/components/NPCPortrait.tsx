'use client';

import { NPC } from '@repo/shared';
import { useState } from 'react';
import Image from 'next/image';

interface NPCPortraitProps {
  npc: NPC;
  emotion: 'neutral' | 'positive' | 'negative';
}

export default function NPCPortrait({ npc, emotion }: NPCPortraitProps) {
  const [imageError, setImageError] = useState(false);
  const portraitUrl = npc.portraits[emotion];

  return (
    <div className="relative w-60 h-60 mx-auto bg-game-bg rounded-lg overflow-hidden">
      {!imageError && portraitUrl ? (
        <Image
          src={portraitUrl}
          alt={`${npc.name} - ${emotion}`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          priority
        />
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