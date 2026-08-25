import type { Product } from "./product.types";

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  products? : Product[];
}

// DTOs (Data Transfer Objects) para la creación y actualización de categorías 
export type CreateCategoryDto = Omit<Category, 'id' | 'createdAt'>;

// DTO para la actualización de categorías, que permite actualizar solo los campos necesarios
export type UpdateCategoryDto = Partial<CreateCategoryDto>; 


