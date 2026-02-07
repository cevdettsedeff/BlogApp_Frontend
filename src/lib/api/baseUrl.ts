const DEFAULT_API_URL = 'https://localhost:7264';

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  if (process.env.NODE_ENV !== 'production') {
    if (raw.startsWith('https://localhost') || raw.startsWith('https://127.0.0.1')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
  }
  return raw;
}
