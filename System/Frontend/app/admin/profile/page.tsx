'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  notifyBookingUpdates?: boolean;
  notifyWorkshopReminders?: boolean;
  notifyApprovalUpdates?: boolean;
  notifyProjectUpdates?: boolean;
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [phone, setPhone] = useState('');
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyWorkshop, setNotifyWorkshop] = useState(true);
  const [notifyApproval, setNotifyApproval] = useState(true);
  const [notifyProject, setNotifyProject] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getCurrentUser();
        setProfile(data as ProfileData);
        setPhone((data as any).phoneNumber || '');
        setNotifyBooking((data as any).notifyBookingUpdates ?? true);
        setNotifyWorkshop((data as any).notifyWorkshopReminders ?? true);
        setNotifyApproval((data as any).notifyApprovalUpdates ?? true);
        setNotifyProject((data as any).notifyProjectUpdates ?? true);
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const updated = await apiClient.updateCurrentUser({
        phoneNumber: phone,
        notifyBookingUpdates: notifyBooking,
        notifyWorkshopReminders: notifyWorkshop,
        notifyApprovalUpdates: notifyApproval,
        notifyProjectUpdates: notifyProject,
      });
      setProfile(updated as ProfileData);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.fullName || user?.fullName;
  const displayEmail = profile?.email || user?.email;
  const displayRole = profile?.role || user?.role || 'Admin';

  return (
    <ProtectedRoute>
      <div className="space-y-4 max-w-2xl mx-auto">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between gap-4">
              <span>Name</span>
              <span className="text-foreground font-medium">{displayName || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Email</span>
              <span className="text-foreground font-medium">{displayEmail || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Role</span>
              <span className="text-foreground font-medium">{displayRole}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="space-y-1">
              <div>Phone number</div>
              <Input
                placeholder="Phone"
                className="max-w-xs"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notification preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Booking updates</span>
              <label className="flex items-center gap-2 text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={notifyBooking}
                  onChange={(e) => setNotifyBooking(e.target.checked)}
                  disabled={loading || saving}
                />
                <span>{notifyBooking ? 'On' : 'Off'}</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span>Workshop reminders</span>
              <label className="flex items-center gap-2 text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={notifyWorkshop}
                  onChange={(e) => setNotifyWorkshop(e.target.checked)}
                  disabled={loading || saving}
                />
                <span>{notifyWorkshop ? 'On' : 'Off'}</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span>Approvals & rejections</span>
              <label className="flex items-center gap-2 text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={notifyApproval}
                  onChange={(e) => setNotifyApproval(e.target.checked)}
                  disabled={loading || saving}
                />
                <span>{notifyApproval ? 'On' : 'Off'}</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span>Project updates</span>
              <label className="flex items-center gap-2 text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={notifyProject}
                  onChange={(e) => setNotifyProject(e.target.checked)}
                  disabled={loading || saving}
                />
                <span>{notifyProject ? 'On' : 'Off'}</span>
              </label>
            </div>
            <div className="pt-2 text-[11px] text-muted-foreground">
              Changes are saved for this account only.
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-xs rounded border border-border bg-primary text-primary-foreground disabled:opacity-60"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
