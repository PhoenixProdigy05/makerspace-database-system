'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';

type Booking = any;

const FullCalendarComponent = dynamic<any>(() => import('@fullcalendar/react').then((m) => m.default as any), { ssr: false }) as any;

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: string; kind: 'APPROVE' | 'REJECT' | 'RETURN' | 'OVERDUE' } | null>(null);
  const [filters, setFilters] = useState<{ status?: string; from?: string; member?: string; equipment?: string }>({});
  const [details, setDetails] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ appointmentTime: string; equipment: string; notes: string }>({ appointmentTime: '', equipment: '', notes: '' });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBookings({
        status: filters.status,
        from: filters.from,
        member: filters.member,
        equipment: filters.equipment,
      });
      
      setBookings(data || []);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to load bookings', description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const askAction = (id: string, kind: 'APPROVE' | 'REJECT' | 'RETURN' | 'OVERDUE') => {
    setPendingAction({ id, kind });
    setConfirmOpen(true);
  };

  const approve = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No booking selected', description: 'Please select a booking to approve.' });
      return;
    }
    askAction(selectedId, 'APPROVE');
  };

  const reject = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No booking selected', description: 'Please select a booking to reject.' });
      return;
    }
    askAction(selectedId, 'REJECT');
  };

  const markAsReturned = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No booking selected', description: 'Please select a booking to mark as returned.' });
      return;
    }
    askAction(selectedId, 'RETURN');
  };

  const markAsOverdue = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No booking selected', description: 'Please select a booking to mark as overdue.' });
      return;
    }
    askAction(selectedId, 'OVERDUE');
  };

  const editSelected = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No booking selected', description: 'Please select a booking to edit.' });
      return;
    }
    const booking = bookings.find(b => (b.bookingId || b.id) === selectedId);
    if (booking) {
      openEdit(booking);
    }
  };

  const viewDetails = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No booking selected', description: 'Please select a booking to view details.' });
      return;
    }
    const booking = bookings.find(b => (b.bookingId || b.id) === selectedId);
    if (booking) {
      setDetails(booking);
    }
  };

  const runAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.kind === 'APPROVE') {
        await apiClient.updateBookingStatus(pendingAction.id, 'APPROVED');
        toast({ variant: 'success', title: 'Booking approved' });
      } else if (pendingAction.kind === 'REJECT') {
        await apiClient.updateBookingStatus(pendingAction.id, 'REJECTED');
        toast({ variant: 'success', title: 'Booking rejected' });
      } else if (pendingAction.kind === 'OVERDUE') {
        await apiClient.updateBookingStatus(pendingAction.id, 'OVERDUE');
        toast({ variant: 'success', title: 'Marked as overdue' });
      } else {
        await apiClient.returnBooking(pendingAction.id);
        toast({ variant: 'success', title: 'Marked as returned' });
      }
      setSelectedId(null); // Clear selection after action
      await load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Action failed', description: e?.message });
    } finally {
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  const events = useMemo(() => {
    return (bookings || []).map((b: any) => ({
      id: b.bookingId || String(b.id || ''),
      title: `${b.equipment || b.tools || 'Booking'}`,
      start: b.appointmentTime || b.start || b.date,
      end: b.end || undefined,
    }));
  }, [bookings]);

  const openEdit = (b: any) => {
    setEditing(b);
    setEditForm({
      appointmentTime: b.appointmentTime ? new Date(b.appointmentTime).toISOString().slice(0, 16) : '',
      equipment: b.equipment || '',
      notes: b.notes || '',
    });
    setEditOpen(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    // Basic validation: date required and not in the past
    if (!editForm.appointmentTime) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Appointment date/time is required.' });
      return;
    }
    const dt = new Date(editForm.appointmentTime);
    if (isNaN(dt.getTime()) || dt.getTime() < Date.now() - 60_000) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Appointment time cannot be in the past.' });
      return;
    }
    setEditSaving(true);
    try {
      await apiClient.updateBooking(editing.bookingId || editing.id, {
        appointmentTime: new Date(editForm.appointmentTime).toISOString(),
        equipment: editForm.equipment || undefined,
        notes: editForm.notes || undefined,
      });
      toast({ variant: 'success', title: 'Booking updated' });
      setEditOpen(false);
      setEditing(null);
      setSelectedId(null); // Clear selection after edit
      await load();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to update booking', description: err?.message });
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Reservations</div>
      <h1 className="text-2xl font-semibold">Bookings Management</h1>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={approve}>Approve</Button>
        <Button variant="outline" onClick={reject}>Reject</Button>
        <Button variant="outline" onClick={markAsReturned}>Mark as Returned</Button>
        <Button variant="outline" onClick={markAsOverdue}>Mark Overdue</Button>
        <Button variant="outline" onClick={editSelected}>Edit</Button>
        <Button variant="outline" onClick={viewDetails}>Details</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <select className="h-9 rounded-md border border-input px-2" value={filters.status || ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <input className="h-9 rounded-md border border-input px-2" type="date" value={filters.from || ''} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))} />
        <input className="h-9 rounded-md border border-input px-2" placeholder="Member" value={filters.member || ''} onChange={(e) => setFilters((f) => ({ ...f, member: e.target.value || undefined }))} />
        <div className="flex gap-2">
          <input className="h-9 flex-1 rounded-md border border-input px-2" placeholder="Equipment" value={filters.equipment || ''} onChange={(e) => setFilters((f) => ({ ...f, equipment: e.target.value || undefined }))} />
          <Button variant="outline" onClick={load}>Apply</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b: any) => (
                    <TableRow 
                      key={b.bookingId || b.id} 
                      onClick={() => setSelectedId(b.bookingId || b.id)} 
                      className={selectedId === (b.bookingId || b.id) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>{b.bookingId || b.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{b.memberName || 'Unknown'}</div>
                          {b.memberEmail && (
                            <div className="text-xs text-muted-foreground">{b.memberEmail}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{b.appointmentType || '—'}</TableCell>
                      <TableCell>{b.equipment || b.tools || '—'}</TableCell>
                      <TableCell>{b.appointmentTime ? new Date(b.appointmentTime).toLocaleString() : '—'}</TableCell>
                      <TableCell>
                        {b.status ? (
                          <span
                            className={`text-xs px-2 py-1 rounded border ${
                              b.status === 'APPROVED'
                                ? 'border-emerald-500 text-emerald-600'
                                : b.status === 'REJECTED'
                                ? 'border-destructive text-destructive'
                                : 'border-yellow-500 text-yellow-600'
                            }`}
                          >
                            {b.status}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Calendar View</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {/* FullCalendar requires packages to be installed */}
            <FullCalendarComponent
              plugins={[dayGridPlugin as any, timeGridPlugin as any, interactionPlugin as any]}
              initialView="dayGridMonth"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
              height={650}
              events={events}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent onClose={() => setConfirmOpen(false)}>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              {pendingAction?.kind === 'APPROVE'
                ? 'Approve'
                : pendingAction?.kind === 'REJECT'
                ? 'Reject'
                : pendingAction?.kind === 'OVERDUE'
                ? 'Mark as overdue for'
                : 'Mark as returned for'}{' '}
              this booking?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={runAction}>{pendingAction?.kind === 'APPROVE' ? 'Approve' : pendingAction?.kind === 'REJECT' ? 'Reject' : 'Confirm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent onClose={() => setDetails(null)}>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>View booking information</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">ID:</span> {details.bookingId || details.id}</div>
              <div>
                <span className="text-muted-foreground">Member:</span>
                <div>
                  <div className="font-medium">{details.memberName || details.member || '—'}</div>
                  {details.memberEmail && (
                    <div className="text-xs text-muted-foreground">{details.memberEmail}</div>
                  )}
                </div>
              </div>
              <div><span className="text-muted-foreground">Type:</span> {details.appointmentType || '—'}</div>
              <div><span className="text-muted-foreground">Equipment:</span> {details.equipment || details.tools || '—'}</div>
              <div><span className="text-muted-foreground">Date:</span> {details.appointmentTime ? new Date(details.appointmentTime).toLocaleString() : '—'}</div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Status:</span>
                {details.status ? (
                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      details.status === 'APPROVED'
                        ? 'border-emerald-500 text-emerald-600'
                        : details.status === 'REJECTED'
                        ? 'border-destructive text-destructive'
                        : 'border-yellow-500 text-yellow-600'
                    }`}
                  >
                    {details.status}
                  </span>
                ) : (
                  '—'
                )}
              </div>
              {details.notes && <div><span className="text-muted-foreground">Notes:</span> {details.notes}</div>}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetails(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(o) => !o && setEditOpen(false)}>
        <DialogContent onClose={() => setEditOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>Update booking date/time, equipment, or notes</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="appointmentTime">Appointment Time *</Label>
              <Input
                id="appointmentTime"
                type="datetime-local"
                value={editForm.appointmentTime}
                onChange={(e) => setEditForm((f) => ({ ...f, appointmentTime: e.target.value }))}
                required
                disabled={editSaving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={editForm.equipment}
                onChange={(e) => setEditForm((f) => ({ ...f, equipment: e.target.value }))}
                disabled={editSaving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                disabled={editSaving}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
              <Button type="submit" disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
