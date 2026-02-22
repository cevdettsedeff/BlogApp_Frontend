'use client';

import { useEffect, useMemo, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useAdminNotificationsStore } from '@/stores/adminNotificationsStore';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type {
  CommentCreatedNotification,
  SupportRequestCreatedNotification,
  UserLoggedInNotification,
  UserRegisteredNotification,
} from '@/types';

interface PostViewNotification {
  postId: string;
  title: string;
  viewCount: number;
  createdAt: string;
}

type LiveNotification =
  | { type: 'post-view'; payload: PostViewNotification }
  | { type: 'support-request'; payload: SupportRequestCreatedNotification }
  | { type: 'comment'; payload: CommentCreatedNotification }
  | { type: 'user'; payload: UserRegisteredNotification }
  | { type: 'user-login'; payload: UserLoggedInNotification };

export function AdminLiveViewNotifications() {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const registerSupportRequestNotification = useAdminNotificationsStore(
    (s) => s.registerSupportRequestNotification
  );
  const registerCommentNotification = useAdminNotificationsStore(
    (s) => s.registerCommentNotification
  );
  const registerUserNotification = useAdminNotificationsStore((s) => s.registerUserNotification);
  const [last, setLast] = useState<LiveNotification | null>(null);
  const [count, setCount] = useState(0);

  const hubUrl = useMemo(() => `${getApiBaseUrl()}/hubs/postViews`, []);

  useEffect(() => {
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.on('PostViewIncremented', (payload: PostViewNotification) => {
      setLast({ type: 'post-view', payload });
      setCount((c) => c + 1);
    });

    connection.on('SupportRequestCreated', (payload: SupportRequestCreatedNotification) => {
      const isNew = registerSupportRequestNotification(payload.requestId);
      if (!isNew) return;

      setLast({ type: 'support-request', payload });
      setCount((c) => c + 1);
      queryClient.invalidateQueries({ queryKey: ['admin-support-requests'] });
    });

    connection.on('CommentCreated', (payload: CommentCreatedNotification) => {
      const isNew = registerCommentNotification(payload.commentId);
      if (!isNew) return;

      setLast({ type: 'comment', payload });
      setCount((c) => c + 1);
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    });

    connection.on('UserRegistered', (payload: UserRegisteredNotification) => {
      const isNew = registerUserNotification(payload.userId);
      if (!isNew) return;

      setLast({ type: 'user', payload });
      setCount((c) => c + 1);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    });

    connection.on('UserLoggedIn', (payload: UserLoggedInNotification) => {
      setLast({ type: 'user-login', payload });
      setCount((c) => c + 1);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    });

    connection.start().catch(() => null);

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [
    hubUrl,
    queryClient,
    registerCommentNotification,
    registerSupportRequestNotification,
    registerUserNotification,
    token,
  ]);

  if (!last) return null;

  return (
    <div className="hidden md:flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">+1</span>
      {last.type === 'post-view' ? (
        <>
          <span className="truncate max-w-[220px]">{last.payload.title}</span>
          <span className="text-[10px] text-muted-foreground">Toplam: {last.payload.viewCount}</span>
        </>
      ) : last.type === 'comment' ? (
        <>
          <span className="truncate max-w-[220px]">Yeni yorum yapıldı: {last.payload.postTitle}</span>
          <span className="text-[10px] text-muted-foreground">
            {last.payload.userDisplayName ?? last.payload.guestName ?? 'Misafir'}
          </span>
        </>
      ) : last.type === 'user' ? (
        <>
          <span className="truncate max-w-[220px]">Yeni kayıt: {last.payload.displayName}</span>
          <span className="text-[10px] text-muted-foreground">{last.payload.email}</span>
        </>
      ) : last.type === 'user-login' ? (
        <>
          <span className="truncate max-w-[220px]">Giriş yaptı: {last.payload.displayName}</span>
          <span className="text-[10px] text-muted-foreground">{last.payload.email}</span>
        </>
      ) : (
        <>
          <span className="truncate max-w-[220px]">Yeni talep: {last.payload.subject}</span>
          <span className="text-[10px] text-muted-foreground">{last.payload.userDisplayName}</span>
        </>
      )}
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{count}</span>
    </div>
  );
}
