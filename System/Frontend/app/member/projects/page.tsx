'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'OVERDUE';

interface Booking {
  bookingId: string;
  projectDescription?: string;
  status: BookingStatus;
  progress: number;
  appointmentTime?: string;
  createdAt?: string;
}

interface ProjectSummary {
  id: string;
  title: string;
  status: BookingStatus;
  lastUpdated: string;
  progress: number;
  bookingCount: number;
  bookingId: string; // Add booking ID for navigation
}

export default function MemberProjectsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMyBookings();
        setBookings((data as any[]).map((b) => ({
          bookingId: b.bookingId,
          projectDescription: b.projectDescription,
          status: b.status,
          progress: b.progress ?? 0,
          appointmentTime: b.appointmentTime,
          createdAt: b.createdAt,
        })));
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const projects = useMemo<ProjectSummary[]>(() => {
    const map = new Map<string, ProjectSummary>();

    bookings.forEach((b) => {
      if (!b.projectDescription) return;
      const key = b.projectDescription.trim();
      const dateStr = b.appointmentTime || b.createdAt || '';
      const current = map.get(key);
      const numericDate = dateStr ? new Date(dateStr).getTime() : 0;

      if (!current) {
        map.set(key, {
          id: key,
          title: key,
          status: b.status,
          lastUpdated: dateStr,
          progress: b.progress ?? 0,
          bookingCount: 1,
          bookingId: b.bookingId, // Store the booking ID
        });
      } else {
        const existingDate = current.lastUpdated ? new Date(current.lastUpdated).getTime() : 0;
        const latestDate = numericDate && numericDate > existingDate ? dateStr : current.lastUpdated;
        const combinedProgress = Math.round((current.progress * current.bookingCount + (b.progress ?? 0)) / (current.bookingCount + 1));
        const statusPriority: Record<BookingStatus, number> = {
          OVERDUE: 0,
          PENDING: 1,
          APPROVED: 2,
          COMPLETED: 3,
          REJECTED: 4,
          CANCELLED: 5,
        };
        const newStatus = statusPriority[b.status] < statusPriority[current.status] ? b.status : current.status;

        map.set(key, {
          id: key,
          title: key,
          status: newStatus,
          lastUpdated: latestDate,
          progress: combinedProgress,
          bookingCount: current.bookingCount + 1,
          bookingId: current.bookingId, // Keep the original booking ID
        });
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      const da = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const db = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      return db - da;
    });
    return list;
  }, [bookings]);

  const statusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'In review';
      case 'APPROVED':
        return 'In progress';
      case 'COMPLETED':
        return 'Completed';
      case 'OVERDUE':
        return 'Overdue';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const statusClass = (status: BookingStatus) => {
    if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100';
    if (status === 'OVERDUE') return 'bg-destructive/10 text-destructive';
    if (status === 'CANCELLED' || status === 'REJECTED') return 'bg-destructive/10 text-destructive';
    if (status === 'APPROVED') return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-sm text-muted-foreground">Loading projects…</div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-sm text-muted-foreground">No projects yet. Add project descriptions to your bookings to start tracking them here.</div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card 
                key={p.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/member/projects/${p.bookingId}`)}
              >
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate" title={p.title}>{p.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${statusClass(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Bookings</span>
                    <span className="text-foreground">{p.bookingCount}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Last updated</span>
                    <span className="text-foreground">
                      {p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div
                        className="h-2 bg-primary rounded"
                        style={{ width: `${Math.min(100, Math.max(0, p.progress || 0))}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Progress: {p.progress || 0}%</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

