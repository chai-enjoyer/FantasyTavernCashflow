# Image Loading Optimization Guide

This document describes the image loading optimizations implemented in the Fantasy Tavern Cashflow game.

## Overview

The game uses multiple strategies to ensure images load instantly and provide a smooth user experience:

1. **Image Preloading Service** - Preloads images in memory
2. **Next.js Image Optimization** - Lazy loading and format optimization
3. **Firebase Storage Caching** - URL optimization for browser caching
4. **Progressive Loading** - Skeleton screens and loading states
5. **Predictive Prefetching** - Preloads next card's images

## Components

### ImagePreloader Service (`/apps/game/services/imagePreloader.ts`)

- Manages image preloading with a queue system
- Limits concurrent loads to 3 images to prevent memory issues
- Provides status tracking for monitoring
- Caches loaded images in memory for instant access

### NPCPortrait Component (`/apps/game/components/NPCPortrait.tsx`)

- Uses Next.js Image component for optimization
- Shows skeleton loading state while images load
- Preloads other emotions in the background
- Checks if image is already preloaded for instant display

### ImageCachingService (`/packages/firebase/src/services/imageCaching.ts`)

- Optimizes Firebase Storage URLs for better caching
- Adds stable cache keys based on file names
- Uses browser link preloading for better performance
- Ensures direct media serving with `alt=media` parameter

## Implementation Details

### 1. App Initialization

When the app loads:
- Top 5 most-used NPCs' neutral portraits are preloaded
- Next 10 NPCs are queued for background loading
- Uses both Image preloading and link preloading

### 2. During Gameplay

When showing a card:
- Current NPC's all emotions are preloaded
- Next card's NPC images are prefetched
- Images already in cache display instantly

### 3. Image Display

- Skeleton loading state shown for unloaded images
- Smooth opacity transition when image loads
- Fallback emoji display on error

## Configuration

### Next.js Config (`/apps/game/next.config.js`)

```javascript
images: {
  formats: ['image/webp'],
  deviceSizes: [240, 320, 480, 640, 750, 828, 1080, 1200],
  minimumCacheTTL: 31536000, // 1 year
}
```

### Cache Headers

Images are served with long-term caching headers:
```
Cache-Control: public, max-age=31536000, immutable
```

## Testing

Visit `/test-images` to see the optimization in action:
- Monitor preloader status
- Test image switching speed
- Preload all images manually
- View performance metrics

## Performance Tips

1. **Initial Load**: First 5 NPCs load during app startup
2. **Predictive Loading**: Next card's images load while user reads current card
3. **Memory Management**: Only top NPCs are kept in memory
4. **Browser Caching**: Images cached for 1 year with stable URLs

## Monitoring

The ImagePreloader service provides status information:
- Number of preloaded images
- Currently loading count
- Queue size
- Estimated memory usage

Access this via:
```javascript
const preloader = ImagePreloader.getInstance();
const status = preloader.getStatus();
```