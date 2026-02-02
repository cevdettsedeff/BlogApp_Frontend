'use client';

import { useParams } from 'next/navigation';
import { PostEditor } from '@/components/admin/posts/PostEditor';

export default function AdminPostEditPage() {
  const params = useParams<{ id: string }>();

  return <PostEditor mode="edit" postId={params.id} />;
}
