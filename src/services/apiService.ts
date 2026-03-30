/**
 * VisionMaster API Service
 * Handles communication with the Python-based Neural Engine
 */

import { removeBackground } from '@imgly/background-removal';

export class ApiService {
  /**
   * Helper to convert base64 to Blob
   */
  private static async base64ToBlob(base64: string): Promise<Blob> {
    const res = await fetch(base64);
    return await res.blob();
  }

  /**
   * Helper to downscale image if it exceeds max dimensions
   */
  private static async downscaleImage(base64: string, maxDim: number = 1024): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= maxDim && img.height <= maxDim) {
          resolve(base64);
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64);
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }

  /**
   * Local background removal via @imgly/background-removal
   */
  static async removeBackground(
    base64Image: string, 
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      console.time("[VisionMaster] Background Removal");
      
      // 1. Downscale for performance if needed (1024px is usually enough for high quality)
      const optimizedBase64 = await this.downscaleImage(base64Image, 1024);
      
      // 2. Convert to Blob
      const blob = await this.base64ToBlob(optimizedBase64);
      
      // 3. Run neural engine
      const resultBlob = await removeBackground(blob, {
        progress: (step, index, total) => {
          const progress = Math.round((index / total) * 100);
          if (onProgress) onProgress(progress);
          
          // Log progress but don't spam too much
          if (index % 5 === 0 || index === total) {
            console.log(`[VisionMaster] ${step}: ${progress}%`);
          }
        },
        model: 'isnet_quint8', // Quantized for speed
        debug: false,
      });

      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(resultBlob);
      });

      console.timeEnd("[VisionMaster] Background Removal");
      return result;
    } catch (error) {
      console.error("[ApiService] Local Background Removal Error:", error);
      return null;
    }
  }

  /**
   * Passport processing with local background compositing
   */
  static async processPassportPhoto(
    base64Image: string, 
    size: '2x2' | '35x45', 
    backgroundColor: string,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      // 1. Remove background locally
      const transparentBase64 = await this.removeBackground(base64Image, onProgress);
      if (!transparentBase64) return null;

      // 2. Composite onto color background using Canvas
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          // Set dimensions based on standard
          if (size === '2x2') {
            canvas.width = 600;
            canvas.height = 600;
          } else {
            canvas.width = 413;
            canvas.height = 531;
          }

          // Draw background
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw subject (centered)
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          resolve(canvas.toDataURL('image/png'));
        };
        img.src = transparentBase64;
      });
    } catch (error) {
      console.error("[ApiService] Local Passport Processing Error:", error);
      return null;
    }
  }

  /**
   * Local signature extraction via Canvas processing
   */
  static async extractSignature(
    base64Image: string,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      // 1. Remove background first
      const transparentBase64 = await this.removeBackground(base64Image, onProgress);
      if (!transparentBase64) return null;

      // 2. Process to enhance ink and ensure transparency
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Simple thresholding and color enhancement for "ink"
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // If it's not transparent, check if it's "ink-like" (dark)
            if (a > 0) {
              const brightness = (r + g + b) / 3;
              if (brightness > 200) {
                // Make very light pixels transparent (background remnants)
                data[i + 3] = 0;
              } else {
                // Preserve original color but ensure it's "solid"
                // We don't force to black anymore to support blue/red ink
                // Optional: increase contrast slightly
                const factor = 1.2;
                data[i] = Math.max(0, Math.min(255, r * factor - 50));
                data[i + 1] = Math.max(0, Math.min(255, g * factor - 50));
                data[i + 2] = Math.max(0, Math.min(255, b * factor - 50));
              }
            }
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = transparentBase64;
      });
    } catch (error) {
      console.error("[ApiService] Local Signature Extraction Error:", error);
      return null;
    }
  }

  /**
   * Purge transient cache (No-op for local processing)
   */
  static async clearTransientCache() {
    // Local processing doesn't use server cache
    console.log("[VisionMaster] Local cache cleared");
  }
}
