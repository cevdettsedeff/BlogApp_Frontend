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
    title: 'RAG Mimarisi: Kurumsal Arama için Pratik Rehber',
    slug: 'rag-mimarisi-kurumsal-arama-rehberi',
    status: 'Published',
    categoryName: 'Teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    readingTime: 10,
    summary:
      'RAG (Retrieval-Augmented Generation) yaklaşımını veri hazırlığından izlenebilirliğe kadar adım adım ele alıyoruz.',
    content:
      '# RAG nedir ve neden işe yarar?\n\nRAG, üretken modeli kurum içi bilgiyle besleyip doğru kaynaklara dayandıran bir mimaridir. Amaç, sadece “güzel” cevaplar üretmek değil; güncel, izlenebilir ve kaynaklı cevaplar üretmektir.\n\n![Kurumsal arama görseli](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40)\n\n## 1) Veri hazırlığı: Cümle değil, anlam parçaları\n\nKlasik hata: PDF’leri sayfaya göre bölmek. Daha iyisi, anlamlı parçalara bölüp bağlamı korumaktır.\n\n- Her parça 300-600 kelime bandında kalsın.\n- Başlık ve alt başlıkları metadata olarak tutun.\n- Kaynak linki + sayfa numarasını metadata’ya ekleyin.\n\n## 2) Gömme (embedding) stratejisi\n\nTek bir embedding modeli kullanıp geçmek, her veri tipinde iyi sonuç vermez. Teknik dokümanlar için farklı, müşteri destek kayıtları için farklı model daha iyi olabilir. Minimum viable strateji: tek model ama veri tipi etiketleriyle filtreleme.\n\n```ts\n// Pseudo: parça kaydı ve metadata\nconst chunk = {\n  id: 'doc-2024-iso-27001-12',\n  text: content,\n  metadata: {\n    source: 'ISO27001.pdf',\n    page: 12,\n    category: 'security',\n    updatedAt: '2024-01-12',\n  },\n};\n```\n\n## 3) Retriever katmanı\n\nBurada iki hedef var: yüksek “recall” ve düşük “noise”. Tipik yaklaşım:\n\n1. İlk aşama: vektör arama (top 20)\n2. İkinci aşama: re-ranker (top 5)\n\nBu sayede modelin girdi penceresini temiz tutarsınız.\n\n## 4) Kaynaklı cevap üretimi\n\nCevaplarınızın en altında “Kaynaklar” bölümü olsun. Hem kullanıcı güveni hem de denetim için kritik.\n\n## 5) İzleme ve geri besleme döngüsü\n\n- Hangi sorulara “yanıtsız” dönüyoruz?\n- Hangi dokümanlar yanlış eşleşiyor?\n- Cevap kalitesini ölçmek için örneklem bazlı inceleme yapılıyor mu?\n\n## Kapanış\n\nRAG, tek seferlik bir entegrasyon değil, yaşayan bir ürün. Başarılı bir kurulumun %60’ı veri kalitesi, %20’si retrieval ayarı, %20’si de ölçüm ve iyileştirme disiplinidir.',
    createdAt: '2024-03-28T10:00:00Z',
    publishedAt: '2024-03-28T12:00:00Z',
  },
  {
    id: '2',
    title: "Lizbon'da 72 Saat: Yürüyüş Rotaları ve Bütçe Notları",
    slug: 'lizbonda-72-saat-rotalar-butce',
    status: 'Published',
    categoryName: 'Gezi',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    readingTime: 9,
    summary:
      'Üç günlük Lizbon planı: tarihi yürüyüş rotaları, ulaşım kartı tüyoları ve makul bütçeyle lezzet durakları.',
    content:
      '# 1. Gün: Baixa’dan Alfama’ya yavaş tempo\n\nSabahı Baixa’da başlatıp Rua Augusta’dan Arco da Rua Augusta’ya kadar yürüdüm. Öğlene doğru Sé Katedrali’ne çıkarken bol bol fotoğraf molası verdim. \n\n![Lizbon sokakları](https://images.unsplash.com/photo-1512453979798-5ea266f8880c)\n\n- **Ulaşım kartı:** Viva Viagem kartını ilk gün almak büyük rahatlık.\n- **Kahve molası:** Küçük bir pastelaria’da espresso + pastel de nata combo idealdir.\n\n## 2. Gün: Belém hattı\n\nBelém bölgesine tramvayla gitmek keyifli ama kalabalık. Erken çıkarsanız hem queue hem sıcak azalıyor.\n\n- Mosteiro dos Jerónimos çevresinde 1-2 saat yürüyüş\n- Belém Kulesi ve deniz kenarında gün batımı\n\n## 3. Gün: Miradouro ve parklar\n\nMiradouro da Senhora do Monte gün batımı için şahane. Yanınıza bir şişe su ve atıştırmalık alın.\n\n### Bütçe notları\n\n- Günlük ortalama: **45-60 Euro**\n- Ulaşım: Tek yön 1.8-2 Euro bandında\n- Müzeler: 8-12 Euro\n\n### Minik rota özeti\n\n1. Baixa -> Alfama -> Miradouro\n2. Belém -> Tajo kıyısı\n3. Parklar -> Bairro Alto\n\nKısa bir şehir ama doğru tempo ile üç gün dolu dolu geçiyor. Eğer bir gün daha ekleyebilirseniz Sintra kesinlikle eklenmeli.',
    createdAt: '2024-03-25T14:00:00Z',
    publishedAt: '2024-03-26T10:00:00Z',
  },
  {
    id: '3',
    title: 'Next.js 14 Route Handler: Cache ve Revalidate Stratejisi',
    slug: 'nextjs-14-route-handler-cache-stratejisi',
    status: 'Published',
    categoryName: 'Teknoloji',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    readingTime: 11,
    summary:
      'Route Handler üzerinden API tasarlarken cache-control, ISR ve revalidate mantığını pratik bir örnekle anlatıyoruz.',
    content:
      '# Route Handler ile doğru cache kurgusu\n\nRoute Handler, küçük API ihtiyaçları için hızlı ve temiz bir çözüm. Ama cache katmanını kurgulamazsanız ya gereksiz yük oluşur ya da bayat veri gösterirsiniz.\n\n![Sunucu odası](https://images.unsplash.com/photo-1518770660439-4636190af475)\n\n## Basit bir örnek\n\n```ts\n// app/api/posts/route.ts\nexport async function GET() {\n  const response = await fetch('https://example.com/api/posts', {\n    next: { revalidate: 120 },\n  });\n\n  const data = await response.json();\n  return Response.json({ items: data.items });\n}\n```\n\nBu yaklaşım 120 saniyede bir cache yeniler. Hızlı değişen veriler için kısa, yavaş değişenler için daha uzun tutabilirsiniz.\n\n## Cache-Control ne zaman gerekli?\n\nEğer Response header’larını kontrol etmek istiyorsanız:\n\n```ts\nreturn new Response(JSON.stringify(data), {\n  headers: {\n    'Content-Type': 'application/json',\n    'Cache-Control': 's-maxage=120, stale-while-revalidate=60',\n  },\n});\n```\n\n## Ne zaman revalidate 0?\n\n- Admin paneli gibi “anlık” verilerde\n- Kullanıcıya özel içerikte\n\n## Ne zaman ISR?\n\n- Kategori listeleri\n- Popüler yazılar\n- Haftalık raporlar\n\n## Kapanış\n\nRoute Handler + revalidate kombinasyonu, küçük ekiplerde büyük performans kazandırır. En kritik nokta: **veri doğasının** (sık değişen / nadir değişen) net tanımlanmasıdır.',
    createdAt: '2024-03-21T09:00:00Z',
    publishedAt: '2024-03-22T10:00:00Z',
  },
  {
    id: '4',
    title: 'Kariyer: Portföyünüzü Ürün Gibi Tasarlamak',
    slug: 'kariyer-portfoy-urun-gibi-tasarlamak',
    status: 'Published',
    categoryName: 'Kariyer',
    authorDisplayName: 'Berna Selin Sedef',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    readingTime: 8,
    summary:
      'Portföyünüzü sadece “işler” listesi değil, net bir değer önerisi olarak tasarlamanız için adım adım yaklaşım.',
    content:
      '# Portföyünüz, ilk ürününüzdür\n\nİyi bir portföy “çok iş” göstermekten çok **doğru iş** göstermektir. İşe alım ekipleri hızlı karar verir; bu yüzden ilk ekranınız net ve güçlü olmalı.\n\n![Çalışma masası](https://images.unsplash.com/photo-1498050108023-c5249f4df085)\n\n## 1) Değer önerisi tek cümle olmalı\n\nKimin için ne çözdüğünüzü bir cümlede anlatın:\n\n> “B2B SaaS ekipleri için kullanıcı odaklı ürün tasarlıyorum.”\n\n## 2) Vaka çalışması kurgusu\n\nHer vaka çalışması şu sırayla ilerlesin:\n\n1. Problem ve bağlam\n2. Hedef metrik\n3. Süreç ve kararlar\n4. Sonuç ve öğrenimler\n\n## 3) Kanıt katmanı ekleyin\n\nRakamlar, grafikler ve ekran görüntüleri güven sağlar. “%18 dönüşüm artışı” gibi ölçülebilir sonuçlar fark yaratır.\n\n## 4) Sunum formatı\n\n- Uzun metin bloklarından kaçının\n- Başlıklar net ve kısa olsun\n- “Önce/sonra” görsellerini aynı ekranda gösterin\n\n## Kapanış\n\nPortföyü ürün gibi düşünmek, sizi “tasarım yapan kişi” değil “ürün düşünen kişi” olarak konumlandırır. Bu küçük fark, görüşme sonuçlarını ciddi şekilde etkiler.',
    createdAt: '2024-03-18T11:00:00Z',
    publishedAt: '2024-03-19T08:30:00Z',
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
