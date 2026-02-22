import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { AdminUserListItemDto, PagedResponse } from '@/types';

interface ListAdminUsersQuery {
  q?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export const adminUserService = {
  async list(query?: ListAdminUsersQuery): Promise<PagedResponse<AdminUserListItemDto>> {
    const response = await apiClient.get<PagedResponse<AdminUserListItemDto>>(
      API_ENDPOINTS.adminUsers.list,
      { params: query }
    );
    return response.data;
  },
};
