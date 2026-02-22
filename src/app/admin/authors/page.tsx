'use client';

import { AdminUsersListPage } from '@/components/admin/AdminUsersListPage';

export default function AdminAuthorsPage() {
  return (
    <AdminUsersListPage
      title="Yazarlar"
      subtitle="Sistemdeki tüm yazar hesaplarını buradan görüntüleyin."
      fixedRole="Author"
    />
  );
}
