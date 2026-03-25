"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BookingPage() {
  const router = useRouter();
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
      router.push("/bookings/history");
    } catch (err: any) {
      setError(err?.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Booking</CardTitle>
          </CardHeader>
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
        </Card>
      </div>
    </ProtectedRoute>
  );
}
