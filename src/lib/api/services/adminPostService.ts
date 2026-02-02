import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  AdminPostListItemDto,
  AdminPostDetailDto,
  AdminListPostsQuery,
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  DeleteResponse,
  PagedResponse,
} from '@/types';

export const adminPostService = {
  async list(query?: AdminListPostsQuery): Promise<PagedResponse<AdminPostListItemDto>> {
    const response = await apiClient.get<PagedResponse<AdminPostListItemDto>>(
      API_ENDPOINTS.adminPosts.list,
      { params: query }
    );
    return response.data;
  },

  async getById(id: string): Promise<AdminPostDetailDto> {
    const response = await apiClient.get<AdminPostDetailDto>(
      API_ENDPOINTS.adminPosts.byId(id)
    );
    return response.data;
  },

  async create(data: CreatePostRequest): Promise<CreatePostResponse> {
    const response = await apiClient.post<CreatePostResponse>(
      API_ENDPOINTS.adminPosts.create,
      data
    );
    return response.data;
  },

  async update(id: string, data: UpdatePostRequest): Promise<UpdatePostResponse> {
    const response = await apiClient.put<UpdatePostResponse>(
      API_ENDPOINTS.adminPosts.update(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(
      API_ENDPOINTS.adminPosts.delete(id)
    );
    return response.data;
  },
};
