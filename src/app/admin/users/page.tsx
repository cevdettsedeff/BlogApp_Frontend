'use client';

import { Search, MoreHorizontal, Shield, User, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';

// Static data
const users = [
  {
    id: '1',
    displayName: 'Berna Selin Sedef',
    email: 'bernaselin@example.com',
    role: 'Admin',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    displayName: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    role: 'User',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    displayName: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    role: 'Author',
    createdAt: '2024-03-10T09:00:00Z',
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-muted-foreground">Tüm kullanıcıları yönetin</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Kullanıcı ara..." className="pl-10" />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Kullanıcı</th>
              <th className="text-left px-4 py-3 text-sm font-medium">E-posta</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Rol</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Kayıt Tarihi</th>
              <th className="text-right px-4 py-3 text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={user.role === 'Admin' ? 'default' : 'secondary'}
                    className={user.role === 'Admin' ? 'bg-purple-500' : ''}
                  >
                    {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                    {user.role === 'Author' && <User className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
