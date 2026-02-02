'use client';

import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Static data
const categories = [
  { id: '1', name: 'Teknoloji', slug: 'teknoloji', postCount: 24 },
  { id: '2', name: 'Gezi', slug: 'gezi', postCount: 18 },
  { id: '3', name: 'Kariyer', slug: 'kariyer', postCount: 12 },
  { id: '4', name: 'Kişisel Gelişim', slug: 'kisisel-gelisim', postCount: 8 },
  { id: '5', name: 'Yazılım', slug: 'yazilim', postCount: 15 },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground">Blog kategorilerini yönetin</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Kategori ara..." className="pl-10" />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Ad</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Yazı Sayısı</th>
              <th className="text-right px-4 py-3 text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  /{category.slug}
                </td>
                <td className="px-4 py-3 text-sm">{category.postCount} yazı</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
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
