'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Mail, Clock, CheckCircle, AlertCircle, Trash2, Eye, MessageSquare } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  readAt?: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'READ' | 'RESPONDED'>('ALL');

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = filter === 'ALL' 
        ? await apiClient.getContacts()
        : await apiClient.getContactsByStatus(filter);
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.markContactAsRead(id.toString());
      fetchContacts();
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status: 'READ', readAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsResponded = async (id: number) => {
    try {
      await apiClient.markContactAsResponded(id.toString());
      fetchContacts();
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status: 'RESPONDED' });
      }
    } catch (error) {
      console.error('Failed to mark as responded:', error);
    }
  };

  const deleteContact = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact message?')) {
      try {
        await apiClient.deleteContact(id.toString());
        fetchContacts();
        if (selectedContact?.id === id) {
          setSelectedContact(null);
        }
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-500';
      case 'READ':
        return 'bg-yellow-500';
      case 'RESPONDED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="w-4 h-4" />;
      case 'READ':
        return <Eye className="w-4 h-4" />;
      case 'RESPONDED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
              <p className="text-gray-600">Manage and respond to contact form submissions</p>
            </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            {(['ALL', 'NEW', 'READ', 'RESPONDED'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className="flex items-center gap-2"
              >
                {getStatusIcon(status === 'ALL' ? 'NEW' : status)}
                {status}
                {status === 'NEW' && (
                  <Badge variant="secondary" className="ml-1">
                    {contacts.filter(c => c.status === 'NEW').length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contacts List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Messages
                  </CardTitle>
                  <CardDescription>
                    {loading ? 'Loading...' : `${contacts.length} messages`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No contact messages found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedContact?.id === contact.id ? 'border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                <Badge className={getStatusColor(contact.status)}>
                                  {getStatusIcon(contact.status)}
                                  <span className="ml-1">{contact.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{contact.email}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatDate(contact.createdAt)}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mb-1">{contact.subject}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                  <CardDescription>
                    {selectedContact ? 'View and manage contact message' : 'Select a message to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedContact ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedContact.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedContact.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <p className="text-gray-900">{selectedContact.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Badge className={getStatusColor(selectedContact.status)}>
                          {getStatusIcon(selectedContact.status)}
                          <span className="ml-1">{selectedContact.status}</span>
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Received</label>
                        <p className="text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                      </div>
                      {selectedContact.readAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Read At</label>
                          <p className="text-gray-900">{formatDate(selectedContact.readAt)}</p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t space-y-2">
                        {selectedContact.status === 'NEW' && (
                          <Button onClick={() => markAsRead(selectedContact.id)} className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Mark as Read
                          </Button>
                        )}
                        {(selectedContact.status === 'NEW' || selectedContact.status === 'READ') && (
                          <Button onClick={() => markAsResponded(selectedContact.id)} className="w-full">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Responded
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          onClick={() => deleteContact(selectedContact.id)} 
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Message
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a contact message to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
  );
}
