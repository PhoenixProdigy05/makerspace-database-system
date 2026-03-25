'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSystemDataPage() {
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">System Data &gt; Import / Export</div>
      <h1 className="text-2xl font-semibold">System Data (Import/Export)</h1>

      {/* Download Data */}
      <Card>
        <CardHeader>
          <CardTitle>Download Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Choose type (Members, Bookings, Staff, Equipment, Projects) → export as CSV, Excel, or PDF.</div>
          <div className="flex gap-2">
            <Button>Export CSV</Button>
            <Button variant="outline">Export Excel</Button>
            <Button variant="outline">Export PDF</Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Data */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Upload CSV/Excel files → validate and show summary of results.</div>
          <div className="flex items-center gap-2">
            <Input type="file" />
            <Button>Upload</Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>Trigger Backup</Button>
          <Button variant="outline">Restore from Backup</Button>
        </CardContent>
      </Card>
    </div>
  );
}
