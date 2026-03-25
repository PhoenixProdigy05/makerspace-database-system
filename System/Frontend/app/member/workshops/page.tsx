'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';

interface Workshop {
  workshopId?: string;
  id?: string;
  title: string;
  instructor?: string;
  date?: string;
  capacity?: number;
  status?: string;
}

export default function MemberWorkshopsPage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registerDialog, setRegisterDialog] = useState<{ workshopId: string; title: string } | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getWorkshops();
        setWorkshops(data as Workshop[]);
        
        // Load user registrations after getting workshops
        try {
          const currentUser = await apiClient.getCurrentUser();
          const registrationPromises = data.map(async (workshop: Workshop) => {
            try {
              const registrations = await apiClient.getWorkshopRegistrations(workshop.workshopId || workshop.id || '');
              const userRegistration = registrations.find((reg: any) => 
                reg.memberId === currentUser.id || reg.memberId === currentUser.userId || reg.memberId === currentUser._id
              );
              return { workshopId: workshop.workshopId || workshop.id || '', isRegistered: !!userRegistration };
            } catch {
              return { workshopId: workshop.workshopId || workshop.id || '', isRegistered: false };
            }
          });
          
          const registrationResults = await Promise.all(registrationPromises);
          const registeredWorkshopIds = new Set(
            registrationResults
              .filter(result => result.isRegistered)
              .map(result => result.workshopId)
          );
          
          setUserRegistrations(registeredWorkshopIds);
        } catch (error) {
          console.error('Failed to load user registrations:', error);
          setUserRegistrations(new Set());
        }
        
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Failed to load workshops');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Check for auto-registration from URL parameters
  useEffect(() => {
    if (!loading && workshops.length > 0) {
      // Parse URL parameters from window.location
      const urlParams = new URLSearchParams(window.location.search);
      const registerParam = urlParams.get('register');
      const titleParam = urlParams.get('title');
      
      if (registerParam && titleParam) {
        // Find the workshop to ensure it exists
        const workshop = workshops.find(w => 
          (w.workshopId || w.id) === registerParam || w.title === decodeURIComponent(titleParam)
        );
        
        if (workshop) {
          const workshopId = workshop.workshopId || workshop.id || registerParam;
          setRegisterDialog({ workshopId, title: decodeURIComponent(titleParam) });
        }
      }
    }
  }, [loading, workshops]);

  // Handle workshop registration
  const handleRegister = (workshopId: string, workshopTitle: string) => {
    setRegisterDialog({ workshopId, title: workshopTitle });
  };

  // Handle workshop deregistration
  const handleDeregister = async (workshopId: string, workshopTitle: string) => {
    if (!user) return;
    
    try {
      let userId = user.id || user.userId || user._id;
      if (!userId) {
        const currentUser = await apiClient.getCurrentUser();
        userId = currentUser.id || currentUser.userId || currentUser._id;
      }
      
      if (!userId) {
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: 'Unable to determine user identifier.' 
        });
        return;
      }
      
      await apiClient.removeWorkshopRegistration(workshopId, userId);
      
      // Remove workshop from user's registrations set
      setUserRegistrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(workshopId);
        return newSet;
      });
      
      toast({ 
        variant: 'success', 
        title: 'Registration cancelled', 
        description: `You have cancelled your registration for "${workshopTitle}"` 
      });
    } catch (error: any) {
      console.error('Deregistration failed:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Cancellation failed', 
        description: error?.message || 'Failed to cancel registration. Please try again.' 
      });
    }
  };

  const submitRegistration = async () => {
    if (!registerDialog || !user) return;

    // Check if already registered
    if (userRegistrations.has(registerDialog.workshopId)) {
      toast({ 
        variant: 'destructive', 
        title: 'Already registered', 
        description: 'You are already registered for this workshop.' 
      });
      return;
    }

    setRegistering(true);
    try {
      let userId = user.id || user.userId || user._id;
      console.log('User object:', user);
      console.log('Initial extracted userId:', userId);
      
      // If no ID found, try to get current user from API
      if (!userId) {
        console.log('No user ID found, fetching current user from API...');
        try {
          const currentUser = await apiClient.getCurrentUser();
          console.log('Current user from API:', currentUser);
          userId = currentUser.id || currentUser.userId || currentUser._id;
          
          if (!userId) {
            // Last resort: use email as identifier (some APIs accept this)
            userId = user.email;
            console.log('Using email as fallback identifier:', userId);
          }
        } catch (apiError) {
          console.error('Failed to fetch current user from API:', apiError);
          // Last resort: use email as identifier
          userId = user.email;
          console.log('Using email as fallback identifier after API error:', userId);
        }
      }
      
      if (!userId) {
        throw new Error('Unable to determine user identifier. Please log out and log back in.');
      }

      console.log('Final userId for registration:', userId);
      console.log('Registering for workshop:', registerDialog.workshopId);
      console.log('Registration payload:', { memberId: userId });
      
      const result = await apiClient.addWorkshopRegistration(registerDialog.workshopId, userId);
      console.log('Registration API response:', result);

      // Add workshop to user's registrations set
      setUserRegistrations(prev => new Set([...prev, registerDialog.workshopId]));

      toast({ variant: 'success', title: 'Registration successful!', description: `You have been registered for "${registerDialog.title}"` });
      setRegisterDialog(null);
    } catch (error: any) {
      console.error('Registration failed:', error);
      console.error('Error details:', {
        message: error?.message || 'No message',
        status: error?.status || 'No status',
        stack: error?.stack || 'No stack',
        fullError: error
      });
      
      // More specific error messages
      let errorMessage = error?.message || 'An error occurred while registering for the workshop. Please try again.';
      if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.status === 403) {
        errorMessage = 'You do not have permission to register for this workshop.';
      } else if (error?.status === 404) {
        errorMessage = 'Workshop not found or registration endpoint not available.';
      } else if (error?.status === 500) {
        errorMessage = 'Server error. Please contact support.';
      }
      
      toast({ 
        variant: 'destructive', 
        title: 'Registration failed', 
        description: errorMessage
      });
    } finally {
      setRegistering(false);
    }
  };

  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const upcoming: Workshop[] = [];
    const past: Workshop[] = [];

    (workshops || []).forEach((w) => {
      if (!w.date) {
        upcoming.push(w);
        return;
      }
      const d = new Date(w.date);
      if (d >= now) upcoming.push(w);
      else past.push(w);
    });

    upcoming.sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
    past.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

    return { upcoming, past };
  }, [workshops, now]);

  const statusBadgeClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
    const s = status.toUpperCase();
    if (s === 'SCHEDULED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100';
    if (s === 'CANCELLED') return 'bg-destructive/10 text-destructive';
    if (s === 'COMPLETED') return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-sm text-muted-foreground">Loading workshops…</div>
        )}

        {!loading && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming workshops / events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 && (
                  <div className="text-xs text-muted-foreground">No upcoming workshops.</div>
                )}
                {upcoming.map((w) => {
                  const workshopId = w.workshopId || w.id || '';
                  const isRegistered = userRegistrations.has(workshopId);
                  const isDisabled = w.status === 'COMPLETED' || w.status === 'CANCELLED';
                  
                  return (
                    <div
                      key={workshopId || w.title}
                      className="rounded-md border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{w.title}</span>
                        {w.date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(w.date).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{w.instructor}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${statusBadgeClass(w.status)}`}
                        >
                          {w.status || 'Scheduled'}
                        </span>
                      </div>
                      {typeof w.capacity === 'number' && (
                        <div className="text-xs text-muted-foreground">
                          Capacity: <span className="text-foreground">{w.capacity}</span>
                        </div>
                      )}
                      {isRegistered ? (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDeregister(workshopId, w.title)}
                          disabled={isDisabled}
                          variant="outline"
                        >
                          {isDisabled ? 'Not Available' : 'Cancel Registration'}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleRegister(workshopId, w.title)}
                          disabled={isDisabled}
                        >
                          {isDisabled ? 'Not Available' : 'Register'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Past workshops</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {past.length === 0 && (
                  <div className="text-xs text-muted-foreground">No past workshops.</div>
                )}
                {past.map((w) => (
                  <div
                    key={w.workshopId || w.id || w.title}
                    className="rounded-md border p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{w.title}</span>
                      {w.date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(w.date).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{w.instructor}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${statusBadgeClass(w.status)}`}
                      >
                        {w.status || 'Completed'}
                      </span>
                    </div>
                    {typeof w.capacity === 'number' && (
                      <div className="text-xs text-muted-foreground">
                        Capacity: <span className="text-foreground">{w.capacity}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog open={!!registerDialog} onOpenChange={(open) => !open && setRegisterDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Workshop</DialogTitle>
            <DialogDescription>
              Register for "{registerDialog?.title}" as {user?.fullName || user?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              You are registering as: <strong>{user?.fullName || user?.email}</strong>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRegisterDialog(null)} disabled={registering}>
              Cancel
            </Button>
            <Button onClick={submitRegistration} disabled={registering}>
              {registering ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

