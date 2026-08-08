import type { ScanResult, CapturedLocation } from '@/types/scan';

/**
 * Returns Tailwind color styling classes for ScanResult badge.
 */
export function scanResultColor(result: ScanResult): string {
  switch (result) {
    case 'dispatched':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'rate_limited':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'vehicle_not_found':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'error':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
    default:
      return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
  }
}

/**
 * Returns human-readable label for ScanResult.
 */
export function scanResultLabel(result: ScanResult): string {
  switch (result) {
    case 'dispatched':
      return 'Alert Dispatched';
    case 'rate_limited':
      return 'Rate Limited';
    case 'vehicle_not_found':
      return 'Vehicle Not Found';
    case 'error':
      return 'Scan Error';
    default:
      return 'Unknown Result';
  }
}

/**
 * Formats ISO date string into readable Date & Time.
 * Example: "15 Jul 2026, 11:42 AM"
 */
export function formatScanDate(timestamp: string): { date: string; time: string; full: string } {
  if (!timestamp) return { date: 'N/A', time: 'N/A', full: 'N/A' };
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return { date: timestamp, time: '', full: timestamp };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    return {
      date: dateStr,
      time: timeStr,
      full: `${dateStr}, ${timeStr}`,
    };
  } catch (e) {
    return { date: timestamp, time: '', full: timestamp };
  }
}

/**
 * Builds Google Maps Static API URL or OpenStreetMap static image URL.
 * Never loads Google Maps JS SDK.
 */
export function buildStaticMapUrl(latitude: number, longitude: number, zoom = 15): string {
  // Use OpenStreetMap Static Tile image URL or Mapbox static preview fallback to avoid requiring paid Google Maps JS SDK keys
  return `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${longitude},${latitude}&z=${zoom}&l=map&pt=${longitude},${latitude},pm2rdm&size=600,300`;
}

/**
 * Opens Google Maps in a new browser tab with given lat/lng.
 */
export function openGoogleMaps(lat: number, lng: number): void {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Helper to convert Blob to File object.
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
}

/**
 * Resizes and compresses an image client-side to maximum dimension (1920px), JPEG 80%, max 2MB.
 */
export async function compressImage(
  file: File,
  maxDimension = 1920,
  quality = 0.8,
  maxSizeBytes = 2 * 1024 * 1024
): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image canvas'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling factor for 1920px max dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2d context for image canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression failed'));
              return;
            }

            if (blob.size > maxSizeBytes) {
              reject(new Error(`Compressed image size (${(blob.size / 1024 / 1024).toFixed(1)}MB) exceeds 2MB limit.`));
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Formats a CapturedLocation object to human-friendly text.
 */
export function formatAddress(location?: CapturedLocation): string {
  if (!location) return 'Location not provided';
  if (location.address) return location.address;
  if (location.manualAddress) return location.manualAddress;
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}
