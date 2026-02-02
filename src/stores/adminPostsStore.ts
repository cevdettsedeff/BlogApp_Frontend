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
    title: 'Yeni Nesil Yapay Zeka Uygulamalari',
    slug: 'yeni-nesil-yapay-zeka-uygulamalari',
    status: 'Published',
    categoryName: 'Teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    readingTime: 6,
    summary: 'Yapay zeka uygulamalarinin gunluk hayatta nasil konumlandigini ve gelecek etkilerini inceliyoruz.',
    content:
      'Bu yazida sagliktan egitime kadar farkli alanlarda yapay zeka uygulamalarinin getirdigi degisimleri ele aliyoruz. Gercek hayattan ornekler ve gelecek trendlerini ozetleyen basliklar yer aliyor.',
    createdAt: '2024-03-28T10:00:00Z',
    publishedAt: '2024-03-28T12:00:00Z',
  },
  {
    id: '2',
    title: "Portekiz'de Erasmus Gunlugum",
    slug: 'portekiz-erasmus-gunlugu',
    status: 'Published',
    categoryName: 'Gezi',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    readingTime: 8,
    summary: 'Lizbon ve Porto maceramdan notlar, tavsiyeler ve kultur rotalari.',
    content:
      'Erasmus surecimde karsilastigim zorluklari, sevdigim mekanlari ve oradaki ogrenci hayatini paylastim. Planlama icin ipuclarini da ekledim.',
    createdAt: '2024-03-25T14:00:00Z',
    publishedAt: '2024-03-26T10:00:00Z',
  },
  {
    id: '3',
    title: 'React 19 ile Gelen Yenilikler',
    slug: 'react-19-yenilikleri',
    status: 'Draft',
    categoryName: 'Teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: '',
    readingTime: 5,
    summary: 'React 19 ile gelen yeni hooklar ve performans iyilestirmeleri.',
    content:
      'Bu taslak yazida yeni streaming ozellikleri, server component yaklasimi ve gelistirici deneyimini arttiran degisiklikleri topluyoruz.',
    createdAt: '2024-03-20T09:00:00Z',
    publishedAt: null,
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
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
        })),
      deletePost: (postId) =>
        set((state) => ({ posts: state.posts.filter((post) => post.id !== postId) })),
    }),
    {
      name: 'admin-posts-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
