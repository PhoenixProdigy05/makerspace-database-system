'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { Download, Trash2 } from 'lucide-react';

interface Attachment {
  attachmentId: string;
  filename: string;
  fileUrl: string;
  uploadedByName: string;
  uploadedAt: string;
}

interface AttachmentListProps {
  ownerTable: string;
  ownerId: string;
}

export function AttachmentList({ ownerTable, ownerId }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canDelete = user?.role === 'Admin' || user?.role === 'Staff';

  useEffect(() => {
    loadAttachments();
  }, [ownerTable, ownerId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAttachmentsByOwner(ownerTable, ownerId);
      setAttachments(data);
    } catch (err) {
      console.error('Failed to load attachments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await apiClient.deleteAttachment(attachmentId);
      loadAttachments();
    } catch (err) {
      console.error('Failed to delete attachment', err);
    }
  };

  const handleDownload = (fileUrl: string, filename: string) => {
    const url = apiClient.getAttachmentDownloadUrl(fileUrl);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading attachments...</div>;
  }

  if (attachments.length === 0) {
    return <div className="text-sm text-muted-foreground">No attachments</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.attachmentId}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex-1">
                <div className="font-medium">{attachment.filename}</div>
                <div className="text-sm text-muted-foreground">
                  Uploaded by {attachment.uploadedByName} on{' '}
                  {new Date(attachment.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(attachment.fileUrl, attachment.filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(attachment.attachmentId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

