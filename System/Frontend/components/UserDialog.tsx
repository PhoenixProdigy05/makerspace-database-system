'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  staffType: string;
  assignedArea: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'Member',
    staffType: '',
    assignedArea: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'Member',
        staffType: user.staffType || '',
        assignedArea: user.assignedArea || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'Member',
        staffType: '',
        assignedArea: '',
      });
    }
    setError('');
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Form data before submission:', JSON.stringify(formData, null, 2));

    try {
      console.log('Form state before payload creation:');
      console.log('  staffType:', formData.staffType);
      console.log('  assignedArea:', formData.assignedArea);
      console.log('  role:', formData.role);
      
      // Create isolated payload to avoid any state issues
      const staffTypeValue = formData.staffType;
      const assignedAreaValue = formData.assignedArea;
      
      console.log('Isolated values:');
      console.log('  staffTypeValue:', staffTypeValue);
      console.log('  assignedAreaValue:', assignedAreaValue);
      
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        role: formData.role,
        staffType: staffTypeValue || undefined,
        assignedArea: assignedAreaValue || undefined,
      };

      console.log('Final payload being sent:', JSON.stringify(payload, null, 2));

      if (!user) {
        // Create user - password required
        if (!formData.password) {
          setError('Password is required for new users');
          setLoading(false);
          return;
        }
        payload.password = formData.password;
        await apiClient.createUser(payload);
      } else {
        // Update user - password optional
        if (formData.password) {
          payload.password = formData.password;
        }
        await apiClient.updateUser(user.userId, payload);
      }

      onOpenChange(false);
    } catch (err: any) {
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to save user';
      
      if (err.message) {
        if (err.message.includes('column "status" of relation "users" does not exist')) {
          errorMessage = 'Database schema error: The users table is missing the status column. Please contact your system administrator to run the latest database migrations.';
        } else if (err.message.includes('Email already exists')) {
          errorMessage = 'A user with this email address already exists.';
        } else if (err.message.includes('Only Admin can create')) {
          errorMessage = 'You do not have permission to create users with this role.';
        } else if (err.message.includes('violates foreign key constraint')) {
          errorMessage = 'Invalid reference: The specified creator does not exist.';
        } else if (err.message.includes('duplicate key')) {
          errorMessage = 'A user with this information already exists.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update the user details' : 'Create a new user'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {user ? '(leave blank to keep current)' : '*'}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              required
              disabled={loading || (!!currentUser && currentUser.role !== 'Admin')}
            >
              <option value="Member">Member</option>
              <option value="Staff">Staff</option>
              {currentUser && currentUser.role === 'Admin' && (
                <>
                  <option value="Admin">Admin</option>
                </>
              )}
            </select>
          </div>

          {formData.role === 'Staff' && currentUser && currentUser.role === 'Admin' && (
            <div className="space-y-2">
              <Label htmlFor="staffType">Staff Type</Label>
              <select
                id="staffType"
                value={formData.staffType}
                onChange={(e) => {
                  console.log('Staff Type changed to:', e.target.value);
                  setFormData({ ...formData, staffType: e.target.value });
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                disabled={loading}
              >
                <option value="">Select...</option>
                <option value="Technician">Technician</option>
                <option value="Manager">Manager</option>
                <option value="Intern">Intern</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="assignedArea">Assigned Area</Label>
            <select
              id="assignedArea"
              value={formData.assignedArea}
              onChange={(e) => {
                console.log('Assigned Area changed to:', e.target.value);
                setFormData({ ...formData, assignedArea: e.target.value });
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="All Areas">All Areas</option>
              <option value="Laser Lab">Laser Lab</option>
              <option value="Electronics Lab">Electronics Lab</option>
              <option value="3D Printing Zone">3D Printing Zone</option>
              <option value="Woodshop">Woodshop</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

