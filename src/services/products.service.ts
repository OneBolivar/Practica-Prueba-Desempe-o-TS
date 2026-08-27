// src/services/products.service.ts
import { apiClient } from '../api/client';
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters, paginatedResponse } from '../types';

/**
 * Obtiene la lista de productos paginada con soporte para filtros de búsqueda y categoría
 */
export async function getProductsService(filters?: ProductFilters): Promise<paginatedResponse<Product>> {
  const response = await apiClient.get<paginatedResponse<Product>>('/products', {
    params: filters,
  });
  return response.data;
}

/**
 * Obtiene el detalle de un producto por su ID
 */
export async function getProductByIdService(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}

/**
 * Crea un nuevo producto (requiere sesión activa)
 */
export async function createProductService(data: CreateProductDto): Promise<Product> {
  const response = await apiClient.post<Product>('/products', data);
  return response.data;
}

/**
 * Actualiza los datos de un producto
 */
export async function updateProductService(id: string, data: UpdateProductDto): Promise<Product> {
  const response = await apiClient.patch<Product>(`/products/${id}`, data);
  return response.data;
}

/**
 * Elimina un producto por su ID
 */
export async function deleteProductService(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}