import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { AuthorListPostsQuery, AuthorPostListItemDto, PagedResponse } from '@/types';
import type { Locale } from '@/lib/i18n';

export const authorPostService = {
  async list(lang: Locale, query?: AuthorListPostsQuery): Promise<PagedResponse<AuthorPostListItemDto>> {
    const response = await apiClient.get<PagedResponse<AuthorPostListItemDto>>(
      API_ENDPOINTS.authorPosts.list,
      { params: { ...query, language: lang } }
    );
    return response.data;
  },
};
