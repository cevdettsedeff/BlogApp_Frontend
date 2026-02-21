import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest, GoogleLoginRequest } from '@/types';
import { addLocaleToPath } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import { startRouteLoading } from '@/components/layout/RouteLoading';
import { getMessages } from '@/lib/i18n-dict';

export function useLogin() {
  const router = useRouter();
  const { locale } = useLocale();
  const setAuth = useAuthStore((state) => state.setAuth);
  const messages = getMessages(locale);

  return useMutation({
    onMutate: () => {
      startRouteLoading(undefined, messages.auth.loggingIn);
    },
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      const href =
        data.user.role === 'Admin'
          ? addLocaleToPath('/admin', locale)
          : data.user.role === 'Author'
            ? addLocaleToPath('/author/posts', locale)
            : addLocaleToPath('/', locale);
      startRouteLoading(href, messages.auth.loggingIn);
      router.push(href);
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { locale } = useLocale();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      const href = `${addLocaleToPath('/login', locale)}?registered=true`;
      startRouteLoading(href);
      router.push(href);
    },
  });
}

export function useGoogleLogin() {
  const router = useRouter();
  const { locale } = useLocale();
  const setAuth = useAuthStore((state) => state.setAuth);
  const messages = getMessages(locale);

  return useMutation({
    onMutate: () => {
      startRouteLoading(undefined, messages.auth.loggingIn);
    },
    mutationFn: (data: GoogleLoginRequest) => authService.googleLogin(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      const href =
        data.user.role === 'Admin'
          ? addLocaleToPath('/admin', locale)
          : data.user.role === 'Author'
            ? addLocaleToPath('/author/posts', locale)
            : addLocaleToPath('/', locale);
      startRouteLoading(href, messages.auth.loggingIn);
      router.push(href);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    onMutate: () => {
      startRouteLoading(undefined, messages.auth.loggingOut);
    },
    mutationFn: () => {
      return authService.logout();
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      const href = addLocaleToPath('/', locale);
      startRouteLoading(href, messages.auth.loggingOut);
      router.push(href);
    },
  });
}

