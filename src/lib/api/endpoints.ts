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
    list: '/api/posts',
    bySlug: (slug: string) => `/api/posts/${slug}`,
  },

  // Posts (Admin)
  adminPosts: {
    list: '/api/admin/posts',
    byId: (id: string) => `/api/admin/posts/${id}`,
    create: '/api/admin/posts',
    update: (id: string) => `/api/admin/posts/${id}`,
    delete: (id: string) => `/api/admin/posts/${id}`,
  },

  // Categories (Public)
  categories: {
    list: '/api/categories',
    bySlug: (slug: string) => `/api/categories/${slug}`,
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
    updateEmail: '/api/profile/email',
    updatePassword: '/api/profile/password',
    updateSocials: '/api/profile/socials',
  },

  // Settings (Public)
  settings: {
    public: '/api/settings/public',
  },

  // Settings (Admin)
  adminSettings: {
    get: '/api/admin/settings',
    update: '/api/admin/settings',
    setFeaturedPost: '/api/admin/settings/featured-post',
  },
} as const;
