'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/mutations/useAuth';
import { getErrorMessage } from '@/lib/api/client';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { addLocaleToPath } from '@/lib/i18n';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const [showPassword, setShowPassword] = useState(false);
  const { locale } = useLocale();
  const messages = getMessages(locale);

  const loginSchema = z.object({
    email: z.string().email(messages.auth.validation.invalidEmail),
    password: z.string().min(6, messages.auth.validation.passwordMin),
    remember: z.boolean().optional(),
  });
  type LoginFormData = z.infer<typeof loginSchema>;
  
  const loginMutation = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{messages.auth.loginTitle}</CardTitle>
        <CardDescription className="text-center">
          {messages.auth.loginSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
            {messages.auth.registerSuccess}
          </div>
        )}

        {loginMutation.isError && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {getErrorMessage(loginMutation.error)}
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
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
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
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
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

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? messages.auth.loggingIn : messages.auth.login}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full">
          {messages.auth.google}
        </Button>
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
  );
}
