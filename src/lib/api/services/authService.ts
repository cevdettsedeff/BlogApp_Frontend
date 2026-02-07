import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
  MeDto,
  SuccessResponse,
} from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const email = data.email?.trim().toLowerCase() ?? null;
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, {
      ...data,
      email,
    });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.auth.register, data);
    return response.data;
  },

  async googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.google, data);
    return response.data;
  },

  async refresh(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.refresh, {});
    return response.data;
  },

  async logout(): Promise<SuccessResponse> {
    const response = await apiClient.post<SuccessResponse>(API_ENDPOINTS.auth.logout, {});
    return response.data;
  },

  async getMe(): Promise<MeDto> {
    const response = await apiClient.get<MeDto>(API_ENDPOINTS.auth.me);
    return response.data;
  },
};
