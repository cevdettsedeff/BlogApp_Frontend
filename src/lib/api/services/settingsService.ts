import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { Locale } from '@/lib/i18n';
import type { PublicSettingsDto } from '@/types';

export const settingsService = {
  async getPublic(lang: Locale): Promise<PublicSettingsDto> {
    const response = await apiClient.get<PublicSettingsDto>(API_ENDPOINTS.settings.public(lang));
    return response.data;
  },
};
