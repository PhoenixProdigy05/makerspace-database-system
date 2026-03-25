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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, TrendingUp, Calendar, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Member {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  staffType?: string;
  createdAt: string;
  updatedAt: string;
  // Additional computed fields
  activeProjects?: number;
  lastActivity?: string;
  membershipStatus?: 'Active' | 'Suspended' | 'Pending Approval';
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [projectParticipation, setProjectParticipation] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    membershipType: 'regular',
    emergencyContact: ''
  });
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [pendingSuspendAction, setPendingSuspendAction] = useState<{ userId: string; action: 'suspend' | 'reactivate' } | null>(null);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const [users, bookings] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getBookings()
        ]);
        
        // Transform backend user data to Member interface
        const transformedMembers: Member[] = users.map((user: any) => {
          // Count active projects for this member
          const activeBookings = bookings.filter((booking: any) => 
            (booking.memberId === user.userId || booking.memberEmail === user.email) &&
            (booking.status === 'APPROVED' || booking.status === 'IN_PROGRESS')
          );
          
          return {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            staffType: user.staffType,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // Real computed fields from backend data
            activeProjects: activeBookings.length,
            lastActivity: user.updatedAt,
            membershipStatus: user.status || 'Active'
          };
        });
        setMembers(transformedMembers);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        // Fallback to empty array or show error message
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Suspended':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Pending Approval':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSuspendReactivate = (userId: string, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'suspend' : 'reactivate';
    setPendingSuspendAction({ userId, action });
    setSuspendConfirmOpen(true);
  };

  const confirmSuspendReactivate = async () => {
    if (!pendingSuspendAction) return;
    
    try {
      const newStatus = pendingSuspendAction.action === 'suspend' ? 'Suspended' : 'Active';
      setMembers(prev => prev.map(m => 
        m.userId === pendingSuspendAction.userId ? { ...m, membershipStatus: newStatus as any } : m
      ));
      
      // TODO: Call API to update backend status
      // await apiClient.updateMemberStatus(pendingSuspendAction.userId, newStatus);
      
    } catch (error) {
      console.error('Failed to update member status:', error);
    } finally {
      setSuspendConfirmOpen(false);
      setPendingSuspendAction(null);
    }
  };

  const handleAddMember = async () => {
    if (!addMemberForm.fullName.trim() || !addMemberForm.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsAddingMember(true);
    try {
      await apiClient.createUser({
        fullName: addMemberForm.fullName,
        email: addMemberForm.email,
        phoneNumber: addMemberForm.phoneNumber,
        role: 'Member',
        password: 'defaultPassword123', // TODO: Implement proper password generation
      });

      // Refresh members list
      const [users, bookings] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getBookings()
      ]);
      
      const transformedMembers: Member[] = users.map((user: any) => {
        const activeBookings = bookings.filter((booking: any) => 
          (booking.memberId === user.userId || booking.memberEmail === user.email) &&
          (booking.status === 'APPROVED' || booking.status === 'IN_PROGRESS')
        );
        
        return {
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          staffType: user.staffType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          activeProjects: activeBookings.length,
          lastActivity: user.updatedAt,
          membershipStatus: user.status || 'Active'
        };
      });
      setMembers(transformedMembers);

      // Reset form and close dialog
      setAddMemberForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        membershipType: 'regular',
        emergencyContact: ''
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to add member:', error);
      alert(`Failed to add member: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleEditMember = async (userId: string, formData: any) => {
    try {
      await apiClient.updateUser(userId, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });
      // Refresh members list
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const loadMemberHistory = async (memberId: string) => {
    setHistoryLoading(true);
    try {
      const [bookings, projects, attendance] = await Promise.all([
        apiClient.getMemberBookingHistory(memberId),
        apiClient.getMemberProjectParticipation(memberId),
        apiClient.getMemberAttendanceRecords(memberId)
      ]);
      setBookingHistory(bookings);
      setProjectParticipation(projects);
      setAttendanceRecords(attendance);
    } catch (error) {
      console.error('Failed to load member history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">Members Management</div>
      <h1 className="text-2xl font-semibold">Members Management</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{members.filter(m => m.membershipStatus === 'Active').length}</p>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{members.filter(m => m.membershipStatus === 'Suspended').length}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{members.reduce((sum, m) => sum + (m.activeProjects || 0), 0)}</p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  placeholder="Enter full name"
                  value={addMemberForm.fullName}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email"
                  value={addMemberForm.email}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number"
                  value={addMemberForm.phoneNumber}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="membershipType">Membership Type</Label>
                <Select value={addMemberForm.membershipType} onValueChange={(value) => setAddMemberForm(prev => ({ ...prev, membershipType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Textarea 
                  id="emergencyContact" 
                  placeholder="Enter emergency contact details"
                  value={addMemberForm.emergencyContact}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddMember} 
                  disabled={isAddingMember}
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!selectedMember}>Edit Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Member Details</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editFullName">Full Name</Label>
                  <Input id="editFullName" defaultValue={selectedMember.fullName} />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email Address</Label>
                  <Input id="editEmail" type="email" defaultValue={selectedMember.email} />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone Number</Label>
                  <Input id="editPhone" defaultValue={selectedMember.phoneNumber} />
                </div>
                <div>
                  <Label htmlFor="editStatus">Membership Status</Label>
                  <Select defaultValue={selectedMember.membershipStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          disabled={!selectedMember}
          onClick={() => selectedMember && handleSuspendReactivate(selectedMember.userId, selectedMember.membershipStatus || 'Active')}
        >
          {selectedMember?.membershipStatus === 'Active' ? 'Suspend Member' : 'Reactivate Member'}
        </Button>
      </div>

      {/* Suspension Confirmation Dialog */}
      <Dialog open={suspendConfirmOpen} onOpenChange={setSuspendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {pendingSuspendAction?.action === 'suspend' ? 'Suspension' : 'Reactivation'}</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to {pendingSuspendAction?.action === 'suspend' ? 'suspend' : 'reactivate'} this member?
            {pendingSuspendAction?.action === 'suspend' && 
              ' This will restrict their access to makerspace facilities and services.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSuspendConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmSuspendReactivate}>
              {pendingSuspendAction?.action === 'suspend' ? 'Suspend' : 'Reactivate'} Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow 
                    key={member.userId}
                    onClick={() => setSelectedMember(member)}
                    className={`cursor-pointer transition-colors ${
                      selectedMember?.userId === member.userId ? 'bg-muted/50' : 'hover:bg-muted/30'
                    }`}
                  >
                    <TableCell className="font-medium">{member.userId.slice(0, 8)}</TableCell>
                    <TableCell>{member.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {member.phoneNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.membershipStatus || 'Active')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.lastActivity ? new Date(member.lastActivity).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                            setIsHistoryDialogOpen(true);
                            await loadMemberHistory(member.userId);
                          }}
                        >
                          History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Member Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2" />
                <p>Member activity chart</p>
                <p className="text-sm">Daily/Weekly/Monthly usage patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Most Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>Leaderboard visualization</p>
                <p className="text-sm">Top members by usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Member Activity History - {selectedMember?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="bookings" className="w-full h-full flex flex-col">
              <TabsList className="flex-shrink-0">
                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                <TabsTrigger value="projects">Project Participation</TabsTrigger>
                <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
              </TabsList>
            <TabsContent value="bookings" className="flex-1 overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>Past Bookings</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  {historyLoading ? (
                    <div className="text-center py-8">Loading booking history...</div>
                  ) : bookingHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No booking history found</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {bookingHistory.map((booking) => (
                        <div key={booking.bookingId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-sm">{booking.projectDescription}</h4>
                              <p className="text-xs text-muted-foreground">Booking ID: {booking.bookingId}</p>
                            </div>
                            <Badge className={
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Start:</span>
                              <span>{new Date(booking.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">End:</span>
                              <span>{new Date(booking.endTime).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Duration:</span>
                              <span>{booking.durationMinutes} min</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Equipment:</span>
                              <span>{booking.equipment}</span>
                            </div>
                          </div>
                          {booking.materials && (
                            <div className="mt-2">
                              <p className="font-medium text-xs">Materials:</p>
                              <p className="text-xs text-muted-foreground">{booking.materials}</p>
                            </div>
                          )}
                          {booking.notes && (
                            <div className="mt-2">
                              <p className="font-medium text-xs">Notes:</p>
                              <p className="text-xs text-muted-foreground">{booking.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="projects" className="flex-1 overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>Project Participation</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  {historyLoading ? (
                    <div className="text-center py-8">Loading project participation...</div>
                  ) : projectParticipation.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No project participation found</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {projectParticipation.map((project) => (
                        <div key={project.projectId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-sm">{project.projectName}</h4>
                              <p className="text-xs text-muted-foreground">Project ID: {project.projectId}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={
                                project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {project.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{project.role}</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{project.description}</p>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Start:</span>
                              <span>{new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">End:</span>
                              <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Hours:</span>
                              <span>{project.hoursSpent} hours</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Skills:</span>
                              <span>{project.skills}</span>
                            </div>
                          </div>
                          {project.outcome && (
                            <div className="mt-2">
                              <p className="font-medium text-xs">Outcome:</p>
                              <p className="text-xs text-muted-foreground">{project.outcome}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance" className="flex-1 overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  {historyLoading ? (
                    <div className="text-center py-8">Loading attendance records...</div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No attendance records found</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {attendanceRecords.map((record) => (
                        <div key={record.recordId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-sm">{record.eventName}</h4>
                              <p className="text-xs text-muted-foreground">Record ID: {record.recordId}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={
                                record.eventType === 'WORKSHOP' ? 'bg-blue-100 text-blue-800' :
                                record.eventType === 'EVENT' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {record.eventType}
                              </Badge>
                              {record.present && (
                                <Badge className="bg-green-100 text-green-800">Present</Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Date:</span>
                              <span>{new Date(record.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Duration:</span>
                              <span>{record.durationMinutes} min</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Check In:</span>
                              <span>{new Date(record.checkInTime).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Check Out:</span>
                              <span>{new Date(record.checkOutTime).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          {record.notes && (
                            <div className="mt-2">
                              <p className="font-medium text-xs">Notes:</p>
                              <p className="text-xs text-muted-foreground">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
