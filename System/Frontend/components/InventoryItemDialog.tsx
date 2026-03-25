'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
}

interface InventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export function InventoryItemDialog({ open, onOpenChange, item }: InventoryItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: '',
    quantity: '',
    threshold: '',
    location: '',
    supplier: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        unit: item.unit || '',
        quantity: item.quantity?.toString() || '',
        threshold: item.threshold?.toString() || '',
        location: item.location || '',
        supplier: item.supplier || '',
        isActive: item.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        unit: '',
        quantity: '',
        threshold: '',
        location: '',
        supplier: '',
        isActive: true,
      });
    }
    setError('');
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku || undefined,
        unit: formData.unit || undefined,
        quantity: parseFloat(formData.quantity) || 0,
        threshold: parseFloat(formData.threshold) || 0,
        location: formData.location || undefined,
        supplier: formData.supplier || undefined,
        isActive: formData.isActive,
      };

      if (item) {
        await apiClient.updateInventoryItem(item.itemId, payload);
      } else {
        await apiClient.createInventoryItem(payload);
      }

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the inventory item details' : 'Create a new inventory item'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., pcs, kg, L"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={loading}
              className="rounded"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : item ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

