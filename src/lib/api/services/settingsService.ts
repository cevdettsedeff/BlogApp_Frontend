import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { PublicSettingsDto } from '@/types';

export const settingsService = {
  async getPublic(): Promise<PublicSettingsDto> {
    const response = await apiClient.get<PublicSettingsDto>(API_ENDPOINTS.settings.public);
    return response.data;
  },
};
