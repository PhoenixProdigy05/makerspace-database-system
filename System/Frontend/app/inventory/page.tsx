'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InventoryItemDialog } from '@/components/InventoryItemDialog';
import { AttachmentUpload } from '@/components/AttachmentUpload';
import { AttachmentList } from '@/components/AttachmentList';
import { AlertCircle } from 'lucide-react';

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

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryContent />
    </ProtectedRoute>
  );
}

function InventoryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'Admin' || user?.role === 'Staff';

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [allItems, lowStock] = await Promise.all([
        apiClient.getInventoryItems(),
        (user?.role === 'Admin' || user?.role === 'Staff') 
          ? apiClient.getLowStockItems() 
          : Promise.resolve([])
      ]);
      setItems(allItems);
      setLowStockItems(lowStock);
      setError('');
    } catch (err: any) {
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiClient.deleteInventoryItem(itemId);
      loadInventory();
    } catch (err: any) {
      setError('Failed to delete item');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    loadInventory();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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

        {canEdit && lowStockItems.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>
                {lowStockItems.length} item(s) are below their threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.itemId} className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.quantity} {item.unit} (Threshold: {item.threshold})
                    </span>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{lowStockItems.length - 5} more items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Manage your inventory items</CardDescription>
              </div>
              {canEdit && (
                <Button onClick={handleAdd}>Add Item</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 8 : 7} className="text-center text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow 
                      key={item.itemId} 
                      className={`cursor-pointer hover:bg-accent ${item.isLowStock ? 'bg-destructive/5' : ''}`}
                      onClick={() => router.push(`/inventory/${item.itemId}`)}
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku || '-'}</TableCell>
                      <TableCell>
                        <span className={item.isLowStock ? 'text-destructive font-medium' : ''}>
                          {item.quantity} {item.unit || ''}
                        </span>
                      </TableCell>
                      <TableCell>{item.threshold} {item.unit || ''}</TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell>{item.supplier || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            {user?.role === 'Admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.itemId)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <InventoryItemDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          item={editingItem}
        />

        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>File Attachments</CardTitle>
              <CardDescription>Upload and manage files for inventory items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AttachmentUpload
                ownerTable="inventory_items"
                ownerId={items[0]?.itemId || ''}
                onUploadSuccess={() => {}}
              />
              {items[0] && (
                <AttachmentList
                  ownerTable="inventory_items"
                  ownerId={items[0].itemId}
                />
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

