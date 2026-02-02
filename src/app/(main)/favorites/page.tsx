'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { addLocaleToPath } from '@/lib/i18n';

// Static data
const favorites = [
  {
    postId: '1',
    slug: 'yeni-nesil-yapay-zeka-uygulamalari',
    title: 'Yeni Nesil Yapay Zeka Uygulamaları',
    summary: 'Günümüzde yapay zeka teknolojileri hızla gelişiyor ve hayatımızın her alanında yer almaya başlıyor.',
    coverImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    categoryName: 'Teknoloji',
    favoritedAt: '2024-03-28T10:00:00Z',
  },
  {
    postId: '2',
    slug: 'portekiz-erasmus-gunlugu',
    title: 'Portekiz\'de Erasmus Günlüğüm',
    summary: 'Lizbon\'da geçirdiğim 6 aylık Erasmus deneyimim hakkında detaylı bir yazı.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop',
    categoryName: 'Gezi',
    favoritedAt: '2024-03-25T14:30:00Z',
  },
];

export default function FavoritesPage() {
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold">{messages.pages.favorites.title}</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{messages.pages.favorites.emptyTitle}</h2>
          <p className="text-muted-foreground mb-4">
            {messages.pages.favorites.emptyBody}
          </p>
          <Button asChild>
            <Link href={addLocaleToPath('/', locale)}>{messages.pages.favorites.browse}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <article key={fav.postId} className="group relative bg-card border rounded-xl overflow-hidden">
              <Link href={getPostHref(fav.slug)}>
                <div className="relative aspect-[16/10]">
                  <Image
                    src={fav.coverImageUrl}
                    alt={fav.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {fav.categoryName}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Link href={getPostHref(fav.slug)}>
                  <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {fav.title}
                  </h2>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {fav.summary}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatDate(fav.favoritedAt)} {messages.pages.favorites.addedOn}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
