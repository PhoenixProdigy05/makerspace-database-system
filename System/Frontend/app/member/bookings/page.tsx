'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'OVERDUE';

interface Booking {
  bookingId: string;
  tools: string;
  materials: string;
  durationMinutes: number;
  appointmentTime?: string;
  notes?: string;
  status: BookingStatus;
  progress: number;
  projectDescription?: string;
  createdAt?: string;
}

export default function MemberBookingsPage() {
  const router = useRouter();
  
  // New booking form state
  const [appointmentType, setAppointmentType] = useState("GENERAL_WORKSPACE");
  const [tools, setTools] = useState("");
  const [materials, setMaterials] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);

  // Existing bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  // Load existing bookings
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMyBookings();
        setBookings(data as Booking[]);
        setBookingsError('');
      } catch (err: any) {
        setBookingsError(err?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.createBooking({
        tools,
        materials,
        durationMinutes: Number(durationMinutes),
        appointmentType: appointmentType || undefined,
        appointmentTime: appointmentTime ? new Date(appointmentTime).toISOString() : undefined,
        notes: notes || undefined,
        projectDescription: projectDescription || undefined,
      });
      setSuccess("Booking submitted. Awaiting admin approval.");
      setAppointmentType("GENERAL_WORKSPACE");
      setTools("");
      setMaterials("");
      setDurationMinutes(60);
      setAppointmentTime("");
      setProjectDescription("");
      setNotes("");
      setShowNewBookingForm(false);
      
      // Refresh bookings list
      const data = await apiClient.getMyBookings();
      setBookings(data as Booking[]);
    } catch (err: any) {
      setError(err?.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();

  const { active, history } = useMemo(() => {
    const activeStatuses: BookingStatus[] = ['PENDING', 'APPROVED', 'OVERDUE'];

    const active: Booking[] = [];
    const history: Booking[] = [];

    bookings.forEach((b) => {
      const isActiveStatus = activeStatuses.includes(b.status);
      const startDate = b.appointmentTime ? new Date(b.appointmentTime) : b.createdAt ? new Date(b.createdAt) : null;
      if (isActiveStatus && startDate && startDate >= now) {
        active.push(b);
      } else {
        history.push(b);
      }
    });

    active.sort((a, b) => new Date(a.appointmentTime || a.createdAt || '').getTime() - new Date(b.appointmentTime || b.createdAt || '').getTime());
    history.sort((a, b) => new Date(b.appointmentTime || b.createdAt || '').getTime() - new Date(a.appointmentTime || b.createdAt || '').getTime());

    return { active, history };
  }, [bookings, now]);

  const statusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return status;
    }
  };

  const statusClass = (status: BookingStatus) => {
    if (status === 'APPROVED') return 'border-emerald-500 text-emerald-600';
    if (status === 'PENDING') return 'border-yellow-500 text-yellow-600';
    if (status === 'OVERDUE') return 'border-destructive text-destructive';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'border-destructive text-destructive';
    if (status === 'COMPLETED') return 'border-blue-500 text-blue-600';
    return 'border-muted-foreground text-muted-foreground';
  };

  const canCancel = (b: Booking) => {
    if (b.status !== 'PENDING' && b.status !== 'APPROVED') return false;
    if (!b.appointmentTime) return true;
    const start = new Date(b.appointmentTime);
    return start > now;
  };

  const handleCancel = async (booking: Booking) => {
    if (!canCancel(booking)) return;
    if (!confirm('Cancel this booking?')) return;
    try {
      setActionBusyId(booking.bookingId);
      await apiClient.updateBookingStatus(booking.bookingId, 'CANCELLED');
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === booking.bookingId
            ? { ...b, status: 'CANCELLED' }
            : b
        )
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking');
    } finally {
      setActionBusyId(null);
    }
  };

  const renderBookingCard = (b: Booking) => {
    const startLabel = new Date(b.appointmentTime || b.createdAt || '').toLocaleString();

    return (
      <Card key={b.bookingId}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-sm font-medium">{startLabel}</span>
            <span
              className={`text-xs px-2 py-1 rounded border ${statusClass(b.status)}`}
            >
              {statusLabel(b.status)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-2 text-xs text-muted-foreground">
            <span>Tools</span>
            <span className="text-foreground max-w-[60%] text-right truncate" title={b.tools}>{b.tools}</span>
          </div>
          <div className="flex justify-between gap-2 text-xs text-muted-foreground">
            <span>Materials</span>
            <span className="text-foreground max-w-[60%] text-right truncate" title={b.materials}>{b.materials}</span>
          </div>
          <div className="flex justify-between gap-2 text-xs text-muted-foreground">
            <span>Duration</span>
            <span className="text-foreground">{b.durationMinutes} min</span>
          </div>
          {b.projectDescription && (
            <div className="flex justify-between gap-2 text-xs text-muted-foreground">
              <span>Project</span>
              <span className="text-foreground max-w-[60%] text-right truncate" title={b.projectDescription}>{b.projectDescription}</span>
            </div>
          )}
          {b.notes && (
            <div className="flex justify-between gap-2 text-xs text-muted-foreground">
              <span>Notes</span>
              <span className="text-foreground max-w-[60%] text-right truncate" title={b.notes}>{b.notes}</span>
            </div>
          )}
          <div className="mt-2">
            <div className="h-2 w-full bg-muted rounded">
              <div
                className="h-2 bg-primary rounded"
                style={{ width: `${Math.min(100, Math.max(0, b.progress || 0))}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Progress: {b.progress || 0}%</div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {canCancel(b) && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionBusyId === b.bookingId}
                onClick={() => handleCancel(b)}
              >
                {actionBusyId === b.bookingId ? 'Cancelling…' : 'Cancel booking'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* New Booking Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bookings</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setShowNewBookingForm(!showNewBookingForm)}
              >
                {showNewBookingForm ? 'Cancel' : 'New Booking'}
              </Button>
            </div>
          </CardHeader>
          {showNewBookingForm && (
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment type</Label>
                  <select
                    id="appointmentType"
                    className="h-9 w-full rounded-md border border-input px-2 text-sm"
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <option value="GENERAL_WORKSPACE">General Workspace Time</option>
                    <option value="MACHINE_ROOM">Machine Room Appointment</option>
                    <option value="ELECTRONICS_LAB">Electronics Lab Use</option>
                    <option value="THREE_D_PRINTING">3D Printing Session</option>
                    <option value="CNC_ROOM">CNC Room Appointment</option>
                    <option value="TECHNICAL_ASSISTANCE">Technical Assistance Session</option>
                    <option value="WOODWORKING_ROOM">Woodworking Room Appointment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tools">Tools to be used</Label>
                  <Input id="tools" value={tools} onChange={(e) => setTools(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materials">Materials</Label>
                  <Input id="materials" value={materials} onChange={(e) => setMaterials(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Preferred date & time</Label>
                  <Input
                    id="appointmentTime"
                    type="datetime-local"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">What is this appointment for?</Label>
                  <Input
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                {success && <div className="text-sm text-emerald-600">{success}</div>}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit Booking"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Existing Bookings Section */}
        {bookingsError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {bookingsError}
          </div>
        )}

        {loading && (
          <div className="text-sm text-muted-foreground">Loading bookings…</div>
        )}

        {!loading && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active / upcoming bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {active.length === 0 && (
                    <div className="text-xs text-muted-foreground">No active bookings.</div>
                  )}
                  {active.map(renderBookingCard)}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Booking history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {history.length === 0 && (
                    <div className="text-xs text-muted-foreground">No past bookings.</div>
                  )}
                  {history.map(renderBookingCard)}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

