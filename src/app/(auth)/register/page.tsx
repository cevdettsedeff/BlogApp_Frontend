'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/hooks/mutations/useAuth';
import { getErrorMessage } from '@/lib/api/client';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { addLocaleToPath } from '@/lib/i18n';

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { locale } = useLocale();
  const messages = getMessages(locale);

  const registerSchema = z
    .object({
      displayName: z.string().min(2, messages.auth.validation.nameMin).max(80),
      email: z.string().email(messages.auth.validation.invalidEmail).max(120),
      password: z
        .string()
        .min(6, messages.auth.validation.passwordMin)
        .max(72)
        .regex(/[A-Z]/, messages.auth.validation.passwordUpper)
        .regex(/[a-z]/, messages.auth.validation.passwordLower)
        .regex(/[0-9]/, messages.auth.validation.passwordNumber),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.auth.validation.passwordMismatch,
      path: ['confirmPassword'],
    });
  type RegisterFormData = z.infer<typeof registerSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      displayName: data.displayName,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{messages.auth.registerTitle}</CardTitle>
        <CardDescription className="text-center">
          {messages.auth.registerSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {registerMutation.isError && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {getErrorMessage(registerMutation.error)}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{messages.auth.name}</Label>
            <Input
              id="displayName"
              type="text"
              placeholder={messages.auth.placeholders.name}
              {...register('displayName')}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>

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
            <p className="text-xs text-muted-foreground">
              {messages.auth.passwordHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{messages.auth.passwordConfirm}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={messages.auth.placeholders.password}
                className="pr-20"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {showConfirmPassword ? 'Gizle' : 'Göster'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? messages.auth.registering : messages.auth.register}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          {messages.auth.haveAccount}{' '}
          <Link href={addLocaleToPath('/login', locale)} className="text-primary hover:underline">
            {messages.auth.signIn}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
