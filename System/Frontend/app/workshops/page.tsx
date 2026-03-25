'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api-client';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerDialog, setRegisterDialog] = useState<{ workshopId: string; title: string } | null>(null);
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '' });
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getWorkshops();
        // Filter for scheduled workshops (similar to published articles)
        const scheduledWorkshops = data.filter((workshop: any) => 
          workshop.status === 'SCHEDULED' || workshop.status === 'AVAILABLE'
        );
        setWorkshops(scheduledWorkshops);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch workshops:', err);
        setError('Failed to load workshops');
        // Fallback to mock data if API fails
        setWorkshops([
          {
            id: 1,
            title: '3D Printing Basics',
            description: 'Learn the fundamentals of 3D printing and design',
            date: 'Upcoming',
            duration: '2 hours',
          },
          {
            id: 2,
            title: 'Electronics Workshop',
            description: 'Introduction to electronics and circuit design',
            date: 'Upcoming',
            duration: '3 hours',
          },
          {
            id: 3,
            title: 'Woodworking Fundamentals',
            description: 'Master basic woodworking techniques and safety',
            date: 'Upcoming',
            duration: '4 hours',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Upcoming';
    }
  };

  // Calculate duration if not provided
  const getDuration = (workshop: any) => {
    if (workshop.duration) return workshop.duration;
    // You could calculate duration from start/end times if available
    return '2 hours';
  };

  // Handle workshop registration
  const handleRegister = (workshopId: string, workshopTitle: string) => {
    setRegisterDialog({ workshopId, title: workshopTitle });
  };

  const submitRegistration = async () => {
    if (!registerDialog) return;
    
    if (!registrationForm.name.trim() || !registrationForm.email.trim()) {
      toast({ variant: 'destructive', title: 'Please fill in all fields' });
      return;
    }

    setRegistering(true);
    try {
      let userId: string;
      
      // First, try to find existing user by email
      try {
        const users = await apiClient.getUsers();
        const existingUser = users.find((user: any) => 
          user.email?.toLowerCase() === registrationForm.email.toLowerCase()
        );
        
        if (existingUser) {
          userId = existingUser.id || existingUser.userId;
          console.log('Found existing user:', userId);
        } else {
          // Create new user account
          const tempPassword = Math.random().toString(36).slice(-8);
          console.log('Creating new user for:', registrationForm.email);
          
          const userResponse = await apiClient.createUser({
            fullName: registrationForm.name,
            email: registrationForm.email,
            password: tempPassword,
            role: 'MEMBER'
          }) as any;
          
          userId = userResponse.id || userResponse.userId || userResponse._id;
          console.log('Created new user:', userId);
          
          toast({ 
            variant: 'success', 
            title: 'Account created!', 
            description: `An account has been created for ${registrationForm.email}. You can log in with your email and the temporary password sent to you.` 
          });
        }
      } catch (userError: any) {
        console.error('User creation/lookup failed:', userError);
        throw new Error(`Failed to create or find user account: ${userError?.message || 'Unknown error'}`);
      }

      if (!userId) {
        throw new Error('Could not obtain valid user ID');
      }

      // Now register for the workshop using the userId
      console.log('Registering user', userId, 'for workshop', registerDialog.workshopId);
      await apiClient.addWorkshopRegistration(registerDialog.workshopId, userId);

      toast({ variant: 'success', title: 'Registration successful!', description: `You have been registered for "${registerDialog.title}"` });
      setRegistrationForm({ name: '', email: '' });
      setRegisterDialog(null);
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Registration failed', 
        description: error?.message || 'An error occurred while registering for the workshop. Please try again.' 
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero-background.jpg")',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <main className="relative z-10 container mx-auto flex-1 p-8 space-y-6">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Workshops & Trainings</CardTitle>
                <CardDescription className="text-gray-200">Loading workshops...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (error && workshops.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero-background.jpg")',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <main className="relative z-10 container mx-auto flex-1 p-8 space-y-6">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Workshops & Trainings</CardTitle>
                <CardDescription className="text-gray-200">Join our workshops to learn new skills and techniques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-300">Unable to load workshops at this time.</p>
                  <p className="text-sm text-gray-400 mt-2">Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero-background.jpg")',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <main className="relative z-10 container mx-auto flex-1 p-8 space-y-6">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Workshops & Trainings</CardTitle>
                <CardDescription className="text-gray-200">
                  Join our workshops to learn new skills and techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workshops.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300">No workshops scheduled at this time.</p>
                    <p className="text-sm text-gray-400 mt-2">Check back soon for upcoming workshops!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {workshops.map((workshop) => (
                      <Card key={workshop.workshopId || workshop.id} className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white">{workshop.title}</CardTitle>
                          <CardDescription className="text-gray-200">
                            {workshop.description || `Learn ${workshop.title.toLowerCase()} with expert guidance`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-300">
                            Instructor: {workshop.instructor || 'TBD'}
                          </p>
                          <p className="text-sm text-gray-300">
                            Duration: {getDuration(workshop)}
                          </p>
                          <p className="text-sm text-gray-300">
                            Date: {formatDate(workshop.date)}
                          </p>
                          {workshop.capacity && (
                            <p className="text-sm text-gray-300">
                              Capacity: {workshop.capacity} participants
                            </p>
                          )}
                          <Button 
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                            onClick={() => {
                              // Redirect to member workshop registration page with workshop info
                              const workshopId = workshop.workshopId || workshop.id;
                              window.location.href = `/member/workshops?register=${workshopId}&title=${encodeURIComponent(workshop.title)}`;
                            }}
                          >
                            Register
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Registration Dialog */}
      <Dialog open={!!registerDialog} onOpenChange={(open) => !open && setRegisterDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Workshop</DialogTitle>
            <DialogDescription>
              Register for "{registerDialog?.title}" by providing your contact information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); submitRegistration(); }} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="regName">Full Name *</Label>
              <Input
                id="regName"
                value={registrationForm.name}
                onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                placeholder="John Doe"
                required
                disabled={registering}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="regEmail">Email Address *</Label>
              <Input
                id="regEmail"
                type="email"
                value={registrationForm.email}
                onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                placeholder="john@example.com"
                required
                disabled={registering}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterDialog(null)} disabled={registering}>
                Cancel
              </Button>
              <Button type="submit" disabled={registering}>
                {registering ? 'Registering...' : 'Complete Registration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

