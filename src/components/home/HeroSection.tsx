'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';

interface HeroSectionProps {
  posts: {
    slug: string;
    title: string;
    summary: string;
    coverImageUrl: string;
    categoryName: string;
    categorySlug: string;
  }[];
}

export function HeroSection({ posts }: HeroSectionProps) {
  const items = useMemo(() => posts.filter(Boolean), [posts]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { locale } = useLocale();
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  useEffect(() => {
    if (items.length <= 1) return;

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(id);
  }, [items.length]);

  const activePost = items[activeIndex];

  if (!activePost) return null;

  return (
    <section className="py-6 md:py-10">
      <div className="container">
        <div className="relative h-[320px] md:h-[420px] overflow-hidden rounded-2xl">
          {/* Background Image */}
          {items.map((post, index) => (
            <Image
              key={post.slug}
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority={index === 0}
              className={cn(
                'object-cover object-[center_35%] transition-opacity duration-700',
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              )}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end px-6 pb-10 md:px-10 md:pb-12">
            <div className="max-w-2xl">
              <Link href={getCategoryHref(activePost.categorySlug)}>
                <Badge className="mb-4 bg-primary hover:bg-primary/90">
                  {activePost.categoryName}
                </Badge>
              </Link>

              <Link href={getPostHref(activePost.slug)}>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 hover:underline decoration-2 underline-offset-4">
                  {activePost.title}
                </h1>
              </Link>

              <p className="text-white/80 text-base md:text-lg line-clamp-2 md:line-clamp-3">
                {activePost.summary}
              </p>
            </div>

            {items.length > 1 && (
              <div className="mt-6 flex items-center gap-2">
                {items.map((post, index) => (
                  <button
                    key={post.slug}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'h-2.5 w-2.5 rounded-full border transition-colors',
                      index === activeIndex
                        ? 'bg-white border-white'
                        : 'bg-white/30 border-white/50 hover:bg-white/60'
                    )}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
