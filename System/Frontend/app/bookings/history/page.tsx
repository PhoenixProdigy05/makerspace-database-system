"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Booking {
  bookingId: string;
  tools: string;
  materials: string;
  durationMinutes: number;
  appointmentTime?: string;
  appointmentType?: string;
  notes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "OVERDUE";
  progress: number;
  projectDescription?: string;
  createdAt?: string;
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMyBookings();
        setBookings(data as Booking[]);
      } catch (err: any) {
        setError(err?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      setError(null);
      await apiClient.cancelMyBooking(id);
      const data = await apiClient.getMyBookings();
      setBookings(data as Booking[]);
    } catch (err: any) {
      setError(err?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        {loading && <div className="text-muted-foreground">Loading...</div>}
        {error && <div className="text-destructive">{error}</div>}
        {!loading && bookings.length === 0 && (
          <div className="text-muted-foreground">No bookings yet.</div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((b) => (
            <Card key={b.bookingId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{new Date(b.appointmentTime || b.createdAt || "").toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded border ${
                    b.status === "APPROVED" ? "border-emerald-500 text-emerald-600" : b.status === "REJECTED" ? "border-destructive text-destructive" : "border-yellow-500 text-yellow-600"
                  }`}>
                    {b.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {b.appointmentType && (
                  <div className="text-sm"><span className="text-muted-foreground">Type:</span> {b.appointmentType}</div>
                )}
                <div className="text-sm"><span className="text-muted-foreground">Tools:</span> {b.tools}</div>
                <div className="text-sm"><span className="text-muted-foreground">Materials:</span> {b.materials}</div>
                <div className="text-sm"><span className="text-muted-foreground">Duration:</span> {b.durationMinutes} min</div>
                {b.projectDescription && (
                  <div className="text-sm"><span className="text-muted-foreground">Project:</span> {b.projectDescription}</div>
                )}
                <div className="mt-2">
                  <div className="h-2 w-full bg-muted rounded">
                    <div className="h-2 bg-primary rounded" style={{ width: `${Math.min(100, Math.max(0, b.progress || 0))}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Progress: {b.progress || 0}%</div>
                </div>
                {(b.status === "PENDING" || b.status === "APPROVED") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(b.bookingId)}
                    disabled={cancellingId === b.bookingId}
                  >
                    {cancellingId === b.bookingId ? "Cancelling..." : "Cancel appointment"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
