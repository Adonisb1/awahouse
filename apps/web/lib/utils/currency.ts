export function formatNGN(kobo: bigint): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(Number(kobo) / 100);
}
