import type { Locale } from '@/lib/i18n';

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    google: '/api/auth/google',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },

  // Posts (Public)
  posts: {
    list: (lang: Locale) => `/api/${lang}/posts`,
    bySlug: (lang: Locale, slug: string) => `/api/${lang}/posts/${slug}`,
    incrementView: (lang: Locale, id: string) => `/api/${lang}/posts/${id}/view`,
  },

  // Posts (Admin)
  adminPosts: {
    list: '/api/admin/posts',
    byId: (id: string) => `/api/admin/posts/${id}`,
    create: '/api/admin/posts',
    update: (id: string) => `/api/admin/posts/${id}`,
    delete: (id: string) => `/api/admin/posts/${id}`,
  },

  // Posts (Author)
  authorPosts: {
    list: '/api/author/posts',
  },

  // Categories (Public)
  categories: {
    list: (lang: Locale) => `/api/${lang}/categories`,
    cards: (lang: Locale) => `/api/${lang}/categories/cards`,
    bySlug: (lang: Locale, slug: string) => `/api/${lang}/categories/${slug}`,
  },

  // Categories (Admin)
  adminCategories: {
    list: '/api/admin/categories',
    create: '/api/admin/categories',
    update: (id: string) => `/api/admin/categories/${id}`,
    delete: (id: string) => `/api/admin/categories/${id}`,
  },

  // Comments (Public)
  comments: {
    byPostId: (postId: string) => `/api/posts/${postId}/comments`,
    create: '/api/comments',
    replies: (commentId: string) => `/api/comments/${commentId}/replies`,
    like: (commentId: string) => `/api/comments/${commentId}/like`,
    dislike: (commentId: string) => `/api/comments/${commentId}/dislike`,
    mine: '/api/comments/mine',
    myPending: '/api/comments/mine/pending',
  },

  // Comments (Admin)
  adminComments: {
    pending: '/api/admin/comments/pending',
    updateStatus: (id: string) => `/api/admin/comments/${id}/status`,
    delete: (id: string) => `/api/admin/comments/${id}`,
  },

  // Favorites
  favorites: {
    list: '/api/me/favorites',
    add: '/api/me/favorites',
    remove: (postId: string) => `/api/me/favorites/${postId}`,
    isFavorite: (postId: string) => `/api/me/favorites/${postId}`,
  },

  // Profile
  profile: {
    get: '/api/profile',
    update: '/api/profile',
    updateEmail: '/api/profile/email',
    updatePassword: '/api/profile/password',
    updateSocials: '/api/profile/socials',
  },

  // Support Requests
  supportRequests: {
    create: '/api/support-requests',
  },

  // Support Requests (Admin)
  adminSupportRequests: {
    list: '/api/admin/support-requests',
  },

  // Settings (Public)
  settings: {
    public: (lang: Locale) => `/api/${lang}/settings/public`,
  },

  // Settings (Admin)
  adminSettings: {
    get: '/api/admin/settings',
    update: '/api/admin/settings',
    setFeaturedPost: '/api/admin/settings/featured-post',
  },
} as const;
