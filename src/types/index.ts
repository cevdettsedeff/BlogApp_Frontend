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
  displayName: string;
  email: string;
  role: 'User' | 'Author' | 'Admin';
  linkedInUrl: string | null;
  instagramUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: MeDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ============================================
// Post Types
// ============================================
export interface PostListItemDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  authorDisplayName: string;
  publishedAt: string | null;
  viewCount: number;
}

export interface RelatedPostDto {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  categorySlug: string;
  publishedAt: string | null;
}

export interface PostDetailDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  authorDisplayName: string;
  publishedAt: string | null;
  viewCount: number;
  tags: string[];
  relatedPosts: RelatedPostDto[];
}

export interface PostListQuery {
  categorySlug?: string;
  q?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

// Admin Post Types
export interface AdminPostListItemDto {
  id: string;
  title: string;
  slug: string;
  status: 'Draft' | 'Published';
  categoryName: string;
  authorDisplayName: string;
  createdAt: string;
  publishedAt: string | null;
}

export interface AdminPostDetailDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  status: string;
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorDisplayName: string;
  createdAt: string;
  publishedAt: string | null;
}

export interface CreatePostRequest {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  authorId: string;
  coverImageUrl?: string | null;
}

export interface CreatePostResponse {
  id: string;
  slug: string;
}

export interface UpdatePostRequest {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  coverImageUrl?: string | null;
}

export interface UpdatePostResponse {
  id: string;
  slug: string;
}

export interface AdminListPostsQuery {
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
  name: string;
  slug: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
}

export interface CreateCategoryResponse {
  id: string;
}

export interface UpdateCategoryRequest {
  name: string;
  slug: string;
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
  content: string;
  status: string;
  userDisplayName: string | null;
  guestName: string | null;
  createdAt: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  userId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
}

export interface CreateCommentResponse {
  commentId: string;
}

// Admin Comment Types
export interface PendingCommentDto {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  userDisplayName: string | null;
  guestName: string | null;
  status: string;
  createdAt: string;
}

export interface ModerateCommentRequest {
  status: 'Pending' | 'Approved' | 'Spam';
}

// ============================================
// Favorite Types
// ============================================
export interface FavoritePostDto {
  postId: string;
  title: string;
  slug: string;
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
  displayName: string;
  email: string;
  role: string;
  linkedInUrl: string | null;
  instagramUrl: string | null;
}

export interface UpdateEmailRequest {
  newEmail: string;
}

export interface UpdateEmailResponse {
  success: boolean;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
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
  siteTitle: string;
  siteDescription: string;
  themeMode: 'Light' | 'Dark' | 'Auto';
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  featuredPostId: string | null;
}

export interface AdminSettingsDto {
  id: string;
  siteTitle: string;
  siteDescription: string;
  themeMode: string;
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  featuredPostId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateSettingsRequest {
  siteTitle: string;
  siteDescription: string;
  themeMode: 'Light' | 'Dark' | 'Auto';
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  featuredPostId?: string | null;
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
