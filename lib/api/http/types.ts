// lib/api/http/types.ts
export type NextFetchRequestConfig = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};