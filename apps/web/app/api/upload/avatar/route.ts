import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/cloudinary/client';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'File must be JPEG, PNG, or WebP' }, { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  const result = await uploadFile(base64, {
    folder: 'avatars',
    type: 'upload',
  });

  return NextResponse.json({ url: result.url });
}
