import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Locale } from '@/lib/i18n';
import type {
  PostListItemDto,
  PostDetailDto,
  PostListQuery,
  PagedResponse,
} from '@/types';

export const postService = {
  async list(lang: Locale, query?: PostListQuery): Promise<PagedResponse<PostListItemDto>> {
    const response = await apiClient.get<PagedResponse<PostListItemDto>>(
      API_ENDPOINTS.posts.list(lang),
      { params: query }
    );
    return response.data;
  },

  async getBySlug(lang: Locale, slug: string): Promise<PostDetailDto> {
    const response = await apiClient.get<PostDetailDto>(
      API_ENDPOINTS.posts.bySlug(lang, slug)
    );
    return response.data;
  },

  async incrementView(lang: Locale, id: string): Promise<{ viewCount: number }> {
    const response = await apiClient.post<{ viewCount: number }>(
      API_ENDPOINTS.posts.incrementView(lang, id)
    );
    return response.data;
  },
};
