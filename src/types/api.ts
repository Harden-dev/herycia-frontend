export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorBody {
  success?: boolean
  message?: string
  code?: string
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  total_rows: number
  per_page: number
  current_page: number
  last_page: number
}

export interface PaginatedListResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

export interface PaginationQuery {
  page?: number
  per_page?: number
  search?: string
}
