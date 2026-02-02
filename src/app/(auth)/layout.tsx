import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RouteLoading } from '@/components/layout/RouteLoading';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="relative flex-1 flex items-center justify-center bg-muted/50">
        <div className="w-full max-w-lg p-4">
          <div className="route-fade">
            {children}
          </div>
        </div>
        <RouteLoading variant="skeleton" />
      </main>
      <Footer />
    </div>
  );
}
