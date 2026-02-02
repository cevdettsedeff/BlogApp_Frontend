import { en } from '@/locales/en';
import { tr } from '@/locales/tr';
import type { Locale } from './i18n';

const messages = { tr, en };

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages.tr;
}
