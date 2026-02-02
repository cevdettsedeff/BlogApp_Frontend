'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import { addLocaleToPath } from '@/lib/i18n';

export default function AuthorIndexPage() {
  const router = useRouter();
  const { locale } = useLocale();

  useEffect(() => {
    router.replace(addLocaleToPath('/author/posts', locale));
  }, [router, locale]);

  return null;
}
