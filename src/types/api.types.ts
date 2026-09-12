export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Pagination = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
};

export type PaginatedApiEnvelope<T> = ApiEnvelope<T> & {
  pagination: Pagination;
};
