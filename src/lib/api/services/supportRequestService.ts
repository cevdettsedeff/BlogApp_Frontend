import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  AdminSupportRequestDto,
  CreateSupportRequestRequest,
  CreateSupportRequestResponse,
  PagedResponse,
} from '@/types';

interface ListAdminSupportRequestsQuery {
  page?: number;
  pageSize?: number;
}

export const supportRequestService = {
  async create(data: CreateSupportRequestRequest): Promise<CreateSupportRequestResponse> {
    const response = await apiClient.post<CreateSupportRequestResponse>(
      API_ENDPOINTS.supportRequests.create,
      data
    );
    return response.data;
  },

  async listAdmin(query?: ListAdminSupportRequestsQuery): Promise<PagedResponse<AdminSupportRequestDto>> {
    const response = await apiClient.get<PagedResponse<AdminSupportRequestDto>>(
      API_ENDPOINTS.adminSupportRequests.list,
      { params: query }
    );
    return response.data;
  },
};

