// Cloudinary configuration
export const CLOUD_NAME = 'dmjrk2fov';
export const UPLOAD_PRESET = 'QiQI Yen';

/**
 * Upload a file to Cloudinary (unsigned upload)
 * Images go to Cloudinary, videos go to Supabase Storage
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'qiqi-yen'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await res.json();
  return data.secure_url;
}
