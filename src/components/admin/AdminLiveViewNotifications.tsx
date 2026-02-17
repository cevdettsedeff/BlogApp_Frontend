'use client';

import { useEffect, useMemo, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useAuthStore } from '@/stores/authStore';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import type { SupportRequestCreatedNotification } from '@/types';

interface PostViewNotification {
  postId: string;
  title: string;
  viewCount: number;
  createdAt: string;
}

type LiveNotification =
  | { type: 'post-view'; payload: PostViewNotification }
  | { type: 'support-request'; payload: SupportRequestCreatedNotification };

export function AdminLiveViewNotifications() {
  const token = useAuthStore((s) => s.accessToken);
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
      setLast({ type: 'support-request', payload });
      setCount((c) => c + 1);
    });

    connection.start().catch(() => null);

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [hubUrl, token]);

  if (!last) return null;

  return (
    <div className="hidden md:flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">+1</span>
      {last.type === 'post-view' ? (
        <>
          <span className="truncate max-w-[220px]">{last.payload.title}</span>
          <span className="text-[10px] text-muted-foreground">Toplam: {last.payload.viewCount}</span>
        </>
      ) : (
        <>
          <span className="truncate max-w-[220px]">Yeni talep: {last.payload.subject}</span>
          <span className="text-[10px] text-muted-foreground">{last.payload.userDisplayName}</span>
        </>
      )}
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
        {count}
      </span>
    </div>
  );
}
