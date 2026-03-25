'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserDialog } from '@/components/UserDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MemberActivityChart } from '@/components/charts/MemberActivityChart';
import { ActiveMembersList } from '@/components/charts/ActiveMembersList';

interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  staffType: string;
  assignedArea: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}

function UsersContent() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'Admin';
  const canDelete = user?.role === 'Admin';

  useEffect(() => {
    if (canEdit) {
      loadUsers();
      loadActivityData();
    }
  }, [canEdit]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityData = async () => {
    try {
      setActivityLoading(true);
      const [trends, active] = await Promise.all([
        apiClient.getActivityTrends(30),
        apiClient.getMostActiveMembers(10)
      ]);
      setActivityData(trends);
      setActiveMembers(active);
    } catch (err: any) {
      console.error('Failed to load activity data:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiClient.deleteUser(userId);
      loadUsers();
    } catch (err: any) {
      setError('Failed to delete user');
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await apiClient.suspendUser(userId);
      loadUsers();
    } catch (err: any) {
      setError('Failed to suspend user');
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      await apiClient.unsuspendUser(userId);
      loadUsers();
    } catch (err: any) {
      setError('Failed to unsuspend user');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    loadUsers();
    loadActivityData();
  };

  if (!canEdit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="container mx-auto flex-1 p-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Activity Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MemberActivityChart 
            data={activityData} 
            loading={activityLoading}
          />
          <ActiveMembersList 
            data={activeMembers} 
            loading={activityLoading}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users, roles, and permissions</CardDescription>
              </div>
              <Button onClick={handleAdd}>Add User</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Staff Type</TableHead>
                  <TableHead>Assigned Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : u.role === 'Staff'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell>{u.staffType || '-'}</TableCell>
                      <TableCell>{u.assignedArea || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(u)}
                          >
                            Edit
                          </Button>
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(u.userId)}
                            >
                              Delete
                            </Button>
                          )}
                          {u.role === 'Member' && (
                            u.status === 'SUSPENDED' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnsuspend(u.userId)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Unsuspend
                              </Button>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700"
                                  >
                                    Suspend
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Suspend Member</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to suspend {u.fullName}? This will restrict their access to the makerspace facilities and booking system.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSuspend(u.userId)}>
                                      Suspend Member
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <UserDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          user={editingUser}
        />
      </main>
    </div>
  );
}

