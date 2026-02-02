import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentsSection } from '@/components/post/CommentsSection';
import { Linkedin, Github, ExternalLink } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';

// Static data
const post = {
  slug: 'yeni-mezunlar-ilk-is-rehberi',
  title: 'Yeni Mezunlar Icin Ilk Is Rehberi',
  summary: 'Universiteden yeni mezun oldunuz ve is hayatina atilmak uzeresiniz. Bu rehberde, ilk isinizi bulma surecinde dikkat etmeniz gereken noktalari ele aliyoruz.',
  content: `
## Is Arama Sureci

Universiteden mezun olduktan sonra is arama sureci, cogu kisi icin stresli ve belirsiz bir donem olabilir. Ancak dogru stratejiler ve hazirliklarla bu sureci cok daha verimli hale getirebilirsiniz.

### CV Hazirlama

Ilk ve en onemli adim, etkili bir CV hazirlamaktir. CV'nizde sunlara dikkat edin:

- Kisa ve oz olun - 1 sayfa ideal
- Ilgili deneyimlerinizi one cikarin
- Projeleri ve basarilarinizi somut rakamlarla destekleyin
- Yazim hatasi olmadigindan emin olun

### Networking

Is dunyasinda networking, acik pozisyonlarin buyuk bir kisminin duyurulmadan doldurulmasi nedeniyle kritik oneme sahiptir. LinkedIn profilinizi guncel tutun ve sektorunuzdeki profesyonellerle baglanti kurmaya calisin.

> "Is bulmak icin en iyi yol, tanidiklariniz araciligiyla referans almaktir."

Universite mezunlari icin kariyer fuarlari ve mezun aglari da onemli firsatlar sunabilir.
  `,
  coverImageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=600&fit=crop',
  categoryName: 'Kariyer',
  categorySlug: 'kariyer',
  publishedAt: '2024-03-28T10:00:00Z',
  viewCount: 1250,
  author: {
    displayName: 'Berna Selin Sedef',
    title: 'Software Engineer',
    bio: 'Yazilim muhendisi olarak calisiyorum. Teknoloji, gezi ve kariyer konularinda yazilar yaziyorum.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    linkedinUrl: 'https://linkedin.com/in/example',
    githubUrl: 'https://github.com/example',
    websiteUrl: 'https://medium.com/@example',
  },
};

const popularPosts = [
  {
    slug: 'react-19-yenilikleri',
    title: 'React 19 ile Gelen Yenilikler',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=360&fit=crop',
    categoryName: 'Teknoloji',
    categorySlug: 'teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-15T10:00:00Z',
  },
  {
    slug: 'portekiz-erasmus-gunlugu',
    title: "Portekiz'de Erasmus Gunlugum",
    coverImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=360&fit=crop',
    categoryName: 'Gezi',
    categorySlug: 'gezi',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-10T14:30:00Z',
  },
];

export default function PostDetailPage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);
  const getPostHref = (slug: string) => addLocaleToPath(`/posts/${slug}`, locale);

  return (
    <article>
      {/* Header */}
      <header className="container py-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href={getCategoryHref(post.categorySlug)}>
            <Badge className="bg-primary hover:bg-primary/90">{post.categoryName}</Badge>
          </Link>
          <span className="text-muted-foreground">-</span>
          <span className="text-sm text-muted-foreground uppercase tracking-wide">
            {post.categoryName}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <time className="text-muted-foreground">
          {formatDate(post.publishedAt)}
        </time>
      </header>

      {/* Cover Image */}
      <section className="py-6 md:py-10">
        <div className="container">
          <div className="relative h-[320px] md:h-[420px] overflow-hidden rounded-2xl">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover object-[center_35%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent" />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container">
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {/* Simple markdown-like rendering */}
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="text-xl font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('> ')) {
              return (
                <blockquote key={i} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                  {line.replace('> ', '')}
                </blockquote>
              );
            }
            if (line.startsWith('- ')) {
              return <p key={i} className="ml-4 my-1">{line}</p>;
            }
            if (line.trim()) {
              return <p key={i} className="my-4 leading-relaxed">{line}</p>;
            }
            return null;
          })}
        </div>

        <CommentsSection postId={post.slug} strings={messages.pages.post.comments} />

        {/* Author Card */}
        <div className="border rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.displayName} />
              <AvatarFallback className="text-lg">
                {getInitials(post.author.displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{post.author.displayName}</h3>
              <p className="text-sm text-muted-foreground mb-2">{post.author.title}</p>
              <p className="text-sm text-muted-foreground mb-4">{post.author.bio}</p>

              <div className="flex items-center gap-3">
                {post.author.linkedinUrl && (
                  <a
                    href={post.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {post.author.githubUrl && (
                  <a
                    href={post.author.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {post.author.websiteUrl && (
                  <a
                    href={post.author.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Author's Other Posts */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">{messages.pages.post.popularTitle}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {popularPosts.map((p) => (
              <article key={p.slug} className="border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="relative h-20 w-28 overflow-hidden rounded-lg">
                    <Image
                      src={p.coverImageUrl}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {p.categoryName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {p.authorDisplayName}
                      </span>
                    </div>
                    <Link href={getPostHref(p.slug)}>
                      <h3 className="font-medium hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                    </Link>
                    <time className="mt-2 block text-xs text-muted-foreground">
                      {formatDate(p.publishedAt)}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
