import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AdminPostStatus = 'Draft' | 'Published';

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  status: AdminPostStatus;
  categoryName: string;
  authorDisplayName: string;
  coverImage: string;
  readingTime: number;
  summary: string;
  content: string;
  createdAt: string;
  publishedAt: string | null;
}

const initialPosts: AdminPost[] = [
  {
    id: '1',
    title: 'RAG Mimarisi Rehberi',
    slug: 'rag-mimarisi-rehberi',
    status: 'Published',
    categoryName: 'Teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    readingTime: 10,
    summary: 'RAG mimarisi icin pratik bir baslangic ozeti.',
    content: '# RAG Rehberi\n\nTemel konseptler ve pratik adimlar.',
    createdAt: '2024-03-28T10:00:00Z',
    publishedAt: '2024-03-28T12:00:00Z',
  },
  {
    id: '2',
    title: 'Lizbon 72 Saat Gezi Notlari',
    slug: 'lizbon-72-saat-gezi-notlari',
    status: 'Published',
    categoryName: 'Gezi',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    readingTime: 8,
    summary: 'Uc gunluk plan, rota ve butce notlari.',
    content: '# Lizbon\n\nKisa rota ve ulasim onerileri.',
    createdAt: '2024-03-25T14:00:00Z',
    publishedAt: '2024-03-26T10:00:00Z',
  },
];

interface AdminPostsState {
  posts: AdminPost[];
  addPost: (post: AdminPost) => void;
  updatePost: (postId: string, updates: Partial<AdminPost>) => void;
  deletePost: (postId: string) => void;
}

export const useAdminPostsStore = create<AdminPostsState>()(
  persist(
    (set) => ({
      posts: initialPosts,
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (postId, updates) =>
        set((state) => ({
          posts: state.posts.map((post) => (post.id === postId ? { ...post, ...updates } : post)),
        })),
      deletePost: (postId) => set((state) => ({ posts: state.posts.filter((post) => post.id !== postId) })),
    }),
    {
      name: 'admin-posts-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

