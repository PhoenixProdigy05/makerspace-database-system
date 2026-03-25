'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AttachmentUploadProps {
  ownerTable: string;
  ownerId: string;
  onUploadSuccess?: () => void;
}

export function AttachmentUpload({ ownerTable, ownerId, onUploadSuccess }: AttachmentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await apiClient.uploadFile(file, ownerTable, ownerId);
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload File</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>
      {file && (
        <div className="text-sm text-muted-foreground">
          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
}

