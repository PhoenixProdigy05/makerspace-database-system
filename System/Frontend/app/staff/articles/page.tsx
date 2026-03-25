'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StaffArticlesPage() {
  const useMock = false; // Temporarily enable mock to test form functionality
  const mockArticles = useMemo(() => ([
    { articleId: 'a-1001', title: 'Laser Cutter 101', author: 'Alex', imageUrl: '', content: '<h3>Laser Cutter Basics</h3><p>Learn the fundamentals of laser cutting...</p>', tags: 'laser,intro', status: 'DRAFT', publishedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { articleId: 'a-1002', title: '3D Printing Tips', author: 'Sam', imageUrl: '', content: '<h3>PLA vs ABS</h3><p>Understanding the differences between PLA and ABS filaments...</p>', tags: '3d,print', status: 'PUBLISHED', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]), []);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'delete'; articleId: string; title: string } | null>(null);

  // Simple formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
  };

  // Save articles to localStorage whenever they change
  useEffect(() => {
    if (!useMock && articles.length > 0) {
      localStorage.setItem('articles-cache', JSON.stringify(articles));
    }
  }, [articles, useMock]);

  // Load articles from localStorage as fallback
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem('articles-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('Loaded articles from cache:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load from cache:', e);
    }
    return null;
  };

  useEffect(() => {
    const load = async () => {
      if (useMock) {
        setArticles(mockArticles);
        return;
      }
      try {
        // Fetch current user info
        try {
          const user = await apiClient.getCurrentUser();
          setCurrentUser(user);
        } catch (userError) {
          console.log('Could not fetch current user, using fallback');
        }
        
        const data = await apiClient.getArticles();
        console.log('Articles loaded successfully:', data);
        setArticles(data);
      } catch (e: any) {
        console.error('Failed to load articles:', e);
        
        // Try to load from cache first
        const cachedArticles = loadFromCache();
        if (cachedArticles && cachedArticles.length > 0) {
          console.log('Using cached articles as fallback');
          setArticles(cachedArticles);
          toast({ 
            variant: 'default', 
            title: 'Using cached articles', 
            description: 'Failed to load from server, using cached data.' 
          });
        } else if (articles.length === 0) {
          // Only fall back to mock data if we have no other options
          console.log('No articles in state or cache, falling back to mock data');
          setArticles(mockArticles);
          toast({ 
            variant: 'destructive', 
            title: 'Failed to load articles', 
            description: 'Using mock data instead. Check console for details.' 
          });
        } else {
          // Keep existing articles if API fails but we have some in state
          toast({ 
            variant: 'destructive', 
            title: 'Failed to refresh articles', 
            description: 'Keeping existing articles. Check console for details.' 
          });
        }
      }
    };
    load();
  }, [mockArticles, useMock]); // Add useMock to dependencies

  const onCreate = () => {
    setForm({ title: '', image: '', content: '', tags: '' });
    setEditingId(null);
    setOpen(true);
  };

  const onEdit = (article: any) => {
    setForm({
      title: article.title || '',
      image: article.imageUrl || '',
      content: article.content || '',
      tags: article.tags || ''
    });
    setEditingId(article.articleId);
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Save button clicked, form data:', form);
    
    if (!form.title.trim()) {
      toast({ variant: 'destructive', title: 'Validation error', description: 'Title is required.' });
      return;
    }
    
    setSaving(true);
    try {
      const authorName = currentUser?.fullName || currentUser?.name || 'Unknown User';
      
      if (useMock) {
        console.log('Using mock mode to create article');
        const newItem = {
          articleId: `a-${Math.random().toString(36).slice(2, 8)}`,
          title: form.title,
          author: authorName,
          imageUrl: form.image,
          content: form.content,
          tags: form.tags,
          status: 'DRAFT',
          publishedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        if (editingId) {
          // Update existing article
          setArticles((prev) => prev.map((a) => a.articleId === editingId ? { ...newItem, articleId: editingId } : a));
          toast({ variant: 'success', title: 'Article updated (mock)', description: 'Mock article was updated successfully' });
          console.log('Mock article updated:', newItem);
        } else {
          // Create new article
          setArticles((prev) => [newItem, ...prev]);
          toast({ variant: 'success', title: 'Article created (mock)', description: 'Mock article was created successfully' });
          console.log('Mock article created:', newItem);
        }
      } else {
        console.log('Using API to save article');
        const articleData = { 
          title: form.title, 
          author: authorName,
          imageUrl: form.image, 
          content: form.content, 
          tags: form.tags 
        };
        console.log('Sending to API:', articleData);
        
        let savedArticle;
        if (editingId) {
          // Update existing article
          savedArticle = await apiClient.updateArticle(editingId, articleData);
          console.log('Article updated successfully:', savedArticle);
          toast({ variant: 'success', title: 'Article updated successfully' });
        } else {
          // Create new article
          savedArticle = await apiClient.createArticle(articleData);
          console.log('Article created successfully:', savedArticle);
          toast({ variant: 'success', title: 'Article created successfully' });
        }
        
        // Try to refresh the list, but don't fail if it doesn't work
        try {
          const data = await apiClient.getArticles();
          setArticles(data);
          console.log('Articles refreshed successfully:', data);
        } catch (refreshError) {
          console.error('Failed to refresh articles after save:', refreshError);
          // If refresh fails, add/update the article in the existing list
          if (savedArticle) {
            if (editingId) {
              setArticles((prev) => prev.map((a) => a.articleId === editingId ? savedArticle : a));
            } else {
              setArticles((prev) => [savedArticle, ...prev]);
            }
            toast({ 
              variant: 'default', 
              title: editingId ? 'Article updated' : 'Article created', 
              description: 'Article was saved but list refresh failed.' 
            });
          }
        }
      }
      setOpen(false);
      setEditingId(null);
      // Reset form
      setForm({ title: '', image: '', content: '', tags: '' });
    } catch (error: any) {
      console.error('Failed to save article:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to create article', 
        description: error?.message || 'An error occurred while creating the article.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select an article first' });
      return;
    }
    try {
      if (useMock) {
        setArticles((prev) => prev.map((a) => a.articleId === selectedId ? { ...a, status: a.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED', publishedAt: a.status === 'PUBLISHED' ? null : new Date().toISOString() } : a));
        toast({ variant: 'success', title: 'Publish toggled (mock)' });
      } else {
        const current = articles.find((a) => a.articleId === selectedId);
        if (current?.status === 'PUBLISHED') {
          await apiClient.unpublishArticle(selectedId);
        } else {
          await apiClient.publishArticle(selectedId);
        }
        const data = await apiClient.getArticles();
        setArticles(data);
        toast({ variant: 'success', title: 'Publish state updated' });
      }
    } catch (error: any) {
      console.error('Failed to update publish state:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to update publish state', 
        description: error?.message || 'An error occurred while updating the article.' 
      });
    }
  };

  const remove = async () => {
    if (!selectedId) {
      toast({ variant: 'destructive', title: 'Select an article first' });
      return;
    }
    
    const selectedArticle = articles.find(a => a.articleId === selectedId);
    if (!selectedArticle) return;

    setConfirmDialog({
      type: 'delete',
      articleId: selectedId,
      title: selectedArticle.title
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog) return;

    try {
      if (useMock) {
        setArticles((prev) => prev.filter((a) => a.articleId !== confirmDialog.articleId));
        setSelectedId(null);
        toast({ variant: 'success', title: 'Article deleted (mock)' });
      } else {
        await apiClient.deleteArticle(confirmDialog.articleId);
        const data = await apiClient.getArticles();
        setArticles(data);
        setSelectedId(null);
        toast({ variant: 'success', title: 'Article deleted successfully' });
      }
    } catch (error: any) {
      console.error('Failed to delete article:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to delete article', 
        description: error?.message || 'An error occurred while deleting the article.' 
      });
    } finally {
      setConfirmDialog(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Homepage Content</div>
      <h1 className="text-2xl font-semibold">Articles Management</h1>

      <div className="flex gap-2">
        <Button onClick={onCreate}>Create Article</Button>
        <Button variant="outline" onClick={publish}>Publish / Unpublish</Button>
        <Button variant="destructive" onClick={remove}>Delete</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Articles</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date Published</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-muted-foreground">No articles yet.</TableCell></TableRow>
                ) : (
                  articles.map((a) => (
                    <TableRow key={a.articleId} onClick={() => setSelectedId(a.articleId)} className={selectedId === a.articleId ? 'bg-muted/50' : ''}>
                      <TableCell>{a.articleId}</TableCell>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.author || '—'}</TableCell>
                      <TableCell>{a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '—'}</TableCell>
                      <TableCell>{a.status}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {a.status === 'DRAFT' && (
                          <Button size="sm" variant="outline" onClick={() => onEdit(a)}>
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
        <CardContent>
          {selectedId ? (() => {
            const selectedArticle = articles.find(a => a.articleId === selectedId);
            if (!selectedArticle) {
              return <div className="text-sm text-muted-foreground">Article not found</div>;
            }
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedArticle.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    By {selectedArticle.author || 'Unknown'} • {selectedArticle.status}
                    {selectedArticle.publishedAt && ` • Published ${new Date(selectedArticle.publishedAt).toLocaleDateString()}`}
                  </div>
                </div>
                
                {selectedArticle.imageUrl && (
                  <div>
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-full max-h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none">
                  {selectedArticle.content ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                      className="article-content"
                    />
                  ) : (
                    <p className="text-muted-foreground">No content available</p>
                  )}
                </div>
                
                {selectedArticle.tags && (
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.split(',').map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground border-t pt-2">
                  <div>ID: {selectedArticle.articleId}</div>
                  <div>Created: {new Date(selectedArticle.createdAt).toLocaleString()}</div>
                  {selectedArticle.updatedAt && selectedArticle.updatedAt !== selectedArticle.createdAt && (
                    <div>Updated: {new Date(selectedArticle.updatedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="text-sm text-muted-foreground">Select an article from the table to preview</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => {
        if (!o) {
          setOpen(false);
          setEditingId(null);
          setForm({ title: '', image: '', content: '', tags: '' });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Article' : 'Create Article'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update your article content and settings' : 'Provide article title, image URL, content, and tags'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} disabled={saving} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="content">Content *</Label>
              <div className="border rounded-md">
                {/* Formatting Toolbar */}
                <div className="border-b p-2 flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('bold')}
                    disabled={saving}
                  >
                    <strong>B</strong>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('italic')}
                    disabled={saving}
                  >
                    <em>I</em>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('underline')}
                    disabled={saving}
                  >
                    <u>U</u>
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('insertUnorderedList')}
                    disabled={saving}
                  >
                    • List
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => formatText('insertOrderedList')}
                    disabled={saving}
                  >
                    1. List
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Select onValueChange={(value) => formatText('formatBlock', value)} disabled={saving}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue placeholder="Heading" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1">H1</SelectItem>
                      <SelectItem value="h2">H2</SelectItem>
                      <SelectItem value="h3">H3</SelectItem>
                      <SelectItem value="p">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertHTML('<blockquote class="border-l-4 border-gray-300 pl-4 italic">Quote</blockquote>')}
                    disabled={saving}
                  >
                    Quote
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertHTML('<code class="bg-gray-100 px-1 rounded">Code</code>')}
                    disabled={saving}
                  >
                    {'</>'}
                  </Button>
                </div>
                {/* Content Editor */}
                <div
                  contentEditable
                  className="min-h-[300px] p-4 focus:outline-none"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                  onInput={(e) => setForm({ ...form, content: e.currentTarget.innerHTML })}
                  suppressContentEditableWarning={true}
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} disabled={saving} placeholder="laser, 3d-printing, tutorial (comma-separated)" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{confirmDialog?.title}"? This action cannot be undone and will permanently remove the article and all its data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              No, Keep It
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

