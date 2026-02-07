import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Locale } from '@/lib/i18n';
import type {
  CategoryDto,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteResponse,
} from '@/types';

export const adminCategoryService = {
  async list(lang: Locale): Promise<CategoryDto[]> {
    const response = await apiClient.get<CategoryDto[]>(
      API_ENDPOINTS.adminCategories.list,
      { params: { language: lang } }
    );
    return response.data;
  },

  async create(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await apiClient.post<CreateCategoryResponse>(
      API_ENDPOINTS.adminCategories.create,
      data
    );
    return response.data;
  },

  async update(id: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const response = await apiClient.put<UpdateCategoryResponse>(
      API_ENDPOINTS.adminCategories.update(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(
      API_ENDPOINTS.adminCategories.delete(id)
    );
    return response.data;
  },
};
