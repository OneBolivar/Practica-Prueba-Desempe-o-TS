// Paginated API response interface 
export interface paginatedResponse<T> {
    data: T[] //El arreglo de datos de la respuesta de la API 
    categoryID: string
    page: number
    limit: number
}


// API error response interface ()
export interface apiErrorResponse {
    statusCode: number //El código de estado HTTP de la respuesta de error
    message: string | string[] // El mensaje de error devuelto por la API
    error?: string // El mensaje de error devuelto por la API
}



