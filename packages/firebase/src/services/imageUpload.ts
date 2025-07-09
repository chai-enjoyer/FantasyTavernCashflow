import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export interface NPCImageUrls {
  neutral?: string;
  positive?: string;
  negative?: string;
}

/**
 * Upload an image to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., "npcs/merchant_bob/neutral.jpg")
 * @returns The download URL and storage path
 */
export async function uploadImage(file: File, path: string): Promise<ImageUploadResult> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload NPC portrait images
 * @param npcId The NPC ID
 * @param images Object containing neutral, positive, and negative image files
 * @returns Object containing the URLs for each uploaded image
 */
export async function uploadNPCImages(
  npcId: string, 
  images: { neutral?: File; positive?: File; negative?: File }
): Promise<NPCImageUrls> {
  const urls: NPCImageUrls = {};
  
  try {
    // Upload neutral portrait
    if (images.neutral) {
      const ext = getFileExtension(images.neutral.name);
      const result = await uploadImage(
        images.neutral, 
        `npcs/${npcId}/neutral.${ext}`
      );
      urls.neutral = result.url;
    }
    
    // Upload positive portrait
    if (images.positive) {
      const ext = getFileExtension(images.positive.name);
      const result = await uploadImage(
        images.positive, 
        `npcs/${npcId}/positive.${ext}`
      );
      urls.positive = result.url;
    }
    
    // Upload negative portrait
    if (images.negative) {
      const ext = getFileExtension(images.negative.name);
      const result = await uploadImage(
        images.negative, 
        `npcs/${npcId}/negative.${ext}`
      );
      urls.negative = result.url;
    }
    
    return urls;
  } catch (error) {
    // If any upload fails, try to clean up already uploaded images
    console.error('Error uploading NPC images:', error);
    
    // Clean up any successfully uploaded images
    const cleanupPromises = [];
    if (urls.neutral) {
      cleanupPromises.push(deleteImageByUrl(urls.neutral).catch(() => {}));
    }
    if (urls.positive) {
      cleanupPromises.push(deleteImageByUrl(urls.positive).catch(() => {}));
    }
    if (urls.negative) {
      cleanupPromises.push(deleteImageByUrl(urls.negative).catch(() => {}));
    }
    
    await Promise.all(cleanupPromises);
    
    throw new Error('Failed to upload NPC images');
  }
}

/**
 * Delete an image from storage by URL
 * @param url The download URL of the image to delete
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    // Extract the path from the URL
    const path = getStoragePathFromUrl(url);
    if (!path) {
      throw new Error('Invalid storage URL');
    }
    
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
}

/**
 * Extract storage path from Firebase Storage URL
 */
function getStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }
  } catch {
    // Invalid URL
  }
  return null;
}

/**
 * Validate image file
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB (default: 5MB)
 * @returns True if valid, throws error if invalid
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
  }
  
  return true;
}