import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  ProfileDto,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateEmailRequest,
  UpdateEmailResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateSocialsRequest,
  UpdateSocialsResponse,
} from '@/types';

export const profileService = {
  async get(): Promise<ProfileDto> {
    const response = await apiClient.get<ProfileDto>(API_ENDPOINTS.profile.get);
    return response.data;
  },

  async update(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await apiClient.put<UpdateProfileResponse>(
      API_ENDPOINTS.profile.update,
      data
    );
    return response.data;
  },

  async updateEmail(data: UpdateEmailRequest): Promise<UpdateEmailResponse> {
    const response = await apiClient.put<UpdateEmailResponse>(
      API_ENDPOINTS.profile.updateEmail,
      data
    );
    return response.data;
  },

  async updatePassword(data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
    const response = await apiClient.put<UpdatePasswordResponse>(
      API_ENDPOINTS.profile.updatePassword,
      data
    );
    return response.data;
  },

  async updateSocials(data: UpdateSocialsRequest): Promise<UpdateSocialsResponse> {
    const response = await apiClient.put<UpdateSocialsResponse>(
      API_ENDPOINTS.profile.updateSocials,
      data
    );
    return response.data;
  },
};
