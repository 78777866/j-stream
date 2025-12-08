'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Loading from '@/components/ui/loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isClient && !loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname, isClient]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  // If not authenticated and not on login page, don't render children
  if (!user && pathname !== '/login') {
    return null;
  }

  // If authenticated or on login page, render children
  return <>{children}</>;
} 