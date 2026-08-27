// src/services/favorites.service.ts
import { apiClient } from '../api/client';
import type { Product } from '../types';

// Obtener lista de productos favoritos del usuario
export async function getFavoritesService(): Promise<Product[]> {
  const response = await apiClient.get<Product[]>('/favorites');
  return response.data;
}

// Agregar un producto a favoritos
export async function addFavoriteService(productId: string): Promise<void> {
  await apiClient.post(`/favorites/${productId}`);
}

// Quitar un producto de favoritos
export async function removeFavoriteService(productId: string): Promise<void> {
  await apiClient.delete(`/favorites/${productId}`);
}