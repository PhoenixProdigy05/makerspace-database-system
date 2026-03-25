'use client';



import { useState } from 'react';

import { apiClient } from '@/lib/api-client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';



export default function ContactPage() {

  const [formData, setFormData] = useState({

    name: '',

    email: '',

    subject: '',

    message: '',

  });

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiClient.submitContact(formData);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };



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

        <div className="max-w-2xl mx-auto">

          <Card className="bg-white/10 backdrop-blur-md border-white/20">

            <CardHeader>

              <CardTitle className="text-3xl text-white">Contact Us</CardTitle>

              <CardDescription className="text-gray-200">

                Get in touch with us for questions, feedback, or support

              </CardDescription>

            </CardHeader>

            <CardContent>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">

                <div className="space-y-2">

                  <Label htmlFor="name" className="text-gray-200">Name *</Label>

                  <Input

                    id="name"

                    value={formData.name}

                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}

                    required

                    disabled={loading}

                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="email" className="text-gray-200">Email *</Label>

                  <Input

                    id="email"

                    type="email"

                    value={formData.email}

                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                    required

                    disabled={loading}

                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="subject" className="text-gray-200">Subject *</Label>

                  <Input

                    id="subject"

                    value={formData.subject}

                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}

                    required

                    disabled={loading}

                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="message" className="text-gray-200">Message *</Label>

                  <textarea

                    id="message"

                    value={formData.message}

                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}

                    required

                    disabled={loading}

                    rows={6}

                    className="flex w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-white"

                  />

                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>

                  {loading ? 'Sending...' : 'Send Message'}

                </Button>

              </form>



              <div className="mt-8 pt-8 border-t border-white/20">

                <h3 className="text-lg font-semibold mb-4 text-white">Other Ways to Reach Us</h3>

                <div className="space-y-2 text-gray-300">

                  <p>Email: makerspace@ug.edu.gh</p>

                  <p>Phone: (055) 011-1523</p>

                  <p>Address: MR38+VW Accra, Ghana</p>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

      </main>

    </div>

  );

}



