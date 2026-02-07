import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { Locale } from '@/lib/i18n';
import type { CategoryDto } from '@/types';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop';

async function fetchCategories(locale: Locale): Promise<CategoryDto[]> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/${locale}/categories`, {
    next: { revalidate: 300 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) return [];
  return (await response.json()) as CategoryDto[];
}

export default async function CategoriesPage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const items = await fetchCategories(locale);
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{messages.pages.categories.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((category) => {
          if (!category.slug) return null;
          return (
            <Link
              key={category.id}
              href={getCategoryHref(category.slug)}
              className="group relative block rounded-xl overflow-hidden aspect-[4/3]"
            >
              <Image
                src={DEFAULT_COVER}
                alt={category.name ?? ''}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                <FileText className="h-3 w-3" />
                <span>0</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-white/70 text-sm line-clamp-2">
                  {messages.pages.categories.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
