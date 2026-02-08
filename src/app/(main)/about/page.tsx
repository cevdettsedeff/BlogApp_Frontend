import Link from 'next/link';
import { Mail, Linkedin, Instagram } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLocaleFromRequest } from '@/lib/i18n-server';
import { getMessages } from '@/lib/i18n-dict';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { Locale } from '@/lib/i18n';
import type { PublicAboutDto, AboutMemberDto } from '@/types';

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

async function fetchAbout(locale: Locale): Promise<PublicAboutDto | null> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/${locale}/about`, {
    next: { revalidate: 120 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as PublicAboutDto;
}

function MemberCard({
  member,
  labels,
}: {
  member: AboutMemberDto;
  labels: {
    roleAdmin: string;
    roleAuthor: string;
    publishedPosts: string;
    contact: string;
  };
}) {
  const roleLabel = member.role === 'Admin' ? labels.roleAdmin : labels.roleAuthor;

  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.displayName} /> : null}
          <AvatarFallback>{initialsFromName(member.displayName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{member.displayName}</h3>
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
          {member.bio ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{member.bio}</p> : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {labels.publishedPosts}: {member.publishedPostCount}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {member.email ? (
          <Button asChild variant="outline" size="sm">
            <a href={`mailto:${member.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              {labels.contact}
            </a>
          </Button>
        ) : null}
        {member.linkedInUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={member.linkedInUrl} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </a>
          </Button>
        ) : null}
        {member.instagramUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram className="mr-2 h-4 w-4" />
              Instagram
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export default async function AboutPage() {
  const locale = getLocaleFromRequest();
  const messages = getMessages(locale);
  const about = await fetchAbout(locale);

  const fallbackTitle = messages.pages.about.title;
  const fallbackDescription =
    locale === 'tr'
      ? 'Editör ekibimiz ve yöneticilerimizle tanışın.'
      : 'Meet our editorial team and administrators.';

  const authors = about?.authors ?? [];
  const admins = about?.admins ?? [];
  const contact = about?.contact;

  return (
    <div className="container py-10 space-y-10">
      <section className="rounded-2xl border bg-card p-8">
        <Badge className="mb-3">{messages.nav.about}</Badge>
        <h1 className="text-3xl font-bold">{about?.title ?? fallbackTitle}</h1>
        <p className="mt-3 text-muted-foreground">{about?.description ?? fallbackDescription}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{messages.pages.about.authors}</h2>
          <span className="text-sm text-muted-foreground">{authors.length}</span>
        </div>
        {authors.length === 0 ? (
          <p className="text-sm text-muted-foreground">{messages.pages.about.emptyAuthors}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {authors.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                labels={{
                  roleAdmin: messages.pages.about.roleAdmin,
                  roleAuthor: messages.pages.about.roleAuthor,
                  publishedPosts: messages.pages.about.publishedPosts,
                  contact: messages.pages.about.contact,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{messages.pages.about.admins}</h2>
          <span className="text-sm text-muted-foreground">{admins.length}</span>
        </div>
        {admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">{messages.pages.about.emptyAdmins}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {admins.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                labels={{
                  roleAdmin: messages.pages.about.roleAdmin,
                  roleAuthor: messages.pages.about.roleAuthor,
                  publishedPosts: messages.pages.about.publishedPosts,
                  contact: messages.pages.about.contact,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-8">
        <h2 className="text-2xl font-semibold">{messages.pages.about.contactSection}</h2>
        <p className="mt-2 text-muted-foreground">
          {contact?.siteTitle ?? 'Blog'} - {contact?.siteDescription ?? ''}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {contact?.email ? (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${contact.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                {messages.pages.about.contact}
              </a>
            </Button>
          ) : null}
          {contact?.linkedInUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={contact.linkedInUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          ) : null}
          {contact?.instagramUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-4 w-4" />
                Instagram
              </a>
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${locale}`}>{locale === 'tr' ? 'Ana sayfaya dön' : 'Back to home'}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
