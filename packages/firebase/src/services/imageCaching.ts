/**
 * Service for optimizing Firebase Storage image URLs with caching parameters
 */
export class ImageCachingService {
  private static instance: ImageCachingService;
  
  private constructor() {}

  public static getInstance(): ImageCachingService {
    if (!ImageCachingService.instance) {
      ImageCachingService.instance = new ImageCachingService();
    }
    return ImageCachingService.instance;
  }

  /**
   * Optimize a Firebase Storage URL for better caching
   * Adds cache-busting parameter based on file metadata
   */
  public optimizeImageUrl(url: string): string {
    if (!url || !url.includes('firebasestorage.googleapis.com')) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      
      // Add cache control parameters if not present
      if (!urlObj.searchParams.has('cache')) {
        // Use a stable cache key based on the file path
        const pathSegments = urlObj.pathname.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        const cacheKey = this.generateCacheKey(fileName);
        
        urlObj.searchParams.set('cache', cacheKey);
      }
      
      // Add alt=media for direct image serving
      if (!urlObj.searchParams.has('alt')) {
        urlObj.searchParams.set('alt', 'media');
      }
      
      return urlObj.toString();
    } catch (error) {
      console.error('Failed to optimize image URL:', error);
      return url;
    }
  }

  /**
   * Generate a stable cache key for a file
   */
  private generateCacheKey(fileName: string): string {
    // Use a simple hash of the filename for cache busting
    // This ensures the same file always gets the same cache key
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      const char = fileName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Preload an image using a link tag for better browser caching
   */
  public preloadImageWithLink(url: string): void {
    const optimizedUrl = this.optimizeImageUrl(url);
    
    // Check if already preloaded
    const existingLink = document.querySelector(`link[href="${optimizedUrl}"]`);
    if (existingLink) return;
    
    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  }

  /**
   * Batch preload multiple images
   */
  public batchPreloadImages(urls: string[]): void {
    urls.forEach(url => this.preloadImageWithLink(url));
  }
}