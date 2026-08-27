// src/types/product.types.ts
import type { Category } from './category.types';

export interface Product {
  id: string; // UUID
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string; // UUID (string)
  category?: Category;
  imageUrl?: string;
  isFavorite?: boolean;
  createdAt: Date;
}

// Payload para filtrar productos
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string; // UUID (string)
}

// Payload para crear producto
export type CreateProductDto = Omit<Product, 'id' | 'category' | 'isFavorite' | 'createdAt'>;

// Payload para actualizar producto
export type UpdateProductDto = Partial<CreateProductDto>;