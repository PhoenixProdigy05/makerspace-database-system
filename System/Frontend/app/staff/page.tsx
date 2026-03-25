'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = (user.role || '').toLowerCase();
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'member') {
        router.push('/member');
      } else if (role === 'staff') {
        router.push('/staff/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Redirecting…</h1>
        <div className="text-muted-foreground">Please wait while we route you to your dashboard.</div>
      </div>
    </ProtectedRoute>
  );
}
