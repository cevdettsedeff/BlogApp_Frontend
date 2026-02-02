import { HeroSection, PostsSection, PopularPostsSection, NewsletterSection } from '@/components/home';
import { getMessages } from '@/lib/i18n-dict';
import { getLocaleFromRequest } from '@/lib/i18n-server';

// Static data - will be replaced with API calls
const featuredPost = {
  slug: 'yeni-nesil-yapay-zeka-uygulamalari',
  title: 'Yeni Nesil Yapay Zeka Uygulamaları',
  summary: 'Günümüzde yapay zeka teknolojileri hızla gelişiyor ve hayatımızın her alanında yer almaya başlıyor. Bu yazıda, en yeni AI uygulamalarını ve gelecekte bizi bekleyen değişimleri inceliyoruz.',
  coverImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop',
  categoryName: 'Teknoloji',
  categorySlug: 'teknoloji',
};

const posts = [
  {
    slug: 'yeni-nesil-yapay-zeka-uygulamalari',
    title: 'Yeni Nesil Yapay Zeka Uygulamaları',
    summary: 'Günümüzde yapay zeka teknolojileri hızla gelişiyor ve hayatımızın her alanında yer almaya başlıyor.',
    coverImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&h=560&fit=crop',
    categoryName: 'Teknoloji',
    categorySlug: 'teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-15T10:00:00Z',
    likesCount: 340,
  },
  {
    slug: 'portekiz-erasmus-gunlugu',
    title: "Portekiz'de Erasmus Günlüğüm",
    summary: "Lizbon'da geçirdiğim 6 aylık Erasmus deneyimim hakkında detaylı bir yazı.",
    coverImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=560&fit=crop',
    categoryName: 'Gezi',
    categorySlug: 'gezi',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-10T14:30:00Z',
    likesCount: 220,
  },
  {
    slug: 'react-19-yenilikleri',
    title: 'React 19 ile Gelen Yenilikler',
    summary: "React'in yeni sürümüyle birlikte gelen özellikler ve performans iyileştirmeleri.",
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&h=560&fit=crop',
    categoryName: 'Teknoloji',
    categorySlug: 'teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-05T09:00:00Z',
    likesCount: 410,
  },
  {
    slug: 'yeni-mezunlar-ilk-is-rehberi',
    title: 'Yeni Mezunlar için İlk İş Rehberi',
    summary: 'İlk işinizi bulma sürecinde dikkat etmeniz gereken noktalar.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=560&fit=crop',
    categoryName: 'Kariyer',
    categorySlug: 'kariyer',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-01T09:00:00Z',
    likesCount: 180,
  },
  {
    slug: 'uzaktan-calisma-verimlilik',
    title: 'Uzaktan Çalışmada Verimlilik',
    summary: 'Evden çalışırken verimliliği artırmak için pratik öneriler.',
    coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=560&fit=crop',
    categoryName: 'Kariyer',
    categorySlug: 'kariyer',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-02-25T11:00:00Z',
    likesCount: 265,
  },
  {
    slug: 'istanbul-kahve-rotasi',
    title: 'İstanbul Kahve Rotası',
    summary: 'Şehrin en iyi üçüncü nesil kahvecilerini keşfedin.',
    coverImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=560&fit=crop',
    categoryName: 'Gezi',
    categorySlug: 'gezi',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-02-20T09:00:00Z',
    likesCount: 150,
  },
  {
    slug: 'jwt-kimlik-dogrulama',
    title: 'JWT ile Kimlik Doğrulama Nasıl Yapılır?',
    summary: 'Web uygulamalarında güvenli kimlik doğrulama için JWT kullanımı.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&h=560&fit=crop',
    categoryName: 'Teknoloji',
    categorySlug: 'teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-02-15T09:00:00Z',
    likesCount: 375,
  },
  {
    slug: 'kariyer-icin-networking',
    title: 'Kariyer için Networking Rehberi',
    summary: 'Doğru bağlantılar kurarak kariyerinizi hızlandırın.',
    coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=560&fit=crop',
    categoryName: 'Kariyer',
    categorySlug: 'kariyer',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-02-10T09:00:00Z',
    likesCount: 195,
  },
  {
    slug: 'kapadokya-balon-rehberi',
    title: 'Kapadokya Balon Rehberi',
    summary: 'Balon turu için en iyi zamanlar ve pratik ipuçları.',
    coverImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&h=560&fit=crop',
    categoryName: 'Gezi',
    categorySlug: 'gezi',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-02-05T09:00:00Z',
    likesCount: 125,
  },
  {
    slug: 'zihinsel-saglik-rutinleri',
    title: 'Zihinsel Sağlık Rutinleri',
    summary: 'Yoğun günlerde zihinsel sağlığı korumak için günlük rutinler.',
    coverImageUrl: 'https://images.unsplash.com/photo-1495555687398-3f50d6e79e1e?w=900&h=560&fit=crop',
    categoryName: 'Kişisel Gelişim',
    categorySlug: 'kisisel-gelisim',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-01-30T09:00:00Z',
    likesCount: 90,
  },
];

