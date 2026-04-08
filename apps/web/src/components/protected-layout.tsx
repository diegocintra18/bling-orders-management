'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.some((path) =>
        window.location.pathname.startsWith(path),
      );

      if (!user && !isPublicPath) {
        router.push('/login');
      } else if (user && isPublicPath) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some((path) =>
    typeof window !== 'undefined' && window.location.pathname.startsWith(path),
  );

  if (!user && !isPublicPath) {
    return null;
  }

  if (user && isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
