'use client';

import { useMemo, useState } from 'react';
import { CornerUpRight, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDateTime, getInitials } from '@/lib/utils';
import { useComments } from '@/hooks/queries/useComments';
import { useMyPendingComments } from '@/hooks/queries/useMyPendingComments';
import { useCreateComment } from '@/hooks/mutations/useComments';
import { useUser } from '@/stores/authStore';
import { useLocale } from '@/hooks/useLocale';
import { getMessages } from '@/lib/i18n-dict';
import { commentService } from '@/lib/api/services';
import type { CommentDto } from '@/types';

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
  loginToReact: string;
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

type PendingItem = {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  authorName: string;
  createdAt: string;
};

type ReactionState = {
  likeCount: number;
  dislikeCount: number;
  userReaction: 'like' | 'dislike' | null;
};

const DEFAULT_AUTHOR = 'Anonim';

export function CommentsSection({ postId, strings }: CommentsSectionProps) {
  const user = useUser();
  const { locale } = useLocale();
  const messages = getMessages(locale);
  const { data, isLoading } = useComments(postId);
  const pendingPageSize = 5;
  const [pendingPage, setPendingPage] = useState(1);
  const { data: myPendingData, isLoading: isPendingLoading } = useMyPendingComments(
    postId,
    pendingPage,
    pendingPageSize,
    !!user
  );
  const createComment = useCreateComment();
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyAuthors, setReplyAuthors] = useState<Record<string, string>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [reactionStates, setReactionStates] = useState<Record<string, ReactionState>>({});
  const [reactingId, setReactingId] = useState<string | null>(null);

  const comments = useMemo(() => data ?? [], [data]);
  const approvedComments = useMemo(
    () => comments.filter((comment) => comment.status === 'Approved'),
    [comments]
  );
  const pendingComments = useMemo(
    () => comments.filter((comment) => comment.status === 'Pending'),
    [comments]
  );

  const pendingFromApi = useMemo(() => {
    if (!myPendingData) return [];
    return myPendingData.map((item) => ({
      id: item.id,
      postId: item.postId,
      parentCommentId: null,
      content: item.content ?? '',
      authorName: item.userDisplayName ?? item.guestName ?? DEFAULT_AUTHOR,
      createdAt: item.createdAt,
    }));
  }, [myPendingData]);

  const mergedPendingItems = useMemo(() => {
    const map = new Map<string, PendingItem>();
    pendingFromApi.forEach((item) => map.set(item.id, item));
    pendingItems.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [pendingFromApi, pendingItems]);

  const hasPrevPendingPage = pendingPage > 1;
  const hasNextPendingPage =
    (myPendingData?.length ?? 0) >= pendingPageSize;

  const pendingRootItems = mergedPendingItems.filter((item) => !item.parentCommentId);
  const pendingReplyItems = mergedPendingItems.filter((item) => item.parentCommentId);

  const totalLabel = useMemo(
    () => `${approvedComments.length} ${strings.countLabel}`,
    [approvedComments.length, strings.countLabel]
  );

  const emailValue = email.trim();
  const emailValid = !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const isSubmitDisabled =
    !content.trim() || (!user && !author.trim()) || (!user && !emailValid);

  const addPendingItem = (item: PendingItem) =>
    setPendingItems((prev) => [item, ...prev]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    const payload = {
      postId,
      content: content.trim(),
      userId: user?.id ?? null,
      guestName: user ? null : author.trim(),
      guestEmail: user ? null : email.trim() || null,
      parentCommentId: null,
    };

    createComment.mutate(payload, {
      onSuccess: (response) => {
        addPendingItem({
          id: response.commentId,
          postId,
          parentCommentId: null,
          content: payload.content ?? '',
          authorName: user?.displayName ?? payload.guestName ?? DEFAULT_AUTHOR,
          createdAt: new Date().toISOString(),
        });
        setAuthor('');
        setEmail('');
        setContent('');
      },
    });
  };

  const normalizeReaction = (value: string | null) => {
    if (!value) return null;
    const lower = value.toLowerCase();
    if (lower === 'like') return 'like';
    if (lower === 'dislike') return 'dislike';
    return null;
  };

  const getReactionState = (comment: CommentDto) =>
    reactionStates[comment.id] ?? {
      likeCount: comment.likeCount ?? 0,
      dislikeCount: comment.dislikeCount ?? 0,
      userReaction: normalizeReaction(comment.userReaction),
    };

  const handleReaction = async (comment: CommentDto, next: 'like' | 'dislike') => {
    if (!user) return;
    const current = reactionStates[comment.id] ?? {
      userReaction: normalizeReaction(comment.userReaction),
    };

    setReactingId(comment.id);
    try {
      const response =
        next === 'like'
          ? await commentService.like(comment.id)
          : await commentService.dislike(comment.id);

      setReactionStates((prev) => ({
        ...prev,
        [comment.id]: {
          likeCount: response.likeCount,
          dislikeCount: response.dislikeCount,
          userReaction:
            current.userReaction === next ? null : next,
        },
      }));
    } finally {
      setReactingId(null);
    }
  };

  const handleReplySubmit = (targetId: string) => {
    const draft = replyDrafts[targetId]?.trim();
    if (!draft) return;

    const payload = {
      postId,
      content: draft,
      userId: user?.id ?? null,
      guestName: user ? null : replyAuthors[targetId]?.trim(),
      guestEmail: null,
      parentCommentId: targetId,
    };

    if (!user && !payload.guestName) return;

    createComment.mutate(payload, {
      onSuccess: (response) => {
        addPendingItem({
          id: response.commentId,
          postId,
          parentCommentId: targetId,
          content: payload.content ?? '',
          authorName: user?.displayName ?? payload.guestName ?? DEFAULT_AUTHOR,
          createdAt: new Date().toISOString(),
        });
        setReplyDrafts((prev) => ({ ...prev, [targetId]: '' }));
        setReplyAuthors((prev) => ({ ...prev, [targetId]: '' }));
        setReplyingToId(null);
      },
    });
  };

  const countReplies = (comment: CommentDto): number =>
    comment.replies.reduce((acc, reply) => acc + 1 + countReplies(reply), 0);

  const renderReactions = (comment: CommentDto) => {
    const reaction = getReactionState(comment);
    const isReacting = reactingId === comment.id;
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => handleReaction(comment, 'like')}
          disabled={!user || isReacting}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition',
            reaction.userReaction === 'like' && 'border-primary text-primary',
            (!user || isReacting) && 'cursor-not-allowed opacity-60'
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{strings.likeLabel}</span>
          <span className="text-[10px]">{reaction.likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => handleReaction(comment, 'dislike')}
          disabled={!user || isReacting}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition',
            reaction.userReaction === 'dislike' && 'border-destructive text-destructive',
            (!user || isReacting) && 'cursor-not-allowed opacity-60'
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{strings.dislikeLabel}</span>
          <span className="text-[10px]">{reaction.dislikeCount}</span>
        </button>
        {!user && <span className="text-[11px]">{strings.loginToReact}</span>}
      </div>
    );
  };

  const renderReplyForm = (targetId: string) => {
    const isOpen = replyingToId === targetId;
    if (!isOpen) return null;
    return (
      <div className="mt-4 rounded-lg border bg-muted/20 p-4">
        {!user && (
          <Input
            value={replyAuthors[targetId] ?? ''}
            onChange={(event) =>
              setReplyAuthors((prev) => ({ ...prev, [targetId]: event.target.value }))
            }
            placeholder={strings.namePlaceholder}
            aria-label={strings.namePlaceholder}
            className="mb-3"
          />
        )}
        <textarea
          value={replyDrafts[targetId] ?? ''}
          onChange={(event) =>
            setReplyDrafts((prev) => ({ ...prev, [targetId]: event.target.value }))
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
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setReplyingToId(null)}>
            {messages.adminPosts.cancel}
          </Button>
          <Button type="button" onClick={() => handleReplySubmit(targetId)}>
            {strings.replySubmit}
          </Button>
        </div>
      </div>
    );
  };

  const renderComment = (comment: CommentDto, depth = 0) => {
    const displayName =
      comment.userDisplayName || comment.guestName || DEFAULT_AUTHOR;
    const replyCount = countReplies(comment);

    return (
      <article
        key={comment.id}
        className={cn(
          'border rounded-2xl p-4 md:p-5 bg-background/70',
          depth > 0 && 'ml-6 md:ml-10'
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <time className="text-xs text-muted-foreground">
                {formatDateTime(comment.createdAt)}
              </time>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setReplyingToId(comment.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
              >
                <CornerUpRight className="h-3.5 w-3.5" />
                {strings.replyLabel}
              </button>
              {depth === 0 && (
                <span className="text-xs text-muted-foreground">
                  {replyCount} {strings.repliesLabel}
                </span>
              )}
              {renderReactions(comment)}
            </div>
            {renderReplyForm(comment.id)}
            {comment.replies.length > 0 && (
              <div className="mt-4 space-y-4 border-l pl-4">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </article>
    );
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
        className="border rounded-2xl p-5 md:p-6 bg-gradient-to-br from-muted/40 via-background to-background mb-8 shadow-sm"
      >
        <h3 className="font-semibold mb-4">{strings.formTitle}</h3>
        <p className="text-xs text-muted-foreground mb-4">{strings.pendingNotice}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {!user && (
            <Input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder={strings.namePlaceholder}
              aria-label={strings.namePlaceholder}
            />
          )}
          {!user && (
            <div className="space-y-1">
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={messages.auth.placeholders.email}
                aria-label={messages.auth.placeholders.email}
                type="email"
              />
              {!emailValid && (
                <p className="text-xs text-destructive">
                  {messages.auth.validation.invalidEmail}
                </p>
              )}
            </div>
          )}
          <div className={cn('md:col-span-2')}>
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
          <Button type="submit" disabled={isSubmitDisabled || createComment.isPending}>
            {createComment.isPending ? `${strings.submit}...` : strings.submit}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          {strings.pendingBadge}
        </div>
      ) : approvedComments.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <MessageCircle className="h-6 w-6 mx-auto mb-3" />
          <p className="font-medium text-foreground">{strings.emptyTitle}</p>
          <p className="text-sm">{strings.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {approvedComments.map((comment) => renderComment(comment))}
        </div>
      )}

      {(pendingComments.length > 0 ||
        pendingRootItems.length > 0 ||
        pendingReplyItems.length > 0 ||
        isPendingLoading) && (
        <div className="mt-8 border rounded-xl p-5 md:p-6 bg-muted/10">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold">{strings.pendingTitle}</h3>
              {user && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPendingPage}
                    onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                  >
                    {messages.adminPosts.prev}
                  </Button>
                  <span>Sayfa {pendingPage}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPendingPage}
                    onClick={() => setPendingPage((p) => p + 1)}
                  >
                    {messages.adminPosts.next}
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {pendingComments.map((comment) => {
                const displayName =
                  comment.userDisplayName || comment.guestName || DEFAULT_AUTHOR;
                return (
                  <div
                    key={comment.id}
                    className="border rounded-lg p-3 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{displayName}</span>
                      <span className="text-xs uppercase tracking-wide">
                        {strings.pendingBadge}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                );
              })}
              {pendingRootItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 text-sm text-muted-foreground"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{item.authorName}</span>
                    <span className="text-xs uppercase tracking-wide">
                      {strings.pendingBadge}
                    </span>
                  </div>
                  <p className="mt-1">{item.content}</p>
                </div>
              ))}
              {isPendingLoading && (
                <div className="border rounded-lg p-3 text-sm text-muted-foreground text-center">
                  {messages.adminPosts.totalLabel}...
                </div>
              )}
            </div>
          </div>

          {pendingReplyItems.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{strings.pendingRepliesTitle}</h3>
              <div className="space-y-3">
                {pendingReplyItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{item.authorName}</span>
                      <span className="text-xs uppercase tracking-wide">
                        {strings.pendingBadge}
                      </span>
                    </div>
                    <p className="mt-1">{item.content}</p>
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
