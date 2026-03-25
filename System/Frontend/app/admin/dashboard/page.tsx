'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  totalMembers: number;
  totalEquipment: number;
  totalBookings: number;
  activeProjects: number;
  totalUsers: number;
  lowStockItems: number;
  totalInventory: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalEquipment: 0,
    totalBookings: 0,
    activeProjects: 0,
    totalUsers: 0,
    lowStockItems: 0,
    totalInventory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data from multiple endpoints
        const [users, inventory, bookings, lowStock] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getInventoryItems(),
          apiClient.getBookings(),
          apiClient.getLowStockItems(),
        ]);

        // Calculate stats
        const totalMembers = users.filter((user: any) => user.role === 'Member').length;
        const totalEquipment = inventory.length;
        const totalBookings = bookings.length;
        const activeProjects = bookings.filter((booking: any) => 
          booking.status === 'APPROVED' || booking.status === 'IN_PROGRESS'
        ).length;

        setStats({
          totalMembers,
          totalEquipment,
          totalBookings,
          activeProjects,
          totalUsers: users.length,
          lowStockItems: lowStock.length,
          totalInventory: inventory.length,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Dashboard &gt; Overview</div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalInventory}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.lowStockItems > 0 ? 'text-destructive' : ''}`}>
              {loading ? '...' : stats.lowStockItems}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/admin/inventory" className="block">
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Manage inventory items, track quantities, and receive low stock alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Inventory</Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/admin/members" className="block">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Users</Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/admin/insights" className="block">
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>
                View system statistics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Reports</Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly bookings trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Bookings Analytics</div>
                <div className="text-sm mt-2">Last 6 months: {stats.totalBookings} total bookings</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/insights">View Detailed Reports</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipment usage by category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Equipment Analytics</div>
                <div className="text-sm mt-2">{stats.totalEquipment} total items</div>
                <div className="text-sm mt-1">{stats.lowStockItems} low stock alerts</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/inventory">Manage Equipment</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active vs inactive members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium">Member Analytics</div>
                <div className="text-sm mt-2">{stats.totalMembers} total members</div>
                <div className="text-sm mt-1">{stats.totalUsers - stats.totalMembers} staff/admin users</div>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/members">View Members</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Recent system events</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded">
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                  <div className="text-sm text-muted-foreground">Low Stock Alerts</div>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/insights">View All Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/admin/inventory">Add Equipment</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/bookings">Approve Booking</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/members">Register Member</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/insights">View Reports</Link>
        </Button>
      </div>
    </div>
  );
}
