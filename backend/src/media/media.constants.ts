export const allowedMediaMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'application/pdf',
]);

export function mediaTypeFromMime(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'document';
  return 'unknown';
}
