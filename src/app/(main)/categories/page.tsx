import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, FileText } from 'lucide-react';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { Locale } from '@/lib/i18n';
import type { CategoryCardDto, PagedResponse, PostListItemDto } from '@/types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&h=600&fit=crop';

async function fetchCategoryCards(locale: Locale): Promise<CategoryCardDto[]> {
  const baseUrl = getApiBaseUrl();
  const postsResponse = await fetch(`${baseUrl}/api/${locale}/posts?page=1&pageSize=100`, {
    next: { revalidate: 300 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!postsResponse.ok) return [];
  const posts = (await postsResponse.json()) as PagedResponse<PostListItemDto>;
  const grouped = new Map<
    string,
    { id: string; name: string; slug: string; count: number; imageUrl: string | null }
  >();

  posts.items.forEach((post) => {
    if (!post.categorySlug) return;

    const existing = grouped.get(post.categorySlug);
    if (existing) {
      existing.count += 1;
      return;
    }

    grouped.set(post.categorySlug, {
      id: `${locale}-${post.categorySlug}`,
      name: post.categoryName ?? post.categorySlug,
      slug: post.categorySlug,
      count: 1,
      imageUrl: post.coverImageUrl ?? null,
    });
  });

  return Array.from(grouped.values()).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    imageUrl: item.imageUrl,
    publishedPostCount: item.count,
  }));
}

function paletteByIndex(index: number) {
  const variants = [
    'from-amber-900/70 via-orange-800/50 to-yellow-700/40',
    'from-sky-900/70 via-blue-800/50 to-cyan-700/40',
    'from-emerald-900/70 via-teal-800/50 to-lime-700/40',
    'from-rose-900/70 via-red-800/50 to-orange-700/40',
    'from-slate-900/70 via-zinc-800/50 to-stone-700/40',
  ];
  return variants[index % variants.length];
}

export default async function CategoriesPage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const items = await fetchCategoryCards(locale);
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);

  return (
    <div className="container py-10">
      <div className="mb-8 rounded-2xl border bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-8">
        <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
          {locale === 'tr' ? 'Keşfet' : 'Discover'}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{messages.pages.categories.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-700">
          {locale === 'tr'
            ? 'İlgi alanına göre kategorilere dal, öne çıkan içerikleri hızlıca keşfet.'
            : 'Browse by topic and jump into the content you care about most.'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {locale === 'tr' ? 'Henüz kategori bulunmuyor.' : 'No categories found yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((category, index) => {
            if (!category.slug) return null;

            return (
              <Link
                key={category.id}
                href={getCategoryHref(category.slug)}
                className="group relative block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={category.imageUrl ?? FALLBACK_IMAGE}
                    alt={category.name ?? ''}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${paletteByIndex(index)}`} />
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/30 px-2.5 py-1 text-xs text-white backdrop-blur">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{category.publishedPostCount}</span>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white backdrop-blur">
                    <span>{locale === 'tr' ? 'Kategori' : 'Category'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <h2 className="line-clamp-2 text-xl font-bold text-white">{category.name ?? ''}</h2>
                    <ArrowUpRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
