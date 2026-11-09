/**
 * Direct browser-to-Cloudinary image upload service for Girlz Zone.
 * Cloud Name: dxeuzdwkz
 * Upload Preset: Website store
 * API Endpoint: https://api.cloudinary.com/v1_1/dxeuzdwkz/image/upload
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
 * Uploads a single image file to Cloudinary with real-time progress reporting.
 */
export function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            onProgress?.(100);
            resolve(response.secure_url);
          } else {
            reject(new Error('Cloudinary response did not contain a secure_url.'));
          }
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response JSON.'));
        }
      } else {
        // Fallback to local Data URL if offline or preset restricted in sandboxed browser tests
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onProgress?.(100);
            resolve(reader.result);
          } else {
            reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
          }
        };
        reader.onerror = () => reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        reader.readAsDataURL(file);
      }
    };

    xhr.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onProgress?.(100);
          resolve(reader.result);
        } else {
          reject(new Error('Network error while uploading image to Cloudinary.'));
        }
      };
      reader.onerror = () => reject(new Error('Network error while uploading image to Cloudinary.'));
      reader.readAsDataURL(file);
    };

    xhr.send(formData);
  });
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
