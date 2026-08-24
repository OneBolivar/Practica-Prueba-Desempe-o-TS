import type { Category } from  "./category.types";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  category?: Category;
  isFavorite?: boolean;
  createdAt: Date;
}

//Payload para filtrar productos, permitiendo filtrar por página, límite de resultados, búsqueda por nombre y filtrado por categoría
export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
}

//Payload para la creación de productos, omitiendo los campos que no son necesarios al momento de crear un producto
export type CreateProductDto = Omit<Product, 'id' | 'category' | 'isFavorite' | 'createdAt'>;

//Payload para la actualización de productos, que permite actualizar solo los campos necesarios
export type UpdateProductDto = Partial<CreateProductDto>;


