import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest, GoogleLoginRequest } from '@/types';
import { addLocaleToPath } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import { startRouteLoading } from '@/components/layout/RouteLoading';
import { getMessages } from '@/lib/i18n-dict';

const MOCK_EMAIL = 'admin@admin.com.tr';
const MOCK_PASSWORD = 'admin123';
const MOCK_AUTHOR_EMAIL = 'cevdet@cevdet.com.tr';
const MOCK_AUTHOR_PASSWORD = 'cevdet123';

const normalize = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const firstPart = trimmed.split(/[,\s;]/)[0] || trimmed;
  return firstPart.replace(/\s+/g, '');
};

const normalizePassword = (value: string) => {
  const base = normalize(value);
  return base.replace(/[.\-_/]+$/g, '');
};

function buildMockAuthResponse(email: string, role: 'Admin' | 'Author', displayName: string) {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: {
      id: role === 'Admin' ? 'mock-admin-id' : 'mock-author-id',
      displayName,
      email,
      role,
      linkedInUrl: null,
      instagramUrl: null,
    },
  };
}

export function useLogin() {
  const router = useRouter();
  const { locale } = useLocale();
  const setAuth = useAuthStore((state) => state.setAuth);
  const messages = getMessages(locale);

  return useMutation({
    onMutate: () => {
      startRouteLoading(undefined, messages.auth.loggingIn);
    },
    mutationFn: (data: LoginRequest) => {
      const email = normalize(data.email);
      const password = normalizePassword(data.password);
      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        return Promise.resolve(buildMockAuthResponse(email, 'Admin', 'Admin'));
      }
      if (email === MOCK_AUTHOR_EMAIL && password === MOCK_AUTHOR_PASSWORD) {
        return Promise.resolve(buildMockAuthResponse(email, 'Author', 'Cevdet'));
      }
      return authService.login(data);
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
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
    mutationFn: (data: GoogleLoginRequest) => authService.googleLogin(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      const href = addLocaleToPath('/', locale);
      startRouteLoading(href);
      router.push(href);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const queryClient = useQueryClient();
  const { refreshToken, logout } = useAuthStore();

  return useMutation({
    onMutate: () => {
      startRouteLoading(undefined, messages.auth.loggingOut);
    },
    mutationFn: () => {
      if (refreshToken) {
        return authService.logout({ refreshToken });
      }
      return Promise.resolve({ success: true });
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

