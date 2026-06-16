import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function isCloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadFile(
  base64: string,
  options: {
    folder: string;
    publicId?: string;
    type?: 'upload' | 'authenticated';
    eager?: string | Record<string, unknown>[];
  },
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(`data:image/...;base64,${base64}`, {
    folder: options.folder,
    public_id: options.publicId,
    type: options.type ?? 'authenticated',
    ...(options.eager ? { eager: options.eager, eager_async: false } : {}),
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export function getSignedUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: 'authenticated',
  });
}

export function getImageUrl(publicId: string, transforms?: string): string {
  if (!transforms) {
    return cloudinary.url(publicId, { secure: true });
  }
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transforms,
  });
}
