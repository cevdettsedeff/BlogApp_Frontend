'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, MessageSquareText, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminSupportRequests } from '@/hooks/queries';
import { formatDate } from '@/lib/utils';
import { useAdminNotificationsStore } from '@/stores/adminNotificationsStore';

const PAGE_SIZE = 10;

export default function AdminSupportRequestsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminSupportRequests(page, PAGE_SIZE);
  const clearSupportRequestsUnread = useAdminNotificationsStore((s) => s.clearSupportRequestsUnread);
  const [highlightedIds, setHighlightedIds] = useState<Record<string, boolean>>({});
  const prevIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      clearSupportRequestsUnread();
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [clearSupportRequestsUnread]);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (isLoading || items.length === 0) return;

    const previousIds = prevIdsRef.current;
    if (previousIds.length === 0) {
      prevIdsRef.current = items.map((item) => item.id);
      return;
    }

    const currentIds = items.map((item) => item.id);
    const newIds = currentIds.filter((id) => !previousIds.includes(id));

    if (newIds.length > 0) {
      setHighlightedIds((prev) => {
        const next = { ...prev };
        newIds.forEach((id) => {
          next[id] = true;
        });
        return next;
      });

      window.setTimeout(() => {
        setHighlightedIds((prev) => {
          const next = { ...prev };
          newIds.forEach((id) => {
            delete next[id];
          });
          return next;
        });
      }, 10000);
    }

    prevIdsRef.current = currentIds;
  }, [isLoading, items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kullanıcı Talepleri</h1>
        <p className="text-muted-foreground">
          Kullanıcıların admin ekibine ilettiği talepleri buradan takip edin.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Toplam Talep</p>
          <p className="text-lg font-semibold">{totalCount}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Bu Sayfada</p>
          <p className="text-lg font-semibold">{items.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          Henüz kullanıcı talebi yok.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((request) => (
            <article
              key={request.id}
              className={`rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 ${
                highlightedIds[request.id]
                  ? 'animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{request.subject}</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                  {request.status}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{request.content}</p>

              <div className="mt-4 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                <div className="inline-flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{request.userDisplayName}</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{request.userEmail}</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
        >
          Önceki
        </Button>
        <span className="text-sm text-muted-foreground">
          Sayfa {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
}
