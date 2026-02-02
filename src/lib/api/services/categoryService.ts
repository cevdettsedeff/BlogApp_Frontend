import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { CategoryDto } from '@/types';

export const categoryService = {
  async list(): Promise<CategoryDto[]> {
    const response = await apiClient.get<CategoryDto[]>(API_ENDPOINTS.categories.list);
    return response.data;
  },

  async getBySlug(slug: string): Promise<CategoryDto> {
    const response = await apiClient.get<CategoryDto>(
      API_ENDPOINTS.categories.bySlug(slug)
    );
    return response.data;
  },
};
