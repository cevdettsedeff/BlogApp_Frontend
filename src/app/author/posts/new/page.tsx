'use client';

import { PostEditor } from '@/components/admin/posts/PostEditor';
import { useUser } from '@/stores/authStore';

export default function AuthorPostCreatePage() {
  const user = useUser();

  return <PostEditor mode="create" currentAuthorDisplayName={user?.displayName} />;
}
