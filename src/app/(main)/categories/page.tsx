import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';

// Static data
const categories = [
  {
    name: 'Teknoloji',
    slug: 'teknoloji',
    description: 'Güncel teknoloji haberleri, yazılım geliştirme ve programlama üzerine içerikler.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    postCount: 24,
  },
  {
    name: 'Gezi',
    slug: 'gezi',
    description: 'Seyahat rotaları, gezi rehberleri ve keşfedilecek yerler hakkında yazılar.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    postCount: 18,
  },
  {
    name: 'Kariyer',
    slug: 'kariyer',
    description: 'Kariyer tavsiyeleri, iş arama stratejileri ve profesyonel gelişim içerikleri.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    postCount: 12,
  },
  {
    name: 'Kişisel Gelişim',
    slug: 'kisisel-gelisim',
    description: 'Kişisel gelişim, motivasyon ve yaşam koçluğu üzerine içerikler.',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop',
    postCount: 8,
  },
];

export default function CategoriesPage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{messages.pages.categories.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={getCategoryHref(category.slug)}
            className="group relative block rounded-xl overflow-hidden aspect-[4/3]"
          >
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              <FileText className="h-3 w-3" />
              <span>{category.postCount}</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
              <p className="text-white/70 text-sm line-clamp-2">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
