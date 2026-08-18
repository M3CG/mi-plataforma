// lib/api/pagination/types.ts
export type PaginatedResult<T> = {
  data: T[];
  hasMore: boolean;
  page: number;
  pageSize: number;
};