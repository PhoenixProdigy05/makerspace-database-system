'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AttachmentUpload } from '@/components/AttachmentUpload';
import { AttachmentList } from '@/components/AttachmentList';

interface InventoryItem {
  itemId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  threshold: number;
  location: string;
  supplier: string;
  isActive: boolean;
  isLowStock: boolean;
}

export default function InventoryItemDetailPage() {
  return (
    <ProtectedRoute>
      <InventoryItemDetailContent />
    </ProtectedRoute>
  );
}

function InventoryItemDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'Admin' || user?.role === 'Staff';
  const itemId = params.id as string;

  useEffect(() => {
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getInventoryItem(itemId);
      setItem(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load inventory item');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Item not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="container mx-auto flex-1 p-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>Inventory Item Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p>{item.sku || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className={item.isLowStock ? 'text-destructive font-medium' : ''}>
                  {item.quantity} {item.unit || ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Threshold</label>
                <p>{item.threshold} {item.unit || ''}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p>{item.location || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p>{item.supplier || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>Attach files to this inventory item</CardDescription>
              </CardHeader>
              <CardContent>
                <AttachmentUpload
                  ownerTable="inventory_items"
                  ownerId={item.itemId}
                  onUploadSuccess={loadItem}
                />
              </CardContent>
            </Card>

            <AttachmentList
              ownerTable="inventory_items"
              ownerId={item.itemId}
            />
          </>
        )}
      </main>
    </div>
  );
}

