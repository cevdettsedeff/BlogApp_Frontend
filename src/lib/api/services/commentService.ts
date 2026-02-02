import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CommentDto,
  CreateCommentRequest,
  CreateCommentResponse,
} from '@/types';

export const commentService = {
  async listByPost(postId: string): Promise<CommentDto[]> {
    const response = await apiClient.get<CommentDto[]>(
      API_ENDPOINTS.comments.byPostId(postId)
    );
    return response.data;
  },

  async create(data: CreateCommentRequest): Promise<CreateCommentResponse> {
    const response = await apiClient.post<CreateCommentResponse>(
      API_ENDPOINTS.comments.create,
      data
    );
    return response.data;
  },
};
