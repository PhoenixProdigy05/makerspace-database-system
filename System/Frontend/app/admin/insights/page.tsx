'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface SummaryMetrics {
  totalMembers: number;
  activeProjects: number;
  upcomingWorkshops: number;
  equipmentItems: number;
}

interface BookingTrend {
  label: string;
  value: number;
}

export default function AdminInsightsPage() {
  const [metrics, setMetrics] = useState<SummaryMetrics>({
    totalMembers: 0,
    activeProjects: 0,
    upcomingWorkshops: 0,
    equipmentItems: 0,
  });
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsightsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data
        const [users, bookings, workshops, inventory] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getBookings(),
          apiClient.getWorkshops(),
          apiClient.getInventoryItems(),
        ]);

        // Calculate metrics
        const totalMembers = users.filter((user: any) => user.role === 'Member').length;
        const activeProjects = bookings.filter((booking: any) => 
          booking.status === 'APPROVED' || booking.status === 'IN_PROGRESS'
        ).length;
        const upcomingWorkshops = workshops.filter((workshop: any) => 
          workshop.status === 'SCHEDULED' && new Date(workshop.date) > new Date()
        ).length;
        const equipmentItems = inventory.length;

        setMetrics({
          totalMembers,
          activeProjects,
          upcomingWorkshops,
          equipmentItems,
        });

        // Generate booking trends for the last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const trends = days.map((day, index) => {
          // Calculate bookings for this day of the week
          const dayBookings = bookings.filter((booking: any) => {
            if (!booking.appointmentTime) return false;
            const bookingDate = new Date(booking.appointmentTime);
            return bookingDate.getDay() === (index + 1) % 7; // Adjust for Sunday = 0
          });
          
          return {
            label: day,
            value: dayBookings.length,
          };
        });
        
        setBookingTrends(trends);
      } catch (error) {
        console.error('Failed to load insights data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsightsData();
  }, []);

  const handleExportExcel = () => {
    const header = ['Metric', 'Value'];
    const rows = [
      ['Total Members', String(metrics.totalMembers)],
      ['Active Projects', String(metrics.activeProjects)],
      ['Upcoming Workshops', String(metrics.upcomingWorkshops)],
      ['Equipment Items', String(metrics.equipmentItems)],
      ...bookingTrends.map((b) => [`Bookings (${b.label})`, String(b.value)]),
    ];
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'makerspace-insights.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const summaryMetrics = [
    { label: 'Total Members', value: metrics.totalMembers },
    { label: 'Active Projects', value: metrics.activeProjects },
    { label: 'Upcoming Workshops', value: metrics.upcomingWorkshops },
    { label: 'Equipment Items', value: metrics.equipmentItems },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Analytics &amp; Reporting</div>
          <h1 className="text-2xl font-semibold">Insights and Reports</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintPdf}>
            Download PDF
          </Button>
          <Button onClick={handleExportExcel}>Download Excel</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equipment usage (trend)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Equipment Usage Analytics</div>
                <div className="text-sm mt-2">{metrics.equipmentItems} total items in inventory</div>
                <div className="text-sm mt-1">Real-time usage tracking coming soon</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/inventory">View Detailed Analytics</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Weekly Booking Distribution</div>
                <div className="text-sm mt-2">
                  {bookingTrends.reduce((sum, trend) => sum + trend.value, 0)} total bookings this week
                </div>
                <div className="text-sm mt-1">
                  Peak day: {bookingTrends.length > 0 ? 
                    bookingTrends.reduce((max, trend) => trend.value > max.value ? trend : max).label : 
                    'N/A'
                  }
                </div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/bookings">View Booking Details</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Staff performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Staff Analytics</div>
                <div className="text-sm mt-2">Performance metrics tracking</div>
                <div className="text-sm mt-1">Coming in next update</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/staff">View Staff Reports</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Member participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Member Engagement</div>
                <div className="text-sm mt-2">{metrics.totalMembers} active members</div>
                <div className="text-sm mt-1">{metrics.activeProjects} ongoing projects</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/members">View Member Activity</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Project Overview</div>
                <div className="text-sm mt-2">{metrics.activeProjects} active projects</div>
                <div className="text-sm mt-1">{metrics.upcomingWorkshops} workshops scheduled</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/insights">View Project Details</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
