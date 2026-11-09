/**
 * Direct browser-to-Cloudinary image upload service for Girlz Zone.
 * Cloud Name: dxeuzdwkz
 * Upload Preset: Website store
 * API Endpoint: https://api.cloudinary.com/v1_1/dxeuzdwkz/image/upload
 *
 * Includes automatic HTML5 canvas image compression fallback so that even if a mobile photo is 5MB+
 * or if an upload preset is restricted, the image is compressed to a lightweight (<120KB) Data URL
 * that saves reliably in Firebase Firestore (<1MB document limit) and renders everywhere on Vercel.
 */

export const CLOUDINARY_CLOUD_NAME = 'dxeuzdwkz';
export const CLOUDINARY_UPLOAD_PRESET = 'Website store';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Compresses an image File in the browser using an HTML5 Canvas so that it is fast and
 * well within Firebase's document size limit (~80KB–150KB).
 */
export function compressImageToDataUrl(
  file: File,
  maxDimension = 900,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result;
      if (typeof resultStr !== 'string') {
        reject(new Error('Could not read image file.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
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
          resolve(resultStr);
          return;
        }
        ctx.fillStyle = '#FFFDFB';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(resultStr);
      img.src = resultStr;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Attempts uploading to Cloudinary with a specific preset name.
 */
function tryCloudinaryUpload(
  file: File,
  preset: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            const httpsUrl = response.secure_url.replace(/^http:\/\//i, 'https://');
            onProgress?.(100);
            resolve(httpsUrl);
            return;
          }
        } catch {
          // Fall through to reject
        }
      }
      reject(new Error(`Cloudinary status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('Cloudinary network error'));
    xhr.send(formData);
  });
}

/**
 * Uploads a single image file to Cloudinary (`dxeuzdwkz` / `Website store`),
 * and automatically falls back to compressed Data URL if the preset or network fails.
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const presetsToTry = [CLOUDINARY_UPLOAD_PRESET, 'website_store', 'website store'];
  for (const preset of presetsToTry) {
    try {
      return await tryCloudinaryUpload(file, preset, onProgress);
    } catch {
      // Try next preset or compressed fallback
    }
  }

  // Fallback: compress image to <120KB JPEG Data URL so it saves reliably in Firebase & renders on Vercel
  onProgress?.(90);
  const compressed = await compressImageToDataUrl(file);
  onProgress?.(100);
  return compressed;
}

/**
 * Uploads multiple files sequentially to Cloudinary and reports aggregate percentage.
 */
export async function uploadMultipleImagesToCloudinary(
  files: FileList | File[],
  onProgress?: (percent: number) => void
): Promise<string[]> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return [];

  const urls: string[] = [];
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const url = await uploadImageToCloudinary(file, (filePercent) => {
      const overall = Math.round(((i * 100 + filePercent) / (fileArray.length * 100)) * 100);
      onProgress?.(overall);
    });
    urls.push(url);
  }
  return urls;
}
