'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Key, Link as LinkIcon, Mail, MessageSquarePlus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { addLocaleToPath } from '@/lib/i18n';
import { getErrorMessage } from '@/lib/api/client';
import { useFavorites, useProfile } from '@/hooks/queries';
import {
  useCreateSupportRequest,
  useRemoveFavorite,
  useUpdatePassword,
  useUpdateProfile,
  useUpdateSocials,
} from '@/hooks/mutations';
import { useAuthStore, useIsAuthenticated, useUser } from '@/stores/authStore';

type ProfileTab = 'profile' | 'favorites' | 'password' | 'email' | 'socials' | 'support';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const router = useRouter();

  const isAuthenticated = useIsAuthenticated();
  const authUser = useUser();
  const setUser = useAuthStore((state) => state.setUser);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: favoritesData, isLoading: favoritesLoading } = useFavorites(1, 20);

  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const updateSocials = useUpdateSocials();
  const createSupportRequest = useCreateSupportRequest();
  const removeFavorite = useRemoveFavorite();

  const [displayNameInput, setDisplayNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportContent, setSupportContent] = useState('');

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [socialsMessage, setSocialsMessage] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(addLocaleToPath('/login', locale));
    }
  }, [isAuthenticated, router, locale]);

  useEffect(() => {
    if (!profile) return;
    setDisplayNameInput((prev) => (prev === (profile.displayName ?? '') ? prev : profile.displayName ?? ''));
    setEmailInput((prev) => (prev === (profile.email ?? '') ? prev : profile.email ?? ''));
    setAvatarUrlInput((prev) => (prev === (profile.avatarUrl ?? '') ? prev : profile.avatarUrl ?? ''));
    setLinkedinUrl((prev) => (prev === (profile.linkedInUrl ?? '') ? prev : profile.linkedInUrl ?? ''));
    setInstagramUrl((prev) => (prev === (profile.instagramUrl ?? '') ? prev : profile.instagramUrl ?? ''));

    const currentUser = useAuthStore.getState().user;
    if (
      currentUser &&
      (currentUser.displayName !== profile.displayName ||
        currentUser.email !== profile.email ||
        currentUser.avatarUrl !== profile.avatarUrl ||
        currentUser.linkedInUrl !== profile.linkedInUrl ||
        currentUser.instagramUrl !== profile.instagramUrl)
    ) {
      setUser({
        ...currentUser,
        displayName: profile.displayName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        linkedInUrl: profile.linkedInUrl,
        instagramUrl: profile.instagramUrl,
      });
    }
  }, [profile, setUser]);

  const menuItems = useMemo(
    () => [
      { id: 'profile' as const, label: messages.pages.profile.menuProfile, icon: User },
      { id: 'favorites' as const, label: messages.pages.profile.menuFavorites, icon: Heart },
      { id: 'password' as const, label: messages.pages.profile.menuPassword, icon: Key },
      { id: 'email' as const, label: messages.pages.profile.menuEmail, icon: Mail },
      { id: 'socials' as const, label: messages.pages.profile.menuSocials, icon: LinkIcon },
      { id: 'support' as const, label: messages.pages.profile.menuSupport, icon: MessageSquarePlus },
    ],
    [messages]
  );

  const activeMenuItem = menuItems.find((item) => item.id === activeTab);
  const displayName = profile?.displayName ?? authUser?.displayName ?? messages.pages.profile.roleUser;
  const email = profile?.email ?? authUser?.email ?? '';
  const role = profile?.role ?? authUser?.role ?? 'User';
  const localizedRole =
    role === 'Admin'
      ? messages.pages.profile.roleAdmin
      : role === 'Editor'
        ? messages.pages.profile.roleEditor
        : messages.pages.profile.roleUser;
  const greetingName = displayName.trim().split(' ')[0] || messages.pages.profile.roleUser;
  const welcomeText = messages.pages.profile.welcome.replace('{name}', greetingName);
  const emailTabHint = messages.pages.profile.emailTabHint.replace('{tab}', messages.pages.profile.menuEmail);
  const favorites = favoritesData?.items ?? [];

  const handleSaveProfile = async () => {
    setProfileMessage(null);
    try {
      await updateProfile.mutateAsync({
        displayName: displayNameInput.trim() || null,
        email,
        avatarUrl: avatarUrlInput.trim() || null,
      });
      setProfileMessage(messages.pages.profile.profileUpdated);
    } catch (error) {
      setProfileMessage(getErrorMessage(error));
    }
  };

  const handleSaveEmail = async () => {
    setEmailMessage(null);
    try {
      await updateProfile.mutateAsync({
        displayName: displayNameInput.trim() || null,
        email: emailInput.trim() || null,
        avatarUrl: avatarUrlInput.trim() || null,
      });
      setEmailMessage(messages.pages.profile.emailUpdated);
    } catch (error) {
      setEmailMessage(getErrorMessage(error));
    }
  };

  const handleSavePassword = async () => {
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage(messages.pages.profile.passwordsMismatch);
      return;
    }
    try {
      await updatePassword.mutateAsync({
        currentPassword: currentPassword.trim() || null,
        newPassword: newPassword.trim() || null,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(messages.pages.profile.passwordUpdated);
    } catch (error) {
      setPasswordMessage(getErrorMessage(error));
    }
  };

  const handleSaveSocials = async () => {
    setSocialsMessage(null);
    try {
      await updateSocials.mutateAsync({
        linkedInUrl: linkedinUrl.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
      });
      setSocialsMessage(messages.pages.profile.socialsUpdated);
    } catch (error) {
      setSocialsMessage(getErrorMessage(error));
    }
  };

  const handleSendSupportRequest = async () => {
    setSupportMessage(null);
    if (!supportSubject.trim() || !supportContent.trim()) {
      setSupportMessage(messages.pages.profile.supportRequired);
      return;
    }
    try {
      await createSupportRequest.mutateAsync({
        subject: supportSubject.trim(),
        content: supportContent.trim(),
      });
      setSupportSubject('');
      setSupportContent('');
      setSupportMessage(messages.pages.profile.supportSent);
    } catch (error) {
      setSupportMessage(getErrorMessage(error));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container py-8">
      <div className="mb-8 rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-accent/40 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={avatarUrlInput || undefined} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{welcomeText}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border bg-card px-3 py-2">
              <p className="text-muted-foreground">{messages.pages.profile.favoritesLabel}</p>
              <p className="font-semibold">{favorites.length}</p>
            </div>
            <div className="rounded-lg border bg-card px-3 py-2">
              <p className="text-muted-foreground">{messages.pages.profile.roleLabel}</p>
              <p className="font-semibold">{localizedRole}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside>
          <nav className="space-y-1 rounded-xl border bg-card p-3 shadow-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                    activeTab === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{activeMenuItem?.label}</h2>
          </div>
          {profileLoading && <p className="text-sm text-muted-foreground">{messages.pages.profile.loading}</p>}

          {!profileLoading && activeTab === 'profile' && (
            <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                {messages.pages.profile.profileInfo}
              </div>
              <div>
                <Label htmlFor="displayName">{messages.pages.profile.fullName}</Label>
                <Input
                  id="displayName"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="avatarUrl">{messages.pages.profile.avatarUrl}</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="mt-1.5"
                  placeholder={messages.pages.profile.avatarPlaceholder}
                />
              </div>
              <p className="text-xs text-muted-foreground">{emailTabHint}</p>
              {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? messages.pages.profile.saving : messages.pages.profile.save}
              </Button>
            </section>
          )}

          {!profileLoading && activeTab === 'favorites' && (
            <section className="space-y-4">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                {messages.pages.profile.favoritesInfo}
              </div>
              {favoritesLoading ? (
                <p className="text-sm text-muted-foreground">{messages.pages.profile.loading}</p>
              ) : favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">{messages.pages.favorites.emptyTitle}</p>
              ) : (
                favorites.map((fav) => (
                  <article
                    key={fav.postId}
                    className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <Link
                        href={addLocaleToPath(`/posts/${fav.slug ?? ''}`, locale)}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {fav.title ?? ''}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(fav.favoritedAt)} {messages.pages.favorites.addedOn}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFavorite.mutate(fav.postId)}
                      disabled={removeFavorite.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </article>
                ))
              )}
            </section>
          )}

          {!profileLoading && activeTab === 'password' && (
            <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <p className="font-medium">{messages.pages.profile.passwordInfoTitle}</p>
                <p className="mt-1">{messages.pages.profile.passwordInfoBody}</p>
              </div>
              <div>
                <Label htmlFor="currentPassword">{messages.pages.profile.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{messages.pages.profile.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{messages.pages.profile.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              {passwordMessage && <p className="text-sm text-muted-foreground">{passwordMessage}</p>}
              <Button onClick={handleSavePassword} disabled={updatePassword.isPending}>
                {updatePassword.isPending ? messages.pages.profile.saving : messages.pages.profile.save}
              </Button>
            </section>
          )}

          {!profileLoading && activeTab === 'email' && (
            <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                {messages.pages.profile.emailInfo}
              </div>
              <div>
                <Label htmlFor="emailOnly">{messages.pages.profile.email}</Label>
                <Input
                  id="emailOnly"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              {emailMessage && <p className="text-sm text-muted-foreground">{emailMessage}</p>}
              <Button onClick={handleSaveEmail} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? messages.pages.profile.saving : messages.pages.profile.save}
              </Button>
            </section>
          )}

          {!profileLoading && activeTab === 'socials' && (
            <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                {messages.pages.profile.socialsInfo}
              </div>
              <h2 className="font-semibold">{messages.pages.profile.socialsTitle}</h2>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              {socialsMessage && <p className="text-sm text-muted-foreground">{socialsMessage}</p>}
              <Button onClick={handleSaveSocials} disabled={updateSocials.isPending}>
                {updateSocials.isPending ? messages.pages.profile.saving : messages.pages.profile.save}
              </Button>
            </section>
          )}

          {!profileLoading && activeTab === 'support' && (
            <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                {messages.pages.profile.supportInfo}
              </div>
              <div>
                <Label htmlFor="supportSubject">{messages.pages.profile.supportSubject}</Label>
                <Input
                  id="supportSubject"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="mt-1.5"
                  placeholder={messages.pages.profile.supportSubjectPlaceholder}
                />
              </div>
              <div>
                <Label htmlFor="supportContent">{messages.pages.profile.supportContent}</Label>
                <textarea
                  id="supportContent"
                  value={supportContent}
                  onChange={(e) => setSupportContent(e.target.value)}
                  className="mt-1.5 min-h-[150px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={messages.pages.profile.supportContentPlaceholder}
                />
              </div>
              {supportMessage && <p className="text-sm text-muted-foreground">{supportMessage}</p>}
              <Button onClick={handleSendSupportRequest} disabled={createSupportRequest.isPending}>
                {createSupportRequest.isPending ? messages.pages.profile.sending : messages.pages.profile.sendMessage}
              </Button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
