'use client';

import { useMemo, useState } from 'react';
import { Search, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';

type CommentStatus = 'Pending' | 'Approved' | 'Spam';

interface CommentItem {
  id: string;
  postTitle: string;
  content: string;
  userDisplayName: string | null;
  guestName: string | null;
  status: CommentStatus;
  createdAt: string;
}

const initialComments: CommentItem[] = [
  {
    id: '1',
    postTitle: 'Yeni Nesil Yapay Zeka Uygulamalari',
    content: 'Cok faydali bir yazi olmus, tesekkurler!',
    userDisplayName: 'Ahmet Yilmaz',
    guestName: null,
    status: 'Pending',
    createdAt: '2024-03-28T14:00:00Z',
  },
  {
    id: '2',
    postTitle: 'React 19 ile Gelen Yenilikler',
    content: 'Server components konusunu biraz daha acabilir misiniz?',
    userDisplayName: null,
    guestName: 'Mehmet',
    status: 'Approved',
    createdAt: '2024-03-27T10:30:00Z',
  },
  {
    id: '3',
    postTitle: "Portekiz'de Erasmus Gunlugum",
    content: 'Bu spam yorumdur.',
    userDisplayName: null,
    guestName: 'spammer123',
    status: 'Spam',
    createdAt: '2024-03-26T08:00:00Z',
  },
];

const statusLabels: Record<CommentStatus, string> = {
  Pending: 'Beklemede',
  Approved: 'Onayli',
  Spam: 'Spam',
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>(() => initialComments);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommentStatus | 'All'>('All');

  const counts = useMemo(() => {
    return comments.reduce(
      (acc, comment) => {
        acc.total += 1;
        acc[comment.status] += 1;
        return acc;
      },
      { total: 0, Pending: 0, Approved: 0, Spam: 0 }
    );
  }, [comments]);

  const filteredComments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return comments.filter((comment) => {
      if (statusFilter !== 'All' && comment.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      const author = (comment.userDisplayName || comment.guestName || '').toLowerCase();
      const content = comment.content.toLowerCase();
      const postTitle = comment.postTitle.toLowerCase();

      return (
        author.includes(normalizedQuery) ||
        content.includes(normalizedQuery) ||
        postTitle.includes(normalizedQuery)
      );
    });
  }, [comments, query, statusFilter]);

  const updateStatus = (id: string, status: CommentStatus) => {
    setComments((prev) =>
      prev.map((comment) => (comment.id === id ? { ...comment, status } : comment))
    );
  };

  const removeComment = (id: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yorumlar</h1>
        <p className="text-muted-foreground">Bekleyen ve onaylanan yorumlari yonetin</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Toplam</p>
          <p className="text-lg font-semibold">{counts.total}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Beklemede</p>
          <p className="text-lg font-semibold">{counts.Pending}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Onayli</p>
          <p className="text-lg font-semibold">{counts.Approved}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Spam</p>
          <p className="text-lg font-semibold">{counts.Spam}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Yorum ara..."
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value === 'All' ? 'All' : (event.target.value as CommentStatus))
          }
        >
          <option value="All">Tum Durumlar</option>
          <option value="Pending">Beklemede</option>
          <option value="Approved">Onayli</option>
          <option value="Spam">Spam</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Eslesen yorum bulunamadi.
          </div>
        ) : (
          filteredComments.map((comment) => {
            const displayName = comment.userDisplayName || comment.guestName || 'Anonim';
            const isGuest = !comment.userDisplayName;

            return (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{displayName}</span>
                      {isGuest && (
                        <Badge variant="outline" className="text-xs">Misafir</Badge>
                      )}
                      <Badge
                        variant={
                          comment.status === 'Approved'
                            ? 'default'
                            : comment.status === 'Pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className={comment.status === 'Approved' ? 'bg-green-500' : ''}
                      >
                        {statusLabels[comment.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      Yazi: <span className="text-foreground">{comment.postTitle}</span>
                    </p>

                    <p className="text-sm">{comment.content}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {comment.status !== 'Approved' && (
                        <Button
                          size="sm"
                          className="h-8 bg-green-500 hover:bg-green-600"
                          onClick={() => updateStatus(comment.id, 'Approved')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                      )}
                      {comment.status !== 'Spam' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => updateStatus(comment.id, 'Spam')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Spam
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive"
                        onClick={() => removeComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
