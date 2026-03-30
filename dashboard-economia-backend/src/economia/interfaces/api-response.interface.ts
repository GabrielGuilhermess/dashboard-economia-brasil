export interface ApiResponse<T> {
  data: T;
  meta: {
    updatedAt: string;
    source: string;
    cached: boolean;
    stale: boolean;
    period?: string;
  };
}
