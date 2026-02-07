'use client';

import { useEffect, useMemo, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useAuthStore } from '@/stores/authStore';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { formatDate } from '@/lib/utils';

interface PostViewNotification {
  postId: string;
  title: string;
  viewCount: number;
  createdAt: string;
}

export function AdminLiveViewPanel() {
  const token = useAuthStore((s) => s.accessToken);
  const [items, setItems] = useState<PostViewNotification[]>([]);

  const hubUrl = useMemo(() => `${getApiBaseUrl()}/hubs/postViews`, []);

  useEffect(() => {
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.on('PostViewIncremented', (payload: PostViewNotification) => {
      setItems((prev) => [payload, ...prev].slice(0, 8));
    });

    connection.start().catch(() => null);

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [hubUrl, token]);

  return (
    <section className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Canli Goruntuleme Bildirimleri</h2>
        <span className="text-xs text-muted-foreground">Son {items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">Henuz bildirim yok.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.postId}-${item.createdAt}-${index}`} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Toplam goruntuleme: {item.viewCount}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
