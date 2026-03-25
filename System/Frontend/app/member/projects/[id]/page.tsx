'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AttachmentUpload } from '@/components/AttachmentUpload';
import { AttachmentList } from '@/components/AttachmentList';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { ArrowLeft, Plus, Trash2, Settings, Package } from 'lucide-react';

interface ProjectTask {
  taskId: string;
  description: string;
  isCompleted: boolean;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Attachment {
  attachmentId: string;
  filename: string;
  fileUrl: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface InventoryItem {
  itemId: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  status?: string;
  description?: string;
}

interface ProjectWorkspace {
  bookingId: string;
  tools: string;
  materials: string;
  durationMinutes: number;
  appointmentTime?: string;
  appointmentType?: string;
  notes?: string;
  status: string;
  progress: number;
  projectDescription?: string;
  createdAt?: string;
  userId: string;
  memberName?: string;
  memberEmail?: string;
  tasks: ProjectTask[];
  attachments: Attachment[];
  machine?: InventoryItem;
  completedTasksCount: number;
  totalTasksCount: number;
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProjectWorkspace(bookingId);
        setWorkspace(data);
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Failed to load project workspace');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadWorkspace();
    }
  }, [bookingId]);

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      await apiClient.updateProjectTaskStatus(taskId, isCompleted);
      // Refresh workspace data
      const data = await apiClient.getProjectWorkspace(bookingId);
      setWorkspace(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteProjectTask(taskId);
      // Refresh workspace data
      const data = await apiClient.getProjectWorkspace(bookingId);
      setWorkspace(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete task');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) return;

    try {
      setAddingTask(true);
      const orderIndex = workspace?.tasks.length || 0;
      await apiClient.createProjectTask(bookingId, newTaskDescription.trim(), orderIndex);
      setNewTaskDescription('');
      // Refresh workspace data
      const data = await apiClient.getProjectWorkspace(bookingId);
      setWorkspace(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100';
      case 'OVERDUE': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100';
      case 'CANCELLED':
      case 'REJECTED': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'In Review';
      case 'APPROVED': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'OVERDUE': return 'Overdue';
      case 'CANCELLED': return 'Cancelled';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-muted-foreground">Loading project workspace...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !workspace) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error || 'Project not found'}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/member/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{workspace.projectDescription || 'Untitled Project'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{workspace.projectDescription || 'Untitled Project'}</h1>
              <p className="text-muted-foreground mt-1">
                Booking #{workspace.bookingId.slice(0, 8)} • {workspace.appointmentType}
              </p>
            </div>
            <Badge className={getStatusColor(workspace.status)}>
              {getStatusLabel(workspace.status)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Project Progress</span>
                  <span>{workspace.progress}%</span>
                </div>
                <Progress value={workspace.progress} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {workspace.completedTasksCount} of {workspace.totalTasksCount} tasks completed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks and Attachments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Project Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Task Form */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new task..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddTask} 
                    disabled={!newTaskDescription.trim() || addingTask}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {workspace.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks yet. Add your first task to get started!
                    </p>
                  ) : (
                    workspace.tasks.map((task) => (
                      <div key={task.taskId} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Checkbox
                          checked={task.isCompleted}
                          onCheckedChange={(checked) => handleTaskToggle(task.taskId, checked as boolean)}
                        />
                        <span className={`flex-1 ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {task.description}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.taskId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AttachmentUpload
                  ownerTable="bookings"
                  ownerId={bookingId}
                  onUploadSuccess={() => {
                    // Refresh workspace data
                    apiClient.getProjectWorkspace(bookingId).then(setWorkspace);
                  }}
                />
                <AttachmentList
                  attachments={workspace.attachments}
                  onAttachmentDelete={() => {
                    // Refresh workspace data
                    apiClient.getProjectWorkspace(bookingId).then(setWorkspace);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Machine Status and Materials */}
          <div className="space-y-6">
            {/* Machine Status */}
            {workspace.machine && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Machine Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Machine</Label>
                    <p className="text-sm">{workspace.machine.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm">{workspace.machine.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm">{workspace.machine.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={workspace.machine.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                      {workspace.machine.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Material List */}
            <Card>
              <CardHeader>
                <CardTitle>Material List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Materials</Label>
                  <p className="text-sm whitespace-pre-line">{workspace.materials}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tools Required</Label>
                  <p className="text-sm whitespace-pre-line">{workspace.tools}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{workspace.durationMinutes} minutes</p>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            {workspace.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">{workspace.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
