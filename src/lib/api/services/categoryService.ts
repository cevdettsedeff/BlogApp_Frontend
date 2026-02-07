import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Locale } from '@/lib/i18n';
import type { CategoryDto } from '@/types';

export const categoryService = {
  async list(lang: Locale): Promise<CategoryDto[]> {
    const response = await apiClient.get<CategoryDto[]>(API_ENDPOINTS.categories.list(lang));
    return response.data;
  },

  async getBySlug(lang: Locale, slug: string): Promise<CategoryDto> {
    const response = await apiClient.get<CategoryDto>(
      API_ENDPOINTS.categories.bySlug(lang, slug)
    );
    return response.data;
  },
};
