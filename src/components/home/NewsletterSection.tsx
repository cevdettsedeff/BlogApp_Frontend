'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const { locale } = useLocale();
  const messages = getMessages(locale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200"
          alt="Newsletter background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
      </div>

      {/* Content */}
      <div className="container relative">
        <div className="max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {messages.home.newsletterTitle}
          </h2>
          <p className="text-white/70 mb-6">
            {messages.home.newsletterBody}
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="email"
              placeholder={messages.home.newsletterPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary"
              required
            />
            <Button type="submit" className="px-6">
              {messages.home.newsletterButton}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
