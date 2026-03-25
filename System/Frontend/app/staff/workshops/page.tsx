'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';

export default function StaffWorkshopsPage() {
  const useMock = false; // Changed to false to use backend API
  const mockWorkshops = useMemo(() => ([
    { workshopId: 'w-1001', title: 'Intro to CNC', instructor: 'Jamie', date: new Date().toISOString(), capacity: 10, status: 'SCHEDULED' },
    { workshopId: 'w-1002', title: 'Advanced 3D Printing', instructor: 'Taylor', date: new Date(Date.now()+86400000).toISOString(), capacity: 8, status: 'CANCELLED' },
  ]), []);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', instructor: '', date: '', capacity: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'cancel' | 'uncancel' | 'delete'; workshopId: string; title: string } | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [addParticipantDialog, setAddParticipantDialog] = useState(false);
  const [participantForm, setParticipantForm] = useState({ email: '', name: '' });
  const [addingParticipant, setAddingParticipant] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (useMock) {
        setWorkshops(mockWorkshops);
        return;
      }
      try {
        const data = await apiClient.getWorkshops();
        setWorkshops(data);
      } catch {
        setWorkshops(mockWorkshops);
      }
    };
    load();
  }, [mockWorkshops]);

  // Load registrations when workshop is selected
  useEffect(() => {
    const loadRegistrations = async () => {
      if (!selectedId) {
        setRegistrations([]);
        return;
      }

      setLoadingRegistrations(true);
      try {
        // Try to get registrations from the database API
        try {
          const data = await apiClient.getWorkshopRegistrations(selectedId);
          
          // Enhance registration data with user information
          const enhancedRegistrations = await Promise.all(
            data.map(async (reg: any) => {
              try {
                // Get user details for each registration
                const user = await apiClient.getUser(reg.userId || reg.memberId);
                return {
                  ...reg,
                  userName: user.fullName || 'Unknown',
                  userEmail: user.email || 'No email',
                  registeredAt: reg.registeredAt || new Date().toISOString(),
                  status: reg.status || 'REGISTERED'
                };
              } catch (userError) {
                // If user lookup fails, use basic registration data
                return {
                  ...reg,
                  userName: reg.userName || 'Unknown',
                  userEmail: reg.userEmail || 'No email',
                  registeredAt: reg.registeredAt || new Date().toISOString(),
                  status: reg.status || 'REGISTERED'
                };
              }
            })
          );
          
          setRegistrations(enhancedRegistrations);
        } catch (apiError) {
          console.log('API call failed, checking for fallback options');
          
          if (useMock) {
            // Fallback to mock data if API fails and in mock mode
            const mockRegistrations = [
              { registrationId: 'r-1001', workshopId: selectedId, userId: 'u-1001', userName: 'John Doe', userEmail: 'john@example.com', registeredAt: new Date().toISOString(), status: 'REGISTERED' },
              { registrationId: 'r-1002', workshopId: selectedId, userId: 'u-1002', userName: 'Jane Smith', userEmail: 'jane@example.com', registeredAt: new Date().toISOString(), status: 'REGISTERED' },
            ];
            setRegistrations(mockRegistrations);
          } else {
            // Check localStorage as last resort (for development)
            const storedRegistrations = JSON.parse(localStorage.getItem('workshop-registrations') || '[]');
            const workshopRegistrations = storedRegistrations.filter((reg: any) => reg.workshopId === selectedId);
            
            if (workshopRegistrations.length > 0) {
              setRegistrations(workshopRegistrations);
            } else {
              setRegistrations([]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load registrations:', error);
        setRegistrations([]);
      } finally {
        setLoadingRegistrations(false);
      }
    };

    loadRegistrations();
  }, [selectedId, useMock]);

  const onCreate = () => {
    setEditing(null);
    setForm({ title: '', instructor: '', date: '', capacity: '' });
    setOpen(true);
  };
  const onEdit = (w: any) => {
    setEditing(w);
    setForm({ title: w.title || '', instructor: w.instructor || '', date: w.date ? new Date(w.date).toISOString().slice(0,16) : '', capacity: String(w.capacity || '') });
    setOpen(true);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Title and Date are required.' });
      return;
    }
    if (Number.isNaN(parseInt(form.capacity || '0'))) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Capacity must be a number.' });
      return;
    }
    setSaving(true);
    try {
      if (useMock) {
        if (editing) {
          setWorkshops((prev) => prev.map((w) => w.workshopId === editing.workshopId ? {
            ...w,
            title: form.title,
            instructor: form.instructor,
            date: new Date(form.date).toISOString(),
            capacity: parseInt(form.capacity || '0'),
          } : w));
          toast({ variant: 'success', title: 'Workshop updated (mock)' });
        } else {
          const newItem = {
            workshopId: `w-${Math.random().toString(36).slice(2,8)}`,
            title: form.title,
            instructor: form.instructor,
            date: new Date(form.date).toISOString(),
            capacity: parseInt(form.capacity || '0'),
            status: 'SCHEDULED',
          };
          setWorkshops((prev) => [newItem, ...prev]);
          toast({ variant: 'success', title: 'Workshop created (mock)' });
        }
      } else {
        if (editing) {
          await apiClient.updateWorkshop(editing.workshopId, { title: form.title, instructor: form.instructor, date: new Date(form.date).toISOString(), capacity: parseInt(form.capacity || '0') });
        } else {
          await apiClient.createWorkshop({ title: form.title, instructor: form.instructor, date: new Date(form.date).toISOString(), capacity: parseInt(form.capacity || '0') });
        }
        const data = await apiClient.getWorkshops();
        setWorkshops(data);
        toast({ variant: 'success', title: editing ? 'Workshop updated' : 'Workshop created' });
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };
  const cancel = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select a workshop to cancel' });
      return;
    }
    
    const selectedWorkshop = workshops.find(w => w.workshopId === selectedId);
    if (!selectedWorkshop) return;

    if (selectedWorkshop.status === 'CANCELLED') {
      // Uncancel the workshop
      setConfirmDialog({
        type: 'uncancel',
        workshopId: selectedId,
        title: selectedWorkshop.title
      });
    } else {
      // Cancel the workshop
      setConfirmDialog({
        type: 'cancel',
        workshopId: selectedId,
        title: selectedWorkshop.title
      });
    }
  };

  const confirmAction = async () => {
    if (!confirmDialog) return;

    try {
      if (useMock) {
        if (confirmDialog.type === 'cancel') {
          setWorkshops((prev) => prev.map((w) => w.workshopId === confirmDialog.workshopId ? { ...w, status: 'CANCELLED' } : w));
          toast({ variant: 'success', title: 'Workshop cancelled (mock)' });
        } else if (confirmDialog.type === 'uncancel') {
          setWorkshops((prev) => prev.map((w) => w.workshopId === confirmDialog.workshopId ? { ...w, status: 'SCHEDULED' } : w));
          toast({ variant: 'success', title: 'Workshop uncancelled (mock)' });
        } else if (confirmDialog.type === 'delete') {
          setWorkshops((prev) => prev.filter((w) => w.workshopId !== confirmDialog.workshopId));
          setSelectedId(null);
          toast({ variant: 'success', title: 'Workshop deleted (mock)' });
        }
      } else {
        if (confirmDialog.type === 'cancel') {
          await apiClient.cancelWorkshop(confirmDialog.workshopId);
          toast({ variant: 'success', title: 'Workshop cancelled' });
        } else if (confirmDialog.type === 'uncancel') {
          await apiClient.updateWorkshop(confirmDialog.workshopId, { status: 'SCHEDULED' });
          toast({ variant: 'success', title: 'Workshop uncancelled' });
        } else if (confirmDialog.type === 'delete') {
          await apiClient.deleteWorkshop(confirmDialog.workshopId);
          setSelectedId(null);
          toast({ variant: 'success', title: 'Workshop deleted' });
        }
        const data = await apiClient.getWorkshops();
        setWorkshops(data);
      }
    } catch (error: any) {
      console.error('Failed to perform action:', error);
      toast({ 
        variant: 'destructive', 
        title: `Failed to ${confirmDialog.type} workshop`, 
        description: error?.message || 'An error occurred while performing the action.' 
      });
    } finally {
      setConfirmDialog(null);
    }
  };
  const complete = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select a workshop to complete' });
      return;
    }
    if (useMock) {
      setWorkshops((prev) => prev.map((w) => w.workshopId === selectedId ? { ...w, status: 'COMPLETED' } : w));
      toast({ variant: 'success', title: 'Completed (mock)' });
    } else {
      await apiClient.completeWorkshop(selectedId);
      const data = await apiClient.getWorkshops();
      setWorkshops(data);
      toast({ variant: 'success', title: 'Completed' });
    }
  };

  const deleteWorkshop = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select a workshop to delete' });
      return;
    }
    
    const selectedWorkshop = workshops.find(w => w.workshopId === selectedId);
    if (!selectedWorkshop) return;

    setConfirmDialog({
      type: 'delete',
      workshopId: selectedId,
      title: selectedWorkshop.title
    });
  };

  // Registration management functions
  const addParticipant = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select a workshop first' });
      return;
    }
    if (!participantForm.email.trim()) {
      toast({ variant: 'destructive', title: 'Email is required' });
      return;
    }

    setAddingParticipant(true);
    try {
      let userId: string;
      
      try {
        // First, try to find existing user by email
        const users = await apiClient.getUsers();
        const existingUser = users.find((user: any) => user.email === participantForm.email);
        
        if (existingUser) {
          userId = existingUser.id || existingUser.userId;
          toast({ 
            variant: 'success', 
            title: 'Existing user found', 
            description: `Found existing account for ${participantForm.email}` 
          });
        } else {
          // Create new user if not found
          const tempPassword = Math.random().toString(36).slice(-8);
          const userResponse = await apiClient.createUser({
            fullName: participantForm.name || 'Unknown',
            email: participantForm.email,
            password: tempPassword,
            role: 'MEMBER'
          }) as any;
          
          userId = userResponse.id || userResponse.userId;
          toast({ 
            variant: 'success', 
            title: 'Account created!', 
            description: `New account created for ${participantForm.email}` 
          });
        }
      } catch (userError: any) {
        console.error('User creation/lookup failed:', userError);
        throw new Error('Failed to create or find user account');
      }

      // Now register for the workshop using the userId
      await apiClient.addWorkshopRegistration(selectedId, userId);

      // Refresh the registrations list
      const data = await apiClient.getWorkshopRegistrations(selectedId);
      const enhancedRegistrations = await Promise.all(
        data.map(async (reg: any) => {
          try {
            const user = await apiClient.getUser(reg.userId || reg.memberId);
            return {
              ...reg,
              userName: user.fullName || 'Unknown',
              userEmail: user.email || 'No email',
              registeredAt: reg.registeredAt || new Date().toISOString(),
              status: reg.status || 'REGISTERED'
            };
          } catch (userError) {
            return {
              ...reg,
              userName: reg.userName || 'Unknown',
              userEmail: reg.userEmail || 'No email',
              registeredAt: reg.registeredAt || new Date().toISOString(),
              status: reg.status || 'REGISTERED'
            };
          }
        })
      );
      setRegistrations(enhancedRegistrations);

      toast({ variant: 'success', title: 'Participant added successfully' });
      setParticipantForm({ email: '', name: '' });
      setAddParticipantDialog(false);
    } catch (error: any) {
      console.error('Failed to add participant:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to add participant', 
        description: error?.message || 'An error occurred while registering the participant.' 
      });
    } finally {
      setAddingParticipant(false);
    }
  };

  const removeParticipant = async (registrationId: string, participantName: string) => {
    try {
      // Find the registration to get the userId
      const registration = registrations.find(r => r.registrationId === registrationId);
      if (!registration) {
        throw new Error('Registration not found');
      }

      const userId = registration.userId || registration.memberId;
      
      // Remove from database
      await apiClient.removeWorkshopRegistration(selectedId!, userId);

      // Refresh the registrations list
      const data = await apiClient.getWorkshopRegistrations(selectedId!);
      const enhancedRegistrations = await Promise.all(
        data.map(async (reg: any) => {
          try {
            const user = await apiClient.getUser(reg.userId || reg.memberId);
            return {
              ...reg,
              userName: user.fullName || 'Unknown',
              userEmail: user.email || 'No email',
              registeredAt: reg.registeredAt || new Date().toISOString(),
              status: reg.status || 'REGISTERED'
            };
          } catch (userError) {
            return {
              ...reg,
              userName: reg.userName || 'Unknown',
              userEmail: reg.userEmail || 'No email',
              registeredAt: reg.registeredAt || new Date().toISOString(),
              status: reg.status || 'REGISTERED'
            };
          }
        })
      );
      setRegistrations(enhancedRegistrations);

      toast({ variant: 'success', title: 'Participant removed successfully' });
    } catch (error: any) {
      console.error('Failed to remove participant:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to remove participant', 
        description: error?.message || 'An error occurred while removing the participant.' 
      });
    }
  };

  const exportCsv = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select a workshop to export' });
      return;
    }
    if (useMock) {
      // Create mock CSV content
      const selectedWorkshop = workshops.find(w => w.workshopId === selectedId);
      const csvContent = [
        'Workshop,Participant Name,Email,Registration Date,Status',
        ...registrations.map(r => 
          `"${selectedWorkshop?.title}","${r.userName}","${r.userEmail}","${new Date(r.registeredAt).toLocaleDateString()}","${r.status}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedWorkshop?.title || 'workshop'}-participants.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ variant: 'success', title: 'CSV exported (mock)' });
    } else {
      const url = apiClient.getWorkshopRegistrationsCsvUrl(selectedId);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Sessions & Events</div>
      <h1 className="text-2xl font-semibold">Workshops Management</h1>

      <div className="flex gap-2">
        <Button onClick={onCreate}>Create Workshop</Button>
        <Button variant="outline" onClick={cancel}>
          {selectedId && workshops.find(w => w.workshopId === selectedId)?.status === 'CANCELLED' ? 'Uncancel' : 'Cancel'}
        </Button>
        <Button variant="outline" onClick={complete}>Mark as Completed</Button>
        <Button variant="destructive" onClick={deleteWorkshop}>Delete</Button>
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Workshops</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workshops.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-muted-foreground">No workshops yet.</TableCell></TableRow>
                ) : (
                  workshops.map((w) => (
                    <TableRow key={w.workshopId} onClick={() => setSelectedId(w.workshopId)} className={selectedId === w.workshopId ? 'bg-muted/50' : ''}>
                      <TableCell>{w.workshopId}</TableCell>
                      <TableCell>{w.title}</TableCell>
                      <TableCell>{w.instructor}</TableCell>
                      <TableCell>{w.date ? new Date(w.date).toLocaleString() : '—'}</TableCell>
                      <TableCell>{w.capacity ?? '—'}</TableCell>
                      <TableCell>{w.status || '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(w)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Registration Management</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setAddParticipantDialog(true)} disabled={!selectedId}>
                Add Participant
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv} disabled={!selectedId || registrations.length === 0}>
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedId ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Select a workshop to view and manage registrations
            </div>
          ) : loadingRegistrations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No participants registered yet</p>
              <Button size="sm" onClick={() => setAddParticipantDialog(true)} className="mt-2">
                Add First Participant
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {registrations.length} participant{registrations.length !== 1 ? 's' : ''} registered
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.registrationId}>
                        <TableCell className="font-medium">{registration.userName}</TableCell>
                        <TableCell>{registration.userEmail}</TableCell>
                        <TableCell>
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            registration.status === 'REGISTERED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {registration.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeParticipant(registration.registrationId, registration.userName)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Workshop' : 'Create Workshop'}</DialogTitle>
            <DialogDescription>Provide details for the workshop</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} disabled={saving} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.type === 'cancel' && 'Cancel Workshop'}
              {confirmDialog?.type === 'uncancel' && 'Uncancel Workshop'}
              {confirmDialog?.type === 'delete' && 'Delete Workshop'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.type === 'cancel' && `Are you sure you want to cancel "${confirmDialog?.title}"? This will remove the workshop from the schedule and notify any registered participants.`}
              {confirmDialog?.type === 'uncancel' && `Are you sure you want to uncancel "${confirmDialog?.title}"? This will restore the workshop to the schedule.`}
              {confirmDialog?.type === 'delete' && `Are you sure you want to delete "${confirmDialog?.title}"? This action cannot be undone and will permanently remove the workshop and all its data.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              No, Keep It
            </Button>
            <Button 
              variant={confirmDialog?.type === 'delete' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              {confirmDialog?.type === 'cancel' && 'Yes, Cancel Workshop'}
              {confirmDialog?.type === 'uncancel' && 'Yes, Uncancel Workshop'}
              {confirmDialog?.type === 'delete' && 'Yes, Delete Workshop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={addParticipantDialog} onOpenChange={setAddParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Register a new participant for the selected workshop
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addParticipant(); }} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="participantEmail">Email *</Label>
              <Input
                id="participantEmail"
                type="email"
                value={participantForm.email}
                onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                placeholder="participant@example.com"
                required
                disabled={addingParticipant}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="participantName">Name (Optional)</Label>
              <Input
                id="participantName"
                value={participantForm.name}
                onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                placeholder="John Doe"
                disabled={addingParticipant}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddParticipantDialog(false)} disabled={addingParticipant}>
                Cancel
              </Button>
              <Button type="submit" disabled={addingParticipant}>
                {addingParticipant ? 'Adding...' : 'Add Participant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
