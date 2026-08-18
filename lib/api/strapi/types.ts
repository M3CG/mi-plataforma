// lib/api/strapi/types.ts
export type StrapiPagination = {
  page?: number;
  pageSize?: number;
  pageCount?: number;
  total?: number;
};

export type StrapiListResponse<T> = {
  data?: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};