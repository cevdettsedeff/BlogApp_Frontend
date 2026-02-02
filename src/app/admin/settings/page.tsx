'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Static data
const recentPosts = [
  {
    id: 1,
    title: 'JWT ile Kimlik Doğrulama Nasıl Yapılır?',
    categoryName: 'Teknoloji',
    categorySlug: 'teknoloji',
    publishedAt: '2024-03-28T10:00:00Z',
  },
  {
    id: 2,
    title: "Portekiz'de Erasmus Günlüğüm",
    categoryName: 'Gezi',
    categorySlug: 'gezi',
    publishedAt: '2024-03-25T14:00:00Z',
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteTitle: 'Bilgi Blogu',
    siteDescription: 'Teknoloji, gezi ve kariyer üzerine yazılar.',
    logoUrl: '',
    contactEmail: 'bernaselin@example.com',
    footerText: '© 2026 Bilgi Blogu. Tüm hakları saklıdır.',
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">
          Site başlığı, açıklama, logo ve iletişim bilgilerini güncelleyin.
        </p>
      </div>

      {/* Settings Form */}
      <div className="max-w-xl space-y-6">
        <div>
          <Label htmlFor="siteTitle">Site başlığı</Label>
          <Input
            id="siteTitle"
            value={settings.siteTitle}
            onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="siteDescription">Site açıklaması</Label>
          <Input
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <Input
              id="logoUrl"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="flex-1"
              placeholder="https://..."
            />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Seç
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="contactEmail">İletişim e-postası</Label>
          <Input
            id="contactEmail"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="footerText">Footer metni</Label>
          <Input
            id="footerText"
            value={settings.footerText}
            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <Button className="w-full">
          Değişiklikleri kaydet
        </Button>
      </div>

      {/* Recent Posts */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Son Yazılar</h2>
        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 bg-card border rounded-lg"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={post.categorySlug === 'teknoloji' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {post.categoryName}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h3 className="font-medium">{post.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
