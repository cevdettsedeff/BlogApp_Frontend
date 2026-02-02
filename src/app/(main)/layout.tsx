import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RouteLoading } from '@/components/layout/RouteLoading';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex-1">
        <div className="relative">
          <div className="route-fade">
            {children}
          </div>
          <RouteLoading variant="skeleton" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