const popularPosts = [
  {
    slug: 'yeni-mezunlar-ilk-is-rehberi',
    title: 'Yeni Mezunlar için İlk İş Rehberi',
    summary: 'Üniversiteden yeni mezun oldunuz ve iş hayatına atılmak üzeresiniz. Bu rehberde, ilk işinizi bulma sürecinde dikkat etmeniz gereken noktaları ele alıyoruz.',
    categoryName: 'Kariyer',
    categorySlug: 'kariyer',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-15T10:00:00Z',
  },
  {
    slug: 'portekiz-erasmus-gunlugu',
    title: 'Portekiz\'de Erasmus Günlüğüm',
    summary: 'Lizbon\'da geçirdiğim 6 aylık Erasmus deneyimim hakkında detaylı bir yazı. Yaşadıklarım, öğrendiklerim ve tavsiyelerim.',
    categoryName: 'Gezi',
    categorySlug: 'gezi',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-10T14:30:00Z',
  },
  {
    slug: 'react-19-yenilikleri',
    title: 'React 19 ile Gelen Yenilikler',
    summary: 'React\'in yeni sürümüyle birlikte gelen özellikler, performans iyileştirmeleri ve dikkat edilmesi gereken değişiklikler.',
    categoryName: 'Teknoloji',
    categorySlug: 'teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    publishedAt: '2024-03-05T09:00:00Z',
  },
];

const heroPosts = [
  featuredPost,
  {
    slug: 'portekiz-erasmus-gunlugu',
    title: "Portekiz'de Erasmus Günlüğüm",
    summary: "Lizbon'da geçirdiğim 6 aylık Erasmus deneyimim hakkında detaylı bir yazı. Yaşadıklarım, öğrendiklerim ve tavsiyelerim.",
    coverImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
    categoryName: 'Gezi',
    categorySlug: 'gezi',
  },
  {
    slug: 'yeni-mezunlar-ilk-is-rehberi',
    title: 'Yeni Mezunlar için İlk İş Rehberi',
    summary: 'Üniversiteden yeni mezun oldunuz ve iş hayatına atılmak üzeresiniz. Bu rehberde, ilk işinizi bulma sürecinde dikkat etmeniz gereken noktaları ele alıyoruz.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
    categoryName: 'Kariyer',
    categorySlug: 'kariyer',
  },
];

export default function HomePage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);

  return (
    <>
      <HeroSection
        posts={heroPosts}
      />
      <PostsSection
        posts={posts}
        title={messages.home.postsTitle}
      />
      <PopularPostsSection
        posts={popularPosts}
        title={messages.home.popularTitle}
        locale={locale}
      />
      <NewsletterSection />
    </>
  );
}
