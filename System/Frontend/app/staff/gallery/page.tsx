'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Image as ImageIcon, Upload, ArrowUp, ArrowDown } from 'lucide-react';

interface GalleryItem {
  galleryId: string;
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function StaffGalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', file: null as File | null });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'delete'; itemId: string; title: string } | null>(null);
  const [previewDialog, setPreviewDialog] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        const items = await apiClient.getGalleryItems();
        const sortedItems = items.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order);
        setGalleryItems(sortedItems);
      } catch (error) {
        console.error('Failed to fetch gallery items:', error);
        // Fallback to mock data
        const mockItems: GalleryItem[] = [
          {
            galleryId: 'mock-1',
            title: 'Makerspace Community',
            description: 'Our vibrant community of creators and innovators',
            imageUrl: '/gallery-placeholder-1.jpg',
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            galleryId: 'mock-2',
            title: '3D Printing Workshop',
            description: 'Members learning advanced 3D printing techniques',
            imageUrl: '/gallery-placeholder-2.jpg',
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setGalleryItems(mockItems);
      }
    };

    loadGalleryItems();
  }, []);

  const onCreate = () => {
    setForm({ title: '', description: '', imageUrl: '', file: null });
    setEditingId(null);
    setOpen(true);
  };

  const onEdit = (item: GalleryItem) => {
    setForm({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      file: null
    });
    setEditingId(item.galleryId);
    setOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid file type', description: 'Please select an image file.' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image smaller than 5MB.' });
        return;
      }

      setForm({ ...form, file, imageUrl: '' });
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Title is required.' });
      return;
    }

    if (!form.file && !form.imageUrl.trim()) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Please provide either an image file or image URL.' });
      return;
    }

    setSaving(true);
    try {
      const itemData = {
        title: form.title,
        description: form.description,
        ...(form.file ? { file: form.file } : { imageUrl: form.imageUrl })
      };

      if (editingId) {
        await apiClient.updateGalleryItem(editingId, {
          title: itemData.title,
          description: itemData.description,
          imageUrl: form.imageUrl || undefined
        });
        toast({ variant: 'success', title: 'Gallery item updated successfully' });
      } else {
        const newItem = await apiClient.createGalleryItem(itemData);
        // Update order for new item
        const maxOrder = Math.max(...galleryItems.map(item => item.order), 0);
        await apiClient.updateGalleryItemOrder(newItem.galleryId, maxOrder + 1);
        toast({ variant: 'success', title: 'Gallery item created successfully' });
      }

      // Refresh the list
      const items = await apiClient.getGalleryItems();
      const sortedItems = items.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order);
      setGalleryItems(sortedItems);

      setOpen(false);
      setForm({ title: '', description: '', imageUrl: '', file: null });
      setEditingId(null);
    } catch (error: any) {
      console.error('Failed to save gallery item:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to save gallery item', 
        description: error?.message || 'An error occurred while saving the gallery item.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select an item first' });
      return;
    }
    
    const selectedItem = galleryItems.find(item => item.galleryId === selectedId);
    if (!selectedItem) return;

    setConfirmDialog({
      type: 'delete',
      itemId: selectedId,
      title: selectedItem.title
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog) return;

    try {
      await apiClient.deleteGalleryItem(confirmDialog.itemId);
      
      // Refresh the list
      const items = await apiClient.getGalleryItems();
      const sortedItems = items.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order);
      setGalleryItems(sortedItems);
      
      setSelectedId(null);
      toast({ variant: 'success', title: 'Gallery item deleted successfully' });
    } catch (error: any) {
      console.error('Failed to delete gallery item:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to delete gallery item', 
        description: error?.message || 'An error occurred while deleting the gallery item.' 
      });
    } finally {
      setConfirmDialog(null);
    }
  };

  const moveItem = async (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = galleryItems.findIndex(item => item.galleryId === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= galleryItems.length) return;

    try {
      // Swap orders
      const currentItem = galleryItems[currentIndex];
      const targetItem = galleryItems[newIndex];

      await apiClient.updateGalleryItemOrder(currentItem.galleryId, targetItem.order);
      await apiClient.updateGalleryItemOrder(targetItem.galleryId, currentItem.order);

      // Refresh the list
      const items = await apiClient.getGalleryItems();
      const sortedItems = items.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order);
      setGalleryItems(sortedItems);
    } catch (error: any) {
      console.error('Failed to reorder gallery item:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to reorder item', 
        description: error?.message || 'An error occurred while reordering the gallery item.' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Homepage Content</div>
      <h1 className="text-2xl font-semibold">Gallery Management</h1>

      <div className="flex gap-2">
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gallery Item
        </Button>
        <Button variant="destructive" onClick={remove} disabled={!selectedId}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Gallery Items</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galleryItems.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground">No gallery items yet.</TableCell></TableRow>
                ) : (
                  galleryItems.map((item, index) => (
                    <TableRow 
                      key={item.galleryId} 
                      onClick={() => setSelectedId(item.galleryId)} 
                      className={selectedId === item.galleryId ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{item.order}</span>
                          <div className="flex flex-col">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveItem(item.galleryId, 'up');
                              }}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveItem(item.galleryId, 'down');
                              }}
                              disabled={index === galleryItems.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {item.description || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate max-w-xs">
                            {item.imageUrl}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setPreviewDialog(item)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={(o) => {
        if (!o) {
          setOpen(false);
          setEditingId(null);
          setForm({ title: '', description: '', imageUrl: '', file: null });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update gallery item details' : 'Add a new image to the homepage gallery'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input 
                id="title" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
                disabled={saving} 
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                disabled={saving} 
                placeholder="Brief description of the image"
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="file">Upload Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={saving}
                  className="flex-1"
                />
                {form.file && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    {form.file.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image file (max 5MB) or provide an image URL below
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl" 
                value={form.imageUrl} 
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value, file: null })} 
                disabled={saving || !!form.file}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Provide a direct link to the image if not uploading
              </p>
            </div>

            {form.imageUrl && !form.file && (
              <div className="space-y-1">
                <Label>Preview</Label>
                <div className="border rounded-md p-2">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDialog} onOpenChange={() => setPreviewDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDialog?.title}</DialogTitle>
            <DialogDescription>
              {previewDialog?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <img
                src={previewDialog?.imageUrl}
                alt={previewDialog?.title}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/hero-background.jpg';
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Order: {previewDialog?.order}</div>
              <div>Created: {previewDialog?.createdAt ? new Date(previewDialog.createdAt).toLocaleString() : '—'}</div>
              <div>Updated: {previewDialog?.updatedAt ? new Date(previewDialog.updatedAt).toLocaleString() : '—'}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gallery Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{confirmDialog?.title}"? This action cannot be undone and will permanently remove the item from the gallery.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              No, Keep It
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
