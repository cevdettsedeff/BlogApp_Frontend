'use client';

import { useMemo, useState } from 'react';
import { ThumbsDown, ThumbsUp, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDateTime, getInitials } from '@/lib/utils';

type Reaction = 'like' | 'dislike' | null;
type CommentStatus = 'Approved' | 'Pending';

interface ReplyItem {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  status: CommentStatus;
}

interface CommentItem {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  myReaction: Reaction;
  status: CommentStatus;
  replies: ReplyItem[];
}

interface CommentsStrings {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyBody: string;
  formTitle: string;
  namePlaceholder: string;
  commentPlaceholder: string;
  submit: string;
  likeLabel: string;
  dislikeLabel: string;
  countLabel: string;
  pendingNotice: string;
  pendingTitle: string;
  pendingRepliesTitle: string;
  pendingBadge: string;
  replyLabel: string;
  replyPlaceholder: string;
  replySubmit: string;
  repliesLabel: string;
}

interface CommentsSectionProps {
  postId: string;
  strings: CommentsStrings;
}

const initialComments: CommentItem[] = [
  {
    id: 'c-1',
    author: 'Elif Yilmaz',
    content: 'Harika bir yazi, ozellikle CV bolumu cok faydaliydi.',
    createdAt: '2024-03-29T09:12:00Z',
    likes: 4,
    dislikes: 0,
    myReaction: null,
    status: 'Approved',
    replies: [
      {
        id: 'r-1',
        author: 'Berna Selin Sedef',
        content: 'Cok sevindim! CV bolumune biraz daha kaynak ekleyecegim.',
        createdAt: '2024-03-29T12:15:00Z',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'c-2',
    author: 'Mert Kaya',
    content: 'Networking konusunda verdiginiz ipuclarini hemen uygulayacagim.',
    createdAt: '2024-03-29T11:40:00Z',
    likes: 2,
    dislikes: 1,
    myReaction: null,
    status: 'Approved',
    replies: [],
  },
];

export function CommentsSection({ postId, strings }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(() => initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<
    Record<string, { author: string; content: string; open: boolean }>
  >({});

  const approvedComments = useMemo(
    () => comments.filter((comment) => comment.status === 'Approved'),
    [comments]
  );
  const pendingComments = useMemo(
    () => comments.filter((comment) => comment.status === 'Pending'),
    [comments]
  );
  const pendingReplies = useMemo(
    () =>
      comments.flatMap((comment) =>
        comment.replies
          .filter((reply) => reply.status === 'Pending')
          .map((reply) => ({
            ...reply,
            parentId: comment.id,
            parentAuthor: comment.author,
          }))
      ),
    [comments]
  );

  const totalLabel = useMemo(
    () => `${approvedComments.length} ${strings.countLabel}`,
    [approvedComments.length, strings.countLabel]
  );

  const isSubmitDisabled = !author.trim() || !content.trim();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: author.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      myReaction: null,
      status: 'Pending',
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);
    setAuthor('');
    setContent('');
  };

  const handleReaction = (commentId: string, reaction: Exclude<Reaction, null>) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;

        if (comment.myReaction === reaction) {
          const nextLikes =
            reaction === 'like' ? Math.max(0, comment.likes - 1) : comment.likes;
          const nextDislikes =
            reaction === 'dislike' ? Math.max(0, comment.dislikes - 1) : comment.dislikes;

          return {
            ...comment,
            myReaction: null,
            likes: nextLikes,
            dislikes: nextDislikes,
          };
        }

        const nextLikes =
          reaction === 'like'
            ? comment.likes + 1
            : comment.myReaction === 'like'
              ? Math.max(0, comment.likes - 1)
              : comment.likes;
        const nextDislikes =
          reaction === 'dislike'
            ? comment.dislikes + 1
            : comment.myReaction === 'dislike'
              ? Math.max(0, comment.dislikes - 1)
              : comment.dislikes;

        return {
          ...comment,
          myReaction: reaction,
          likes: nextLikes,
          dislikes: nextDislikes,
        };
      })
    );
  };

  const toggleReply = (commentId: string) => {
    setReplyDrafts((prev) => {
      const current = prev[commentId] ?? { author: '', content: '', open: false };
      return { ...prev, [commentId]: { ...current, open: !current.open } };
    });
  };

  const updateReplyDraft = (
    commentId: string,
    updates: Partial<{ author: string; content: string }>
  ) => {
    setReplyDrafts((prev) => {
      const current = prev[commentId] ?? { author: '', content: '', open: true };
      return { ...prev, [commentId]: { ...current, ...updates } };
    });
  };

  const submitReply = (commentId: string) => {
    const draft = replyDrafts[commentId];
    if (!draft || !draft.author.trim() || !draft.content.trim()) return;

    const reply: ReplyItem = {
      id: `r-${Date.now()}`,
      author: draft.author.trim(),
      content: draft.content.trim(),
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [reply, ...comment.replies] }
          : comment
      )
    );

    setReplyDrafts((prev) => ({
      ...prev,
      [commentId]: { author: '', content: '', open: false },
    }));
  };

  return (
    <section className="mb-12" data-post-id={postId}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">{strings.title}</h2>
          <p className="text-sm text-muted-foreground">{strings.subtitle}</p>
        </div>
        <span className="text-sm text-muted-foreground">{totalLabel}</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border rounded-xl p-5 md:p-6 bg-muted/20 mb-8"
      >
        <h3 className="font-semibold mb-4">{strings.formTitle}</h3>
        <p className="text-xs text-muted-foreground mb-4">{strings.pendingNotice}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder={strings.namePlaceholder}
            aria-label={strings.namePlaceholder}
          />
          <div className="md:col-span-2">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={strings.commentPlaceholder}
              aria-label={strings.commentPlaceholder}
              rows={4}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitDisabled}>
            {strings.submit}
          </Button>
        </div>
      </form>

      {approvedComments.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <MessageCircle className="h-6 w-6 mx-auto mb-3" />
          <p className="font-medium text-foreground">{strings.emptyTitle}</p>
          <p className="text-sm">{strings.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedComments.map((comment) => {
            const approvedReplies = comment.replies.filter(
              (reply) => reply.status === 'Approved'
            );
            const replyDraft = replyDrafts[comment.id] ?? {
              author: '',
              content: '',
              open: false,
            };

            return (
              <article key={comment.id} className="border rounded-xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">-</span>
                      <time className="text-xs text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant={comment.myReaction === 'like' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction(comment.id, 'like')}
                        aria-pressed={comment.myReaction === 'like'}
                        className={cn('gap-1', comment.myReaction === 'like' && 'text-primary')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes}</span>
                        <span className="sr-only">{strings.likeLabel}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={comment.myReaction === 'dislike' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction(comment.id, 'dislike')}
                        aria-pressed={comment.myReaction === 'dislike'}
                        className={cn('gap-1', comment.myReaction === 'dislike' && 'text-primary')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{comment.dislikes}</span>
                        <span className="sr-only">{strings.dislikeLabel}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => toggleReply(comment.id)}
                      >
                        {strings.replyLabel}
                      </Button>
                      {approvedReplies.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {approvedReplies.length} {strings.repliesLabel}
                        </span>
                      )}
                    </div>

                    {approvedReplies.length > 0 && (
                      <div className="mt-4 space-y-3 border-l pl-4">
                        {approvedReplies.map((reply) => (
                          <div key={reply.id} className="text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{reply.author}</span>
                              <span className="text-xs text-muted-foreground">-</span>
                              <time className="text-xs text-muted-foreground">
                                {formatDateTime(reply.createdAt)}
                              </time>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {replyDraft.open && (
                      <div className="mt-4 border rounded-lg p-4 bg-muted/20">
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            value={replyDraft.author}
                            onChange={(event) =>
                              updateReplyDraft(comment.id, { author: event.target.value })
                            }
                            placeholder={strings.namePlaceholder}
                            aria-label={strings.namePlaceholder}
                          />
                          <div className="md:col-span-2">
                            <textarea
                              value={replyDraft.content}
                              onChange={(event) =>
                                updateReplyDraft(comment.id, { content: event.target.value })
                              }
                              placeholder={strings.replyPlaceholder}
                              aria-label={strings.replyPlaceholder}
                              rows={3}
                              className={cn(
                                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                              )}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => submitReply(comment.id)}
                            disabled={!replyDraft.author.trim() || !replyDraft.content.trim()}
                          >
                            {strings.replySubmit}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(pendingComments.length > 0 || pendingReplies.length > 0) && (
        <div className="mt-8 border rounded-xl p-5 md:p-6 bg-muted/10">
          {pendingComments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{strings.pendingTitle}</h3>
              <div className="space-y-3">
                {pendingComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border rounded-lg p-3 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{comment.author}</span>
                      <span className="text-xs uppercase tracking-wide">
                        {strings.pendingBadge}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingReplies.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{strings.pendingRepliesTitle}</h3>
              <div className="space-y-3">
                {pendingReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="border rounded-lg p-3 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{reply.author}</span>
                      <span className="text-xs uppercase tracking-wide">
                        {strings.pendingBadge}
                      </span>
                    </div>
                    <p className="mt-1">{reply.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {reply.parentAuthor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
