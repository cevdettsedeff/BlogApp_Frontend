import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { getLocaleFromRequest } from '@/lib/i18n-server';

// Static data
const category = {
  name: 'Teknoloji',
  slug: 'teknoloji',
  description: 'Güncel teknoloji haberleri, yazılım geliştirme ve programlama üzerine içerikler.',
};

const posts = [
  {
    id: '1',
    slug: 'yeni-nesil-yapay-zeka-uygulamalari',
    title: 'Yeni Nesil Yapay Zeka Uygulamaları',
    summary: 'Günümüzde yapay zeka teknolojileri hızla gelişiyor ve hayatımızın her alanında yer almaya başlıyor.',
    coverImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-28T10:00:00Z',
    viewCount: 1250,
  },
  {
    id: '2',
    slug: 'react-19-yenilikleri',
    title: 'React 19 ile Gelen Yenilikler',
    summary: 'React\'in yeni sürümüyle birlikte gelen özellikler, performans iyileştirmeleri ve dikkat edilmesi gereken değişiklikler.',
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-20T09:00:00Z',
    viewCount: 980,
  },
  {
    id: '3',
    slug: 'jwt-kimlik-dogrulama',
    title: 'JWT ile Kimlik Doğrulama Nasıl Yapılır?',
    summary: 'Web uygulamalarında güvenli kimlik doğrulama için JWT kullanımı ve best practice\'ler.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-15T14:30:00Z',
    viewCount: 756,
  },
];

export default function CategoryPage() {
  const locale = getLocaleFromRequest();
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-2">{category.name}</Badge>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={getPostHref(post.slug)}>
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{post.authorDisplayName}</span>
                <span>·</span>
                <time>{formatDate(post.publishedAt)}</time>
              </div>

              <Link href={getPostHref(post.slug)}>
                <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
              </Link>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
