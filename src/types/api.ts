export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorBody {
  success?: boolean
  message?: string
  code?: string
  /** Code d'erreur d'authentification renvoyé par le backend (token_expired, account_disabled, salon_suspended…) */
  error?: string
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
