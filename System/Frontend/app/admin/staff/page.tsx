'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, UserX, MapPin, Calendar, Filter, Download, Search, Activity, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Staff {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  staffType?: string;
  createdAt: string;
  updatedAt: string;
  assignedArea?: string;
  status?: 'Active' | 'On Leave' | 'Archived';
  lastActivity?: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [activityStaffFilter, setActivityStaffFilter] = useState('all');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [addStaffForm, setAddStaffForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'Technician',
    assignedArea: 'Laser Lab',
  });
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // Fetch staff from backend
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const users = await apiClient.getUsers();
        // Filter for staff roles and transform data
        const transformedStaff: Staff[] = users
          .filter((user: any) => user.role === 'Staff' || user.role === 'Admin')
          .map((user: any) => ({
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            staffType: user.staffType,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            assignedArea: user.assignedArea || 'General',
            status: 'Active',
            lastActivity: user.updatedAt
          }));
        setStaff(transformedStaff);

        // Also fetch members (non-staff users)
        const transformedMembers = users
          .filter((user: any) => user.role === 'Member')
          .map((user: any) => ({
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt
          }));
        setMembers(transformedMembers);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Mock activity logs for now - would come from backend
  useEffect(() => {
    const initialLogs = [
      {
        id: '1',
        staffName: 'System Admin',
        action: 'System Startup',
        target: 'Admin Dashboard',
        timestamp: new Date().toLocaleString(),
        details: 'Staff management system initialized',
        type: 'system'
      }
    ];
    setActivityLogs(initialLogs);
  }, []);

  // Function to add new activity logs
  const addActivityLog = (staffName: string, action: string, target: string, details: string, type: string = 'action') => {
    const newLog = {
      id: Date.now().toString(),
      staffName,
      action,
      target,
      timestamp: new Date().toLocaleString(),
      details,
      type
    };
    
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep only last 50 logs
  };

  // Function to handle member selection
  const handleMemberSelect = (member: any) => {
    setAddStaffForm({
      fullName: member.fullName,
      email: member.email,
      phoneNumber: member.phoneNumber || '',
      role: 'Technician',
      assignedArea: 'Laser Lab',
    });
    setShowMemberSearch(false);
    setMemberSearchTerm('');
  };

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Enhanced staff management functions with activity logging
  const handleAddStaffWithLogging = async () => {
    if (!addStaffForm.fullName.trim() || !addStaffForm.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsAddingStaff(true);
    try {
      // Check if this is an existing member being converted to staff
      const existingMember = members.find(member => 
        member.email === addStaffForm.email || member.fullName === addStaffForm.fullName
      );

      if (existingMember) {
        // Update existing member to staff role
        await apiClient.updateUser(existingMember.userId, {
          role: 'Staff',
          staffType: addStaffForm.role,
          assignedArea: addStaffForm.assignedArea,
        });

        // Log the conversion
        addActivityLog(
          'Current Admin',
          'Converted Member to Staff',
          addStaffForm.fullName,
          `Role: ${addStaffForm.role}, Area: ${addStaffForm.assignedArea}`,
          'update'
        );
      } else {
        // Create new staff member
        await apiClient.createUser({
          fullName: addStaffForm.fullName,
          email: addStaffForm.email,
          phoneNumber: addStaffForm.phoneNumber || undefined,
          role: 'Staff',
          staffType: addStaffForm.role,
          assignedArea: addStaffForm.assignedArea,
          password: 'defaultPassword123',
        });

        // Log the creation
        addActivityLog(
          'Current Admin',
          'Added Staff Member',
          addStaffForm.fullName,
          `Role: ${addStaffForm.role}, Area: ${addStaffForm.assignedArea}`,
          'create'
        );
      }

      // Reset form and close dialog
      setAddStaffForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'Technician',
        assignedArea: 'Laser Lab',
      });
      setShowMemberSearch(false);
      setMemberSearchTerm('');
      setIsAddDialogOpen(false);

      // Refresh staff and members list
      const users = await apiClient.getUsers();
      const transformedStaff: Staff[] = users
        .filter((user: any) => user.role === 'Staff' || user.role === 'Admin')
        .map((user: any) => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          staffType: user.staffType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          assignedArea: user.assignedArea || 'General',
          status: 'Active',
          lastActivity: user.updatedAt
        }));
      setStaff(transformedStaff);

      const transformedMembers = users
        .filter((user: any) => user.role === 'Member')
        .map((user: any) => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          createdAt: user.createdAt
        }));
      setMembers(transformedMembers);

    } catch (error: any) {
      console.error('Failed to add staff:', error);
      addActivityLog(
        'System Error',
        'Failed to Add Staff',
        addStaffForm.fullName,
        `Error: ${error.message || 'Unknown error'}`,
        'error'
      );
      alert(`Failed to add staff: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAddingStaff(false);
    }
  };

  // Get appropriate icon and color for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'system':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800">Created</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      case 'view':
        return <Badge className="bg-gray-100 text-gray-800">Viewed</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'system':
        return <Badge className="bg-purple-100 text-purple-800">System</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Activity</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'On Leave':
        return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Archived':
        return <Badge className="bg-gray-100 text-gray-800"><UserX className="w-3 h-3 mr-1" />{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleAddStaff = async () => {
    if (!addStaffForm.fullName.trim() || !addStaffForm.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsAddingStaff(true);
    try {
      await apiClient.createUser({
        fullName: addStaffForm.fullName,
        email: addStaffForm.email,
        phoneNumber: addStaffForm.phoneNumber || undefined,
        role: 'Staff', // All staff added through this form should have role 'Staff'
        staffType: addStaffForm.role, // Role dropdown (Technician, Manager, etc.) maps to staffType
        assignedArea: addStaffForm.assignedArea, // Assigned Area dropdown maps to assignedArea
        password: 'defaultPassword123', // TODO: Implement proper password generation
      });

      // Reset form and close dialog
      setAddStaffForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'Technician',
        assignedArea: 'Laser Lab',
      });
      setIsAddDialogOpen(false);

      // Refresh staff list
      const users = await apiClient.getUsers();
      const transformedStaff: Staff[] = users
        .filter((user: any) => user.role === 'Staff' || user.role === 'Admin')
        .map((user: any) => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          staffType: user.staffType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          assignedArea: user.assignedArea || 'General',
          status: 'Active',
          lastActivity: user.updatedAt
        }));
      setStaff(transformedStaff);
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      alert(`Failed to add staff: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleArchiveStaff = async (userId: string) => {
    try {
      await apiClient.deleteUser(userId);
      setStaff(prev => prev.filter(s => s.userId !== userId));
    } catch (error) {
      console.error('Failed to archive staff:', error);
    }
  };

  const handleArchiveStaffWithLogging = async (userId: string) => {
    const staffToArchive = staff.find(s => s.userId === userId);
    
    try {
      await apiClient.deleteUser(userId);
      
      // Log archive action
      addActivityLog(
        'Current Admin',
        'Archived Staff Member',
        staffToArchive?.fullName || 'Unknown Staff',
        `Staff member removed from active list`,
        'delete'
      );
      
      setStaff(prev => prev.filter(s => s.userId !== userId));
      
      // Clear selection if archived staff was selected
      if (selectedStaff?.userId === userId) {
        setSelectedStaff(null);
      }
    } catch (error: any) {
      console.error('Failed to archive staff:', error);
      addActivityLog(
        'System Error',
        'Failed to Archive Staff',
        staffToArchive?.fullName || 'Unknown Staff',
        `Error: ${error.message || 'Unknown error'}`,
        'error'
      );
    }
  };

  // Simple staff selection without logging
  const handleStaffSelection = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff Management</h1>
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          Add Staff
        </button>
      </div>

      {/* Dialog moved outside the flex container */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Member Search Section */}
              <div>
                <Label className="text-sm font-medium">Search Existing Members (Optional)</Label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={memberSearchTerm}
                    onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setShowMemberSearch(e.target.value.trim() !== '');
                    }}
                    className="pl-10"
                  />
                </div>
                
                {showMemberSearch && filteredMembers.length > 0 && (
                  <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => handleMemberSelect(member)}
                      >
                        <div className="font-medium text-sm">{member.fullName}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                        {member.phoneNumber && (
                          <div className="text-xs text-muted-foreground">{member.phoneNumber}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={addStaffForm.fullName}
                  onChange={(e) => setAddStaffForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={addStaffForm.email}
                  onChange={(e) => setAddStaffForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  value={addStaffForm.phoneNumber}
                  onChange={(e) => setAddStaffForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={addStaffForm.role} onValueChange={(value) => setAddStaffForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assignedArea">Assigned Area</Label>
                <Select value={addStaffForm.assignedArea} onValueChange={(value) => setAddStaffForm(prev => ({ ...prev, assignedArea: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assigned area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laser Lab">Laser Lab</SelectItem>
                    <SelectItem value="Electronics Lab">Electronics Lab</SelectItem>
                    <SelectItem value="3D Printing">3D Printing</SelectItem>
                    <SelectItem value="Woodshop">Woodshop</SelectItem>
                    <SelectItem value="Metalshop">Metalshop</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button 
                  onClick={handleAddStaffWithLogging} 
                  disabled={isAddingStaff}
                  className="w-full sm:w-auto"
                >
                  {isAddingStaff ? 'Adding...' : 'Add Staff'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setMemberSearchTerm('');
                    setShowMemberSearch(false);
                    setAddStaffForm({
                      fullName: '',
                      email: '',
                      phoneNumber: '',
                      role: 'Technician',
                      assignedArea: 'Laser Lab',
                    });
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Other action buttons can be added here */}
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff members found. Click "Add Staff" to add your first staff member.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search staff by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Area</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff
                    .filter(staffMember => 
                      searchTerm === '' || 
                      staffMember.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (staffMember.phoneNumber && staffMember.phoneNumber.includes(searchTerm))
                    )
                    .map((staffMember) => (
                    <TableRow 
                      key={staffMember.userId}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedStaff?.userId === staffMember.userId ? 'bg-blue-50' : ''}`}
                      onClick={() => handleStaffSelection(staffMember)}
                    >
                      <TableCell className="font-medium">{staffMember.fullName}</TableCell>
                      <TableCell>{staffMember.email}</TableCell>
                      <TableCell>{staffMember.phoneNumber || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{staffMember.staffType || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {staffMember.assignedArea || '—'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(staffMember.status || 'Active')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Activity Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="activity-search">Search Activities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="activity-search"
                      placeholder="Search by staff name, action, or details..."
                      value={activitySearchTerm}
                      onChange={(e) => setActivitySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="create">Created</SelectItem>
                      <SelectItem value="update">Updated</SelectItem>
                      <SelectItem value="delete">Deleted</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activity-staff">Staff Member</Label>
                  <Select value={activityStaffFilter} onValueChange={setActivityStaffFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      {staff.map((staffMember) => (
                        <SelectItem key={staffMember.userId} value={staffMember.userId}>
                          {staffMember.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtered Activity Logs */}
              {activityLogs
                .filter((log) => {
                  // Search filter
                  const matchesSearch = activitySearchTerm === '' || 
                    log.staffName.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                    log.action.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                    log.target.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                    (log.details && log.details.toLowerCase().includes(activitySearchTerm.toLowerCase()));
                  
                  // Type filter
                  const matchesType = activityTypeFilter === 'all' || log.type === activityTypeFilter;
                  
                  // Staff filter
                  const matchesStaff = activityStaffFilter === 'all' || log.staffName === staff.find(s => s.userId === activityStaffFilter)?.fullName;
                  
                  return matchesSearch && matchesType && matchesStaff;
                })
                .map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {getActivityIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{log.staffName}</span>
                      {getActivityBadge(log.type)}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{log.action}</span> on <span className="text-blue-600">{log.target}</span>
                    </div>
                    {log.details && (
                      <div className="text-xs text-gray-500 mb-1">
                        {log.details}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {log.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
