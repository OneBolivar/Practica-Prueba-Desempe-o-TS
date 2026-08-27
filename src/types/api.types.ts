
// Paginated API response interface
export interface paginatedResponse<T> {
  data: T[]; // El arreglo de datos de la respuesta de la API
  total: number; // Total de registros encontrados
  page: number; // Página actual
  limit: number; // Límite por página
  totalPages?: number; // Total de páginas calculadas
}

// API error response interface
export interface apiErrorResponse {
  statusCode: number; // El código de estado HTTP de la respuesta de error
  message: string | string[]; // El mensaje de error devuelto por la API
  error?: string; // El mensaje de error devuelto por la API
}