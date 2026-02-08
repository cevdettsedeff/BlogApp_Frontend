'use client';

import { FileText, Users, MessageSquare, FolderOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials, formatDate } from '@/lib/utils';
import { AdminLiveViewPanel } from '@/components/admin/AdminLiveViewPanel';

// Static data
const stats = [
  { label: 'Toplam Yazılar', value: 128, icon: FileText, color: 'bg-blue-500' },
  { label: 'Toplam Kullanıcı', value: 523, icon: Users, color: 'bg-green-500' },
  { label: 'Toplam Yorumlar', value: 312, icon: MessageSquare, color: 'bg-orange-500' },
  { label: 'Toplam Kategoriler', value: 9, icon: FolderOpen, color: 'bg-purple-500' },
];

const recentActivities = [
  {
    id: 1,
    user: 'Selin Soylu',
    action: 'Yeni yazı paylaştı',
    title: 'Yeni Nesil Yapay Zeka Uygulamaları',
    type: 'post',
    date: '2024-03-28T10:00:00Z',
    stats: '50 görüntülenme',
  },
  {
    id: 2,
    user: 'okur.admin@example.com',
    action: 'Yorum yaptı',
    title: 'Verimli bir Çalışma Ortamı Yaratmanın Yolları',
    type: 'comment',
    date: '2024-03-27T14:30:00Z',
    stats: 'yanıtlar arasında olumlu görüş aldı',
  },
  {
    id: 3,
    user: 'Tuna.admin@example.com',
    action: 'Yeni yazı paylaştı',
    title: 'Yeni Mezunlar İçin İlk İş Rehberi',
    type: 'post',
    date: '2024-03-26T09:00:00Z',
    stats: 'yeni içerik eklendi',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Hoş geldin Berna!</h1>
        <p className="text-muted-foreground">
          Admin paneline hoş geldiniz. Buradan blog sitenizi yönetebilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Notifications */}
      <AdminLiveViewPanel />

      {/* Visitor Stats Chart */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Son 7 Gün Ziyaretçi İstatistikleri</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[150, 220, 180, 280, 200, 250, 190].map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary/20 rounded-t relative"
                style={{ height: `${(value / 300) * 100}%` }}
              >
                <div
                  className="absolute bottom-0 w-full bg-primary rounded-t transition-all"
                  style={{ height: '60%' }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Son Etkinlikler</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(activity.user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{activity.user}</span>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type === 'post' ? 'yazı' : 'yorum'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.date)}
                  </span>
                </div>
                <p className="text-primary font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.stats}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
