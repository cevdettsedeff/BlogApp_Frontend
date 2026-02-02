'use client';

import Link from 'next/link';
import { addLocaleToPath } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n-dict';
import { useLocale } from '@/hooks/useLocale';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const localize = (href: string) => addLocaleToPath(href, locale);

  return (
    <footer className="relative overflow-hidden border-t bg-gradient-to-b from-muted/30 via-background to-muted/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {messages.footer.tagline}
            </p>
            <h3 className="text-2xl font-semibold">{messages.footer.copyright}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {messages.footer.description}
            </p>
            <Link
              href={localize('/')}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              {messages.footer.cta}
            </Link>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {messages.footer.linksTitle}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href={localize('/')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.nav.home}
              </Link>
              <Link
                href={localize('/about')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.nav.about}
              </Link>
              <Link
                href={localize('/favorites')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.pages.favorites.title}
              </Link>
              <Link
                href={localize('/categories')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.pages.categories.title}
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {messages.footer.categoriesTitle}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href={localize('/categories/teknoloji')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.nav.tech}
              </Link>
              <Link
                href={localize('/categories/gezi')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.nav.travel}
              </Link>
              <Link
                href={localize('/categories/kariyer')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.nav.career}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {currentYear} {messages.footer.copyright}. {messages.footer.legal}
          </p>
          <p>{messages.footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
