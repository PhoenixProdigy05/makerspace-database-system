'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';

export default function StaffDashboardPage() {
  const [activeBookings, setActiveBookings] = useState<number>(0);
  const [availableEquipment, setAvailableEquipment] = useState<number>(0);
  const [ongoingWorkshops, setOngoingWorkshops] = useState<number>(0);
  const [publishedArticles, setPublishedArticles] = useState<number>(0);
  const [recent, setRecent] = useState<Array<{ text: string; when: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [bookings, inventory, workshops, articles] = await Promise.all([
          apiClient.getBookings({ status: '' }),
          apiClient.getInventoryItems(),
          apiClient.getWorkshops(),
          apiClient.getArticles(),
        ]);
        // Consider active = not CANCELLED/COMPLETED
        const active = (bookings || []).filter((b: any) => !['CANCELLED', 'COMPLETED'].includes((b.status || '').toUpperCase())).length;
        setActiveBookings(active);
        const available = (inventory || []).filter((it: any) => it.isActive !== false && (it.quantity ?? 0) > 0).length;
        setAvailableEquipment(available);
        
        // Count ongoing workshops (not cancelled or completed)
        const ongoing = (workshops || []).filter((w: any) => !['CANCELLED', 'COMPLETED'].includes((w.status || '').toUpperCase())).length;
        setOngoingWorkshops(ongoing);
        
        // Count published articles
        const published = (articles || []).filter((a: any) => a.status === 'PUBLISHED').length;
        setPublishedArticles(published);
        
        const rec = (bookings || [])
          .slice(0, 5)
          .map((b: any) => ({
            text: `${(b.status || 'UPDATED').toString().toUpperCase()} • ${b.memberName || 'Member'} • ${b.equipment || b.tools || 'Equipment'}`,
            when: b.appointmentTime ? new Date(b.appointmentTime).toLocaleString() : '',
          }));
        setRecent(rec);
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Failed to load dashboard', description: e?.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Overview</div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Active Bookings</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{loading ? '—' : activeBookings}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Available Equipment</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{loading ? '—' : availableEquipment}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ongoing Workshops</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{loading ? '—' : ongoingWorkshops}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Published Articles</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{loading ? '—' : publishedArticles}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent activity.</div>
          ) : (
            <ul className="text-sm space-y-1">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{r.text}</span>
                  <span className="text-muted-foreground">{r.when}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button>Add New Equipment</Button>
        <Button variant="outline">Approve Booking</Button>
        <Button variant="outline">Create Workshop</Button>
        <Button variant="outline">Publish Article</Button>
      </div>
    </div>
  );
}
