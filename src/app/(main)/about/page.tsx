import Image from 'next/image';
import { Linkedin, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getMessages } from '@/lib/i18n-dict';

// Static data
const author = {
  displayName: 'Berna Selin Sedef',
  title: 'Yazılım Mühendisi & Blogger',
  coverImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  stats: {
    posts: 45,
    followers: 1200,
    following: 320,
  },
  bio: `Merhaba! Ben yazılım mühendisi olarak çalışan, teknoloji ve seyahat tutkunu bir blogger\'ım. Bu blogda yazılım geliştirme, teknoloji trendleri, gezi deneyimlerim ve kariyer tavsiyeleri hakkında içerikler paylaşıyorum.

Berna Selin Sedef olarak blogumu hayata geçirdim. Amacım, öğrendiklerimi ve deneyimlerimi sizlerle paylaşmak. Özellikle yazılım dünyasına yeni adım atacaklar için faydalı içerikler üretmeye çalışıyorum.`,
  experience: [
    {
      title: 'Kıdemli Yazılım Mühendisi',
      company: 'ABC Teknoloji Şirketi',
      period: '2022 - Şu An',
    },
    {
      title: 'Yazılım Mühendisi',
      company: 'XYZ Yazılım Şirketi',
      period: '2019 - 2022',
    },
  ],
  education: [
    {
      degree: 'Bilgisayar Mühendisliği',
      school: 'XYZ Teknoloji Üniversitesi',
      period: '2015 - 2019',
    },
    {
      degree: 'ABC Üniversitesi',
      school: 'DEF Üniversitesi, Almanya',
      period: '2017 - 2018',
    },
  ],
  linkedinUrl: 'https://linkedin.com/in/example',
  email: 'contact@example.com',
};

export default function AboutPage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);

  return (
    <div>
      {/* Cover & Profile Header */}
      <div className="container pt-6">
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-[320px] md:h-[420px] overflow-hidden rounded-2xl">
            <Image
              src={author.coverImageUrl}
              alt="Cover"
              fill
              className="object-cover object-[center_35%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute -bottom-16 left-4 md:left-8">
            <div className="relative">
              <Image
                src={author.avatarUrl}
                alt={author.displayName}
                width={128}
                height={128}
                className="rounded-full border-4 border-background object-cover"
              />
            </div>
          </div>

          {/* Name on cover */}
          <div className="absolute bottom-4 left-40 md:left-48">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {author.displayName}
            </h1>
            <p className="text-white/80">{author.title}</p>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="container pt-20 pb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold">{author.stats.posts}</div>
              <div className="text-sm text-muted-foreground">Yazı</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{author.stats.followers}</div>
              <div className="text-sm text-muted-foreground">Takipçi</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{author.stats.following}</div>
              <div className="text-sm text-muted-foreground">Takip</div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button asChild variant="outline" size="sm">
              <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${author.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                {messages.pages.about.contact}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container pb-12">
        {/* Hakkımda */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">{messages.pages.about.title}</h2>
          <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {author.bio}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Deneyim */}
          <section>
            <h2 className="text-xl font-bold mb-4">{messages.pages.about.experience}</h2>
            <div className="space-y-4">
              {author.experience.map((exp, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-sm text-muted-foreground">{exp.period}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Eğitim */}
          <section>
            <h2 className="text-xl font-bold mb-4">{messages.pages.about.education}</h2>
            <div className="space-y-4">
              {author.education.map((edu, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-sm text-muted-foreground">{edu.school}</p>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
