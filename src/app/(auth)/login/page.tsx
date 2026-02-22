'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleLogin, useLogin } from '@/hooks/mutations/useAuth';
import { getApiErrorCode, getErrorMessage, getFieldErrors } from '@/lib/api/client';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { addLocaleToPath } from '@/lib/i18n';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const [showPassword, setShowPassword] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [googleSetupError, setGoogleSetupError] = useState<string | null>(null);
  const [googlePendingCredential, setGooglePendingCredential] = useState<string | null>(null);
  const [googleTwoFactorCode, setGoogleTwoFactorCode] = useState('');
  const [googleNeedsTwoFactor, setGoogleNeedsTwoFactor] = useState(false);
  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const googleEnabled = googleClientId.trim().length > 0;

  const loginSchema = z.object({
    email: z.string().email(messages.auth.validation.invalidEmail),
    password: z.string().min(6, messages.auth.validation.passwordMin),
    remember: z.boolean().optional(),
  });
  type LoginFormData = z.infer<typeof loginSchema>;

  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const handleGoogleCredential = useCallback(
    (response: { credential?: string }) => {
      const credential = response.credential ?? null;
      if (!credential) {
        setGoogleSetupError('Google kimlik bilgisi alınamadı.');
        return;
      }

      setGoogleSetupError(null);
      setGooglePendingCredential(credential);
      setGoogleNeedsTwoFactor(false);
      setGoogleTwoFactorCode('');
      googleLoginMutation.mutate({ credential });
    },
    [googleLoginMutation]
  );

  const initializeGoogleSignIn = useCallback(() => {
    if (!googleEnabled) {
      setGoogleSetupError(null);
      return;
    }

    if (!window.google?.accounts?.id || !googleButtonContainerRef.current) return;

    try {
      googleButtonContainerRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(googleButtonContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 360,
      });
      setGoogleSetupError(null);
    } catch {
      setGoogleSetupError('Google giriş başlatılamadı. Lütfen tekrar deneyin.');
    }
  }, [googleClientId, googleEnabled, handleGoogleCredential]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    clearErrors(['email', 'password']);
    loginMutation.mutate(data, {
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        fieldErrors.forEach((fieldError) => {
          const normalized = fieldError.field.trim().toLowerCase();
          if (normalized === 'email') {
            setError('email', { type: 'server', message: fieldError.message });
          }
          if (normalized === 'password') {
            setError('password', { type: 'server', message: fieldError.message });
          }
        });
      },
    });
  };

  const handleGoogleTwoFactorSubmit = () => {
    if (!googlePendingCredential) return;
    googleLoginMutation.mutate({
      credential: googlePendingCredential,
      twoFactorCode: googleTwoFactorCode,
    });
  };

  useEffect(() => {
    if (!googleEnabled || !googleScriptLoaded) return;
    if (googleButtonContainerRef.current?.childElementCount) return;
    initializeGoogleSignIn();
  }, [googleEnabled, googleScriptLoaded, initializeGoogleSignIn]);

  useEffect(() => {
    if (!googleLoginMutation.isError) return;
    const errorCode = getApiErrorCode(googleLoginMutation.error);
    const errorText = getErrorMessage(googleLoginMutation.error).toLowerCase();

    if (errorCode === 'two_factor_required' || errorText.includes('2fa code required')) {
      setGoogleNeedsTwoFactor(true);
      setGoogleSetupError('Google hesabın için 2FA kodu gerekli.');
      return;
    }

    if (errorCode === 'two_factor_invalid' || errorText.includes('invalid 2fa code')) {
      setGoogleNeedsTwoFactor(true);
      setGoogleSetupError('2FA kodu geçersiz. Tekrar deneyin.');
      return;
    }

    setGoogleNeedsTwoFactor(false);
    setGoogleSetupError(null);
  }, [googleLoginMutation.error, googleLoginMutation.isError]);

  return (
    <>
      {googleEnabled && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => {
            setGoogleScriptLoaded(true);
            initializeGoogleSignIn();
          }}
        />
      )}

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{messages.auth.loginTitle}</CardTitle>
          <CardDescription className="text-center">{messages.auth.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {registered && (
            <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
              {messages.auth.registerSuccess}
            </div>
          )}

          {(loginMutation.isError || googleLoginMutation.isError || googleSetupError) && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {googleSetupError ?? getErrorMessage(googleLoginMutation.error ?? loginMutation.error)}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{messages.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={messages.auth.placeholders.email}
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{messages.auth.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={messages.auth.placeholders.password}
                  className="pr-20"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('remember')}
                />
                {messages.auth.remember}
              </label>

              <Link
                href={addLocaleToPath('/forgot-password', locale)}
                className="text-sm text-primary hover:underline"
              >
                {messages.auth.forgotPassword}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? messages.auth.loggingIn : messages.auth.login}
            </Button>
          </form>

          {googleEnabled && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-center" ref={googleButtonContainerRef} />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={!googleScriptLoaded || googleLoginMutation.isPending}
                  onClick={() => window.google?.accounts?.id?.prompt()}
                >
                  {googleLoginMutation.isPending ? messages.auth.loggingIn : messages.auth.google}
                </Button>

                {googleNeedsTwoFactor && (
                  <div className="space-y-2 rounded-md border p-3">
                    <Label htmlFor="google-2fa">Google 2FA Kodu</Label>
                    <Input
                      id="google-2fa"
                      value={googleTwoFactorCode}
                      onChange={(event) => setGoogleTwoFactorCode(event.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                    />
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleGoogleTwoFactorSubmit}
                      disabled={googleLoginMutation.isPending || googleTwoFactorCode.trim().length !== 6}
                    >
                      {googleLoginMutation.isPending ? messages.auth.loggingIn : '2FA ile devam et'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            {messages.auth.noAccount}{' '}
            <Link href={addLocaleToPath('/register', locale)} className="text-primary hover:underline">
              {messages.auth.signUp}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
