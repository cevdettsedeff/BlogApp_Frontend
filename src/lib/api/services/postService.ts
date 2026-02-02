import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PostListItemDto,
  PostDetailDto,
  PostListQuery,
  PagedResponse,
} from '@/types';

export const postService = {
  async list(query?: PostListQuery): Promise<PagedResponse<PostListItemDto>> {
    const response = await apiClient.get<PagedResponse<PostListItemDto>>(
      API_ENDPOINTS.posts.list,
      { params: query }
    );
    return response.data;
  },

  async getBySlug(slug: string): Promise<PostDetailDto> {
    const response = await apiClient.get<PostDetailDto>(
      API_ENDPOINTS.posts.bySlug(slug)
    );
    return response.data;
  },
};
