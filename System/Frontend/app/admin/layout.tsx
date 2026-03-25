'use client';

import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if ((user.role || '').toLowerCase() !== 'admin') {
        const role = (user.role || '').toLowerCase();
        if (role === 'staff') router.push('/staff');
        else router.push('/member');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role || '').toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="bg-card shadow-lg h-full w-64">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}
      <main className="px-6 pt-4 pb-6 space-y-6 relative">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ≡
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}
