import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  AdminSettingsDto,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  SetFeaturedPostRequest,
  SetFeaturedPostResponse,
} from '@/types';

export const adminSettingsService = {
  async get(): Promise<AdminSettingsDto> {
    const response = await apiClient.get<AdminSettingsDto>(API_ENDPOINTS.adminSettings.get);
    return response.data;
  },

  async update(data: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
    const response = await apiClient.put<UpdateSettingsResponse>(
      API_ENDPOINTS.adminSettings.update,
      data
    );
    return response.data;
  },

  async setFeaturedPost(data: SetFeaturedPostRequest): Promise<SetFeaturedPostResponse> {
    const response = await apiClient.put<SetFeaturedPostResponse>(
      API_ENDPOINTS.adminSettings.setFeaturedPost,
      data
    );
    return response.data;
  },
};
