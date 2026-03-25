'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MemberPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && (user.role || '').toLowerCase() === 'admin') {
      router.push('/admin/dashboard');
    }
    if (!loading && user && (user.role || '').toLowerCase() === 'staff') {
      router.push('/staff');
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Member Portal</h1>
        <div className="text-muted-foreground">Welcome. Your dashboard will appear here.</div>
      </div>
    </ProtectedRoute>
  );
}
