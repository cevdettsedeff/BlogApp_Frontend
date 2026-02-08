// ============================================
// Common Types
// ============================================
export interface PagedRequest {
  page?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// ============================================
// Auth Types
// ============================================
export interface MeDto {
  id: string;
  displayName: string | null;
  email: string | null;
  role: 'User' | 'Author' | 'Admin' | null;
  authorId?: string | null;
  linkedInUrl: string | null;
  instagramUrl: string | null;
}

export interface AuthResponse {
  accessToken: string | null;
  expiresAt: string;
  user: MeDto;
}

export interface LoginRequest {
  email: string | null;
  password: string | null;
}

export interface RegisterRequest {
  displayName: string | null;
  email: string | null;
  password: string | null;
}

export interface RegisterResponse {
  userId: string;
}

export interface GoogleLoginRequest {
  credential: string | null;
}

export interface RefreshTokenRequest {
  refreshToken?: string | null;
}

export interface LogoutRequest {
  refreshToken?: string | null;
}

// ============================================
// Post Types
// ============================================
export interface PostListItemDto {
  id: string;
  title: string | null;
  slug: string | null;
  summary: string | null;
  coverImageUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  authorDisplayName: string | null;
  publishedAt: string | null;
  viewCount: number;
}

export interface RelatedPostDto {
  id: string;
  title: string | null;
  slug: string | null;
  coverImageUrl: string | null;
  categorySlug: string | null;
  publishedAt: string | null;
}

export interface PostDetailDto {
  id: string;
  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  coverImageUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  authorDisplayName: string | null;
  publishedAt: string | null;
  viewCount: number;
  readingTimeMinutes: number;
  tags: string[] | null;
  relatedPosts: RelatedPostDto[] | null;
}

export interface PostListQuery {
  categorySlug?: string;
  q?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export type PostListItemDtoPagedResponse = PagedResponse<PostListItemDto>;

// Admin Post Types
export interface AdminPostListItemDto {
  id: string;
  title: string | null;
  slug: string | null;
  language: string | null;
  status: 'Draft' | 'Published' | null;
  categoryName: string | null;
  authorDisplayName: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export interface AdminPostDetailDto {
  id: string;
  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  coverImageUrl: string | null;
  status: string | null;
  categoryId: string;
  categoryName: string | null;
  authorId: string;
  authorDisplayName: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export interface CreatePostRequest {
  title: string | null;
  summary: string | null;
  content: string | null;
  categoryId: string;
  authorId: string;
  coverImageUrl?: string | null;
  language?: string | null;
}

export interface CreatePostResponse {
  id: string;
  slug: string | null;
}

export interface UpdatePostRequest {
  title: string | null;
  summary: string | null;
  content: string | null;
  categoryId: string;
  coverImageUrl?: string | null;
  language?: string | null;
}

export interface UpdatePostResponse {
  id: string;
  slug: string | null;
}

export interface AdminListPostsQuery {
  q?: string;
  categorySlug?: string;
  status?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}

// Author Post Types
export interface AuthorPostListItemDto {
  id: string;
  title: string | null;
  slug: string | null;
  language: string | null;
  status: 'Draft' | 'Published' | null;
  categoryName: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export interface AuthorListPostsQuery {
  q?: string;
  categorySlug?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// Category Types
// ============================================
export interface CategoryDto {
  id: string;
  name: string | null;
  slug: string | null;
  imageUrl?: string | null;
}

export interface CategoryCardDto {
  id: string;
  name: string | null;
  slug: string | null;
  imageUrl: string | null;
  publishedPostCount: number;
}

export interface CreateCategoryRequest {
  name: string | null;
  slug: string | null;
  imageUrl?: string | null;
}

export interface CreateCategoryResponse {
  id: string;
}

export interface UpdateCategoryRequest {
  name: string | null;
  slug: string | null;
  imageUrl?: string | null;
}

export interface UpdateCategoryResponse {
  id: string;
}

// ============================================
// Comment Types
// ============================================
export interface CommentDto {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string | null;
  status: string | null;
  userDisplayName: string | null;
  guestName: string | null;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  userReaction: string | null;
  replies: CommentDto[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string | null;
  userId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  parentCommentId?: string | null;
}

export interface CreateCommentResponse {
  commentId: string;
}

export interface ReactCommentResponse {
  success: boolean;
  likeCount: number;
  dislikeCount: number;
}

// Admin Comment Types
export interface PendingCommentDto {
  id: string;
  postId: string;
  postTitle: string | null;
  content: string | null;
  userDisplayName: string | null;
  guestName: string | null;
  status: string | null;
  createdAt: string;
}

export interface ModerateCommentRequest {
  status: 'Pending' | 'Approved' | 'Spam' | null;
}

// ============================================
// Favorite Types
// ============================================
export interface FavoritePostDto {
  postId: string;
  title: string | null;
  slug: string | null;
  coverImageUrl: string | null;
  favoritedAt: string;
}

export interface AddFavoriteRequest {
  postId: string;
}

export interface AddFavoriteResponse {
  success: boolean;
}

export interface RemoveFavoriteResponse {
  success: boolean;
}

export interface IsFavoriteResponse {
  isFavorite: boolean;
}

// ============================================
// Profile Types
// ============================================
export interface ProfileDto {
  id: string;
  displayName: string | null;
  email: string | null;
  role: string | null;
  linkedInUrl: string | null;
  instagramUrl: string | null;
}

export interface UpdateEmailRequest {
  newEmail: string | null;
}

export interface UpdateEmailResponse {
  success: boolean;
}

export interface UpdatePasswordRequest {
  currentPassword: string | null;
  newPassword: string | null;
}

export interface UpdatePasswordResponse {
  success: boolean;
}

export interface UpdateSocialsRequest {
  linkedInUrl?: string | null;
  instagramUrl?: string | null;
}

export interface UpdateSocialsResponse {
  success: boolean;
}

// ============================================
// Settings Types
// ============================================
export interface PublicSettingsDto {
  siteTitle: string | null;
  siteDescription: string | null;
  themeMode: 'Light' | 'Dark' | 'Auto' | null;
  newsletterEnabled: boolean;
  newsletterTitle: string | null;
  newsletterDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  featuredPostId: string | null;
  viewCountDelayMs: number;
}

export interface AboutMemberDto {
  id: string;
  displayName: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  email: string | null;
  linkedInUrl: string | null;
  instagramUrl: string | null;
  publishedPostCount: number;
}

export interface AboutContactDto {
  email: string | null;
  linkedInUrl: string | null;
  instagramUrl: string | null;
  siteTitle: string;
  siteDescription: string;
}

export interface PublicAboutDto {
  title: string;
  description: string;
  authors: AboutMemberDto[];
  admins: AboutMemberDto[];
  contact: AboutContactDto;
}

export interface AdminSettingsDto {
  id: string;
  siteTitle: string | null;
  siteDescription: string | null;
  themeMode: string | null;
  newsletterEnabled: boolean;
  newsletterTitle: string | null;
  newsletterDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  featuredPostId: string | null;
  viewCountDelayMs: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateSettingsRequest {
  language: string;
  siteTitle: string | null;
  siteDescription: string | null;
  themeMode: 'Light' | 'Dark' | 'Auto' | null;
  newsletterEnabled: boolean;
  newsletterTitle: string | null;
  newsletterDescription: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  featuredPostId?: string | null;
  viewCountDelayMs: number;
}

export interface UpdateSettingsResponse {
  success: boolean;
}

export interface SetFeaturedPostRequest {
  featuredPostId: string | null;
}

export interface SetFeaturedPostResponse {
  success: boolean;
}

// ============================================
// Generic Response Types
// ============================================
export interface SuccessResponse {
  success: boolean;
}

export interface DeleteResponse {
  success: boolean;
}

// ============================================
// API Error Type
// ============================================
export interface ApiError {
  message: string;
  errors?: Array<{
    propertyName: string;
    errorMessage: string;
  }>;
}
