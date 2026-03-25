'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryItemDialog } from '@/components/InventoryItemDialog';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';

interface InventoryItem {
  itemId: string;
  name: string;
  sku?: string;
  unit?: string;
  quantity: number;
  threshold?: number;
  location?: string;
  supplier?: string;
  isActive?: boolean;
  isLowStock?: boolean;
}

export default function StaffInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    sku: '',
    location: '',
    status: '',
    minQuantity: '',
    maxQuantity: ''
  });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchFilters]);

  const applyFilters = () => {
    let filtered = [...items];
    
    // Filter by name
    if (searchFilters.name) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }
    
    // Filter by SKU
    if (searchFilters.sku) {
      filtered = filtered.filter(item => 
        item.sku?.toLowerCase().includes(searchFilters.sku.toLowerCase())
      );
    }
    
    // Filter by location
    if (searchFilters.location) {
      filtered = filtered.filter(item => 
        item.location?.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }
    
    // Filter by status
    if (searchFilters.status) {
      const isActive = searchFilters.status === 'active';
      filtered = filtered.filter(item => item.isActive !== false === isActive);
    }
    
    // Filter by quantity range
    if (searchFilters.minQuantity) {
      const minQty = parseInt(searchFilters.minQuantity);
      filtered = filtered.filter(item => item.quantity >= minQty);
    }
    
    if (searchFilters.maxQuantity) {
      const maxQty = parseInt(searchFilters.maxQuantity);
      filtered = filtered.filter(item => item.quantity <= maxQty);
    }
    
    setFilteredItems(filtered);
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      sku: '',
      location: '',
      status: '',
      minQuantity: '',
      maxQuantity: ''
    });
  };

  const load = async () => {
    try {
      setLoading(true);
      const [all, lows] = await Promise.all([
        apiClient.getInventoryItems(),
        apiClient.getLowStockItems(),
      ]);
      setItems(all || []);
      setLowStock(lows || []);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to load inventory', description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setEditing(null);
    setSelectedId(null);
    setDialogOpen(true);
  };

  const updateInfo = () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No item selected', description: 'Please select an item to update.' });
      return;
    }
    const item = items.find(it => it.itemId === selectedId);
    if (item) {
      setEditing(item);
      setDialogOpen(true);
    }
  };

  const markUnderMaintenance = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'No item selected', description: 'Please select an item to mark as under maintenance.' });
      return;
    }
    
    if (!confirm('Mark this equipment as under maintenance?')) return;
    
    try {
      await apiClient.updateInventoryItem(selectedId, { isActive: false });
      toast({ variant: 'success', title: 'Equipment marked as under maintenance' });
      setSelectedId(null);
      await load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to update status', description: e?.message });
    }
  };

  const editItem = (it: InventoryItem) => {
    setEditing(it);
    setDialogOpen(true);
  };

  const removeItem = async (itemId: string) => {
    if (!confirm('Remove this equipment?')) return;
    try {
      await apiClient.deleteInventoryItem(itemId);
      toast({ variant: 'success', title: 'Equipment removed' });
      if (selectedId === itemId) setSelectedId(null);
      await load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to remove', description: e?.message });
    }
  };

  const onDialogChange = async (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      setSelectedId(null);
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Tools & Equipment</div>
      <h1 className="text-2xl font-semibold">Inventory Management</h1>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={addItem}>Add Equipment</Button>
        <Button variant="outline" onClick={updateInfo}>Update Info</Button>
        <Button variant="outline" onClick={markUnderMaintenance}>Mark as Under Maintenance</Button>
      </div>

      {/* Search and Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Search by name..."
                value={searchFilters.name}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Search by SKU..."
                value={searchFilters.sku}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Search by location..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="h-9 w-full rounded-md border border-input px-2 text-sm"
                value={searchFilters.status}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                placeholder="Min qty"
                value={searchFilters.minQuantity}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Max Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                placeholder="Max qty"
                value={searchFilters.maxQuantity}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, maxQuantity: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            <div className="text-sm text-muted-foreground ml-2 py-2">
              Showing {filteredItems.length} of {items.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Equipment</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((it) => (
                    <TableRow 
                      key={it.itemId} 
                      onClick={() => setSelectedId(it.itemId)} 
                      className={selectedId === it.itemId ? 'bg-muted/50' : ''}
                    >
                      <TableCell>{it.itemId}</TableCell>
                      <TableCell>{it.name}</TableCell>
                      <TableCell>{it.sku || '—'}</TableCell>
                      <TableCell>{it.quantity}</TableCell>
                      <TableCell>{it.unit || '—'}</TableCell>
                      <TableCell>{it.location || '—'}</TableCell>
                      <TableCell>{it.isActive === false ? 'Inactive' : 'Active'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Insights</CardTitle></CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <div className="text-sm text-muted-foreground">No low-stock items.</div>
          ) : (
            <ul className="text-sm list-disc pl-5 space-y-1">
              {lowStock.map((it) => (
                <li key={it.itemId}>{it.name} — {it.quantity} {it.unit || ''} remaining</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <InventoryItemDialog open={dialogOpen} onOpenChange={onDialogChange} item={editing as any} />
    </div>
  );
}
