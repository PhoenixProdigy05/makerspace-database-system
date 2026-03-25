'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

type AvailabilityFilter = 'all' | 'available' | 'low' | 'inactive';

export default function MemberEquipmentPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getInventoryItems();
        setItems(data as InventoryItem[]);
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.name} ${item.sku} ${item.location} ${item.supplier}`.toLowerCase();
      const q = search.toLowerCase();
      if (q && !text.includes(q)) return false;

      if (availability === 'available') {
        return item.isActive && !item.isLowStock && item.quantity > 0;
      }
      if (availability === 'low') {
        return item.isLowStock;
      }
      if (availability === 'inactive') {
        return !item.isActive;
      }
      return true;
    });
  }, [items, search, availability]);

  const renderStatusBadge = (item: InventoryItem) => {
    if (!item.isActive) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          Inactive
        </span>
      );
    }
    if (item.isLowStock) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-destructive/10 text-destructive">
          Low stock
        </span>
      );
    }
    if (item.quantity <= 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          Unavailable
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
        Available
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Equipment catalogue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-sm">
                <Input
                  placeholder="Search by name, SKU, location, supplier"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  className={`px-3 py-1 rounded border text-xs ${
                    availability === 'all' ? 'bg-accent border-border' : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setAvailability('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded border text-xs ${
                    availability === 'available' ? 'bg-accent border-border' : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setAvailability('available')}
                >
                  Available
                </button>
                <button
                  className={`px-3 py-1 rounded border text-xs ${
                    availability === 'low' ? 'bg-accent border-border' : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setAvailability('low')}
                >
                  Low stock
                </button>
                <button
                  className={`px-3 py-1 rounded border text-xs ${
                    availability === 'inactive' ? 'bg-accent border-border' : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setAvailability('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading equipment...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">No equipment found.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Card key={item.itemId} className={item.isLowStock ? 'border-destructive/60' : ''}>
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate" title={item.name}>
                      {item.name}
                    </span>
                    {renderStatusBadge(item)}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between gap-2">
                    <span>{item.sku || '-'}</span>
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-medium text-foreground">{item.location || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplier</span>
                    <span className="font-medium text-foreground">{item.supplier || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threshold</span>
                    <span className="font-medium text-foreground">
                      {item.threshold} {item.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

