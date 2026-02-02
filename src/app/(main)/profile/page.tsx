'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Heart, Key, Link as LinkIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';

// Static data
const user = {
  displayName: 'Berna Selin Sedef',
  email: 'bernaselin@example.com',
  title: 'Software Engineer',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  coverImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  linkedinUrl: 'linkedin.com/in/example',
  instagramUrl: 'instagram.com/bernaselin',
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { locale } = useLocale();
  const messages = getMessages(locale);

  const menuItems = [
    { id: 'profile', label: messages.pages.profile.menuProfile, icon: User, active: true },
    { id: 'favorites', label: messages.pages.profile.menuFavorites, icon: Heart },
    { id: 'password', label: messages.pages.profile.menuPassword, icon: Key },
    { id: 'email', label: messages.pages.profile.menuEmail, icon: Settings },
    { id: 'socials', label: messages.pages.profile.menuSocials, icon: LinkIcon },
  ];
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    email: user.email,
    linkedinUrl: user.linkedinUrl,
    instagramUrl: user.instagramUrl,
  });

  return (
    <div>
      {/* Cover Image */}
      <div className="container pt-6">
        <div className="relative h-[320px] md:h-[420px] overflow-hidden rounded-2xl">
          <Image
            src={user.coverImageUrl}
            alt="Cover"
            fill
            className="object-cover object-[center_35%]"
            priority
          />
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            {/* User Info */}
            <div className="flex flex-col items-center md:items-start mb-6">
              <Avatar className="h-20 w-20 -mt-16 border-4 border-background">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold mt-3">{user.displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.title}</p>
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="max-w-xl">
              <h1 className="text-2xl font-bold mb-6">{messages.pages.profile.title}</h1>

              {/* Profile Form */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{user.title}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">{messages.pages.profile.fullName}</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{messages.pages.profile.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Accounts */}
              {activeTab === 'socials' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">{messages.pages.profile.socialsTitle}</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="linkedin"
                          value={formData.linkedinUrl}
                          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          + {messages.pages.profile.link}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="instagram"
                          value={formData.instagramUrl}
                          onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          + {messages.pages.profile.link}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8">
                <Button className="w-full md:w-auto px-8">
                  {messages.pages.profile.save}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
