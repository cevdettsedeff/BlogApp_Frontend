import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CommentDto,
  CreateCommentRequest,
  CreateCommentResponse,
  PendingCommentDto,
  ReactCommentResponse,
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

  async listReplies(commentId: string): Promise<CommentDto[]> {
    const response = await apiClient.get<CommentDto[]>(
      API_ENDPOINTS.comments.replies(commentId)
    );
    return response.data;
  },

  async like(commentId: string): Promise<ReactCommentResponse> {
    const response = await apiClient.post<ReactCommentResponse>(
      API_ENDPOINTS.comments.like(commentId)
    );
    return response.data;
  },

  async dislike(commentId: string): Promise<ReactCommentResponse> {
    const response = await apiClient.post<ReactCommentResponse>(
      API_ENDPOINTS.comments.dislike(commentId)
    );
    return response.data;
  },

  async listMyPending(
    postId?: string,
    page: number = 1,
    pageSize: number = 5
  ): Promise<PendingCommentDto[]> {
    const response = await apiClient.get<PendingCommentDto[]>(
      API_ENDPOINTS.comments.myPending,
      {
        params: {
          postId: postId ?? undefined,
          page,
          pageSize,
        },
      }
    );
    return response.data;
  },
};
