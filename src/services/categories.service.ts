import { apiClient } from "../api/client";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types";

export async function getCategoriesService(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function getCategoryByIdService(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data
}

export async function createCategoryService (data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<Category>("/categories", data);
    return response.data;
}

export async function updateCategoryService(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    return response.data;
}

export async function deleteCategoryService(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
}