/**
 * Image preloading service for optimizing NPC portrait loading
 * Preloads images in the background to ensure instant display
 */
export class ImagePreloader {
  private static instance: ImagePreloader;
  private preloadedImages = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  private constructor() {
    // Start processing queue
    this.processQueue();
  }

  public static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  /**
   * Preload a single image
   */
  public async preloadImage(url: string): Promise<HTMLImageElement> {
    // Return if already preloaded
    if (this.preloadedImages.has(url)) {
      return this.preloadedImages.get(url)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create loading promise
    const loadPromise = this.loadImage(url);
    this.loadingPromises.set(url, loadPromise);

    try {
      const img = await loadPromise;
      this.preloadedImages.set(url, img);
      this.loadingPromises.delete(url);
      return img;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Preload multiple images
   */
  public async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url).catch(() => null));
    await Promise.all(promises);
  }

  /**
   * Queue images for background preloading
   */
  public queueForPreload(urls: string[]): void {
    const newUrls = urls.filter(url => 
      !this.preloadedImages.has(url) && 
      !this.loadingPromises.has(url) &&
      !this.preloadQueue.includes(url)
    );
    
    this.preloadQueue.push(...newUrls);
  }

  /**
   * Check if an image is preloaded
   */
  public isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * Get a preloaded image if available
   */
  public getPreloadedImage(url: string): HTMLImageElement | null {
    return this.preloadedImages.get(url) || null;
  }

  /**
   * Load an image
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Enable crossOrigin for Firebase Storage images
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      
      img.src = url;
    });
  }

  /**
   * Process the preload queue in the background
   */
  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      // Check again in 100ms
      setTimeout(() => this.processQueue(), 100);
      return;
    }

    this.isPreloading = true;

    // Process up to 3 images at a time
    const batch = this.preloadQueue.splice(0, 3);
    
    try {
      await this.preloadImages(batch);
    } catch (error) {
      console.warn('Failed to preload some images:', error);
    }

    this.isPreloading = false;
    
    // Continue processing
    setTimeout(() => this.processQueue(), 0);
  }

  /**
   * Clear all preloaded images (for memory management)
   */
  public clear(): void {
    this.preloadedImages.clear();
    this.loadingPromises.clear();
    this.preloadQueue = [];
  }

  /**
   * Get preloader status
   */
  public getStatus(): {
    preloadedCount: number;
    loadingCount: number;
    queuedCount: number;
    totalSize: number;
  } {
    // Estimate memory usage (rough approximation)
    const estimatedSize = this.preloadedImages.size * 500 * 1024; // ~500KB per image
    
    return {
      preloadedCount: this.preloadedImages.size,
      loadingCount: this.loadingPromises.size,
      queuedCount: this.preloadQueue.length,
      totalSize: estimatedSize,
    };
  }
}