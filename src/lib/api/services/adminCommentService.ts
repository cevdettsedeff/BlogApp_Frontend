import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PendingCommentDto,
  ModerateCommentRequest,
  DeleteResponse,
  PagedResponse,
  SuccessResponse,
} from '@/types';

interface ListPendingQuery {
  page?: number;
  pageSize?: number;
}

export const adminCommentService = {
  async listPending(query?: ListPendingQuery): Promise<PagedResponse<PendingCommentDto>> {
    const response = await apiClient.get<PagedResponse<PendingCommentDto>>(
      API_ENDPOINTS.adminComments.pending,
      { params: query }
    );
    return response.data;
  },

  async updateStatus(id: string, data: ModerateCommentRequest): Promise<SuccessResponse> {
    const response = await apiClient.patch<SuccessResponse>(
      API_ENDPOINTS.adminComments.updateStatus(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(
      API_ENDPOINTS.adminComments.delete(id)
    );
    return response.data;
  },
};
