// lib/api/http/config.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const FETCH_TIMEOUT_MS = 10_000;