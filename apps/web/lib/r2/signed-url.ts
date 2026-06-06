import { getSignedUrl } from './client';

export async function getPropertyImageUrl(key: string): Promise<string> {
  const url = await getSignedUrl(key);
  return url ?? '';
}

export async function getVerificationDocumentUrl(key: string): Promise<string> {
  const url = await getSignedUrl(key);
  return url ?? '';
}
