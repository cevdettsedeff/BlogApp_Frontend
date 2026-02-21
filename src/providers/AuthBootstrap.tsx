'use client';

import { useEffect, useRef } from 'react';
import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/stores/authStore';

export function AuthBootstrap() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    const run = async () => {
      const store = useAuthStore.getState();
      store.setLoading(true);
      try {
        const auth = await authService.refresh();
        if (cancelled) return;
        if (auth.accessToken) {
          store.setAuth(auth.user, auth.accessToken);
        } else {
          store.logout();
        }
      } catch {
        if (!cancelled) {
          store.logout();
        }
      } finally {
        if (!cancelled) {
          useAuthStore.getState().setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

