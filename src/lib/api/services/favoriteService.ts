import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  FavoritePostDto,
  AddFavoriteRequest,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  IsFavoriteResponse,
  PagedResponse,
} from '@/types';

interface ListFavoritesQuery {
  page?: number;
  pageSize?: number;
}

export const favoriteService = {
  async list(query?: ListFavoritesQuery): Promise<PagedResponse<FavoritePostDto>> {
    const response = await apiClient.get<PagedResponse<FavoritePostDto>>(
      API_ENDPOINTS.favorites.list,
      { params: query }
    );
    return response.data;
  },

  async add(data: AddFavoriteRequest): Promise<AddFavoriteResponse> {
    const response = await apiClient.post<AddFavoriteResponse>(
      API_ENDPOINTS.favorites.add,
      data
    );
    return response.data;
  },

  async remove(postId: string): Promise<RemoveFavoriteResponse> {
    const response = await apiClient.delete<RemoveFavoriteResponse>(
      API_ENDPOINTS.favorites.remove(postId)
    );
    return response.data;
  },

  async isFavorite(postId: string): Promise<IsFavoriteResponse> {
    const response = await apiClient.get<IsFavoriteResponse>(
      API_ENDPOINTS.favorites.isFavorite(postId)
    );
    return response.data;
  },
};
