'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Booking {
  bookingId: string;
  appointmentTime?: string;
  createdAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'OVERDUE';
  projectDescription?: string;
}

interface Workshop {
  workshopId?: string;
  id?: string;
  title: string;
  instructor?: string;
  date?: string;
  status?: string;
}

interface NotificationItem {
  id: string;
  type: 'booking' | 'workshop' | 'system';
  message: string;
}

export default function MemberDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [myBookings, allWorkshops] = await Promise.all([
          apiClient.getMyBookings(),
          apiClient.getWorkshops(),
        ]);
        setBookings(myBookings as Booking[]);
        setWorkshops(allWorkshops as Workshop[]);

        const notif: NotificationItem[] = [];
        (myBookings as Booking[]).forEach((b) => {
          if (b.status === 'APPROVED') {
            notif.push({
              id: `booking-${b.bookingId}-approved`,
              type: 'booking',
              message: `A booking was approved.`,
            });
          } else if (b.status === 'REJECTED') {
            notif.push({
              id: `booking-${b.bookingId}-rejected`,
              type: 'booking',
              message: `A booking was rejected.`,
            });
          } else if (b.status === 'PENDING') {
            notif.push({
              id: `booking-${b.bookingId}-pending`,
              type: 'booking',
              message: `A booking is pending approval.`,
            });
          }
        });

        setNotifications(notif);
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = new Date();

  const stats = useMemo(() => {
    const thisMonthBookings = bookings.filter((b) => {
      const dateStr = b.appointmentTime || b.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const activeProjects = bookings.filter((b) => b.projectDescription && b.status !== 'COMPLETED').length;
    const pendingApprovals = bookings.filter((b) => b.status === 'PENDING').length;

    const upcomingWorkshops = (workshops || []).filter((w) => {
      if (!w.date) return false;
      const d = new Date(w.date);
      return d >= now;
    }).length;

    return {
      thisMonthBookings,
      upcomingWorkshops,
      activeProjects,
      pendingApprovals,
    };
  }, [bookings, workshops, now]);

  const upcomingWorkshopsList = useMemo(() => {
    return (workshops || [])
      .filter((w) => w.date && new Date(w.date) >= now)
      .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
      .slice(0, 5);
  }, [workshops, now]);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Bookings this month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.thisMonthBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming workshops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.upcomingWorkshops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.activeProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.pendingApprovals}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming workshops / events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <div className="text-muted-foreground text-sm">Loading...</div>}
              {!loading && upcomingWorkshopsList.length === 0 && (
                <div className="text-muted-foreground text-sm">No upcoming workshops.</div>
              )}
              {!loading && upcomingWorkshopsList.map((w) => (
                <div
                  key={w.workshopId || w.id || w.title}
                  className="rounded-md border p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{w.title}</span>
                    {w.date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(w.date).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{w.instructor}</span>
                    {w.status && (
                      <span className="px-2 py-0.5 rounded border border-border text-[10px] uppercase tracking-wide">
                        {w.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <div className="text-muted-foreground text-sm">Loading...</div>}
              {!loading && notifications.length === 0 && (
                <div className="text-muted-foreground text-sm">No new notifications.</div>
              )}
              {!loading && notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-2 rounded-md border p-3"
                >
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <button
                    onClick={() => handleDismissNotification(n.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

