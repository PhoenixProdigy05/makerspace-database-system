const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091/api';

export interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers as HeadersInit);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        
        // Try to parse error message from response
        let errorMessage = `API Error: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If response is not JSON, use status text
        }
        
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return {} as T;
    } catch (err: any) {
      // Handle network errors
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        const error: ApiError = {
          message: `Network error: Unable to connect to the server. Please check if the backend is running at ${API_BASE_URL}`,
          status: 0,
        };
        throw error;
      }
      // Re-throw if it's already an ApiError
      if (err.status !== undefined) {
        throw err;
      }
      // Wrap other errors
      const error: ApiError = {
        message: err.message || 'An unexpected error occurred',
        status: 0,
      };
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; email: string; fullName: string; role: string; id?: string; userId?: string; _id?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: string;
    staffType?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // User methods
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async getCurrentUser() {
    return this.request<any>('/users/me');
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCurrentUser(data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async suspendUser(id: string) {
    return this.request(`/users/${id}/suspend`, {
      method: 'PUT',
    });
  }

  async unsuspendUser(id: string) {
    return this.request(`/users/${id}/unsuspend`, {
      method: 'PUT',
    });
  }

  async getActivityTrends(days: number = 30) {
    return this.request<any[]>(`/users/activity-trends?days=${days}`);
  }

  async getMostActiveMembers(limit: number = 10) {
    return this.request<any[]>(`/users/most-active?limit=${limit}`);
  }

  async getMemberBookingHistory(userId: string) {
    return this.request<any[]>(`/users/${userId}/booking-history`);
  }

  async getMemberProjectParticipation(userId: string) {
    return this.request<any[]>(`/users/${userId}/project-participation`);
  }

  async getMemberAttendanceRecords(userId: string) {
    return this.request<any[]>(`/users/${userId}/attendance-records`);
  }

  // Inventory methods
  async getInventoryItems() {
    return this.request<any[]>('/inventory');
  }

  async getLowStockItems() {
    return this.request<any[]>('/inventory/low-stock');
  }

  async getInventoryItem(id: string) {
    return this.request<any>(`/inventory/${id}`);
  }

  async createInventoryItem(data: any) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Attachment methods
  async uploadFile(file: File, ownerTable: string, ownerId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerTable', ownerTable);
    formData.append('ownerId', ownerId);

    const token = this.getToken();
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      const error: ApiError = {
        message: `API Error: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  async getAttachmentsByOwner(ownerTable: string, ownerId: string) {
    return this.request<any[]>(`/attachments/owner/${ownerTable}/${ownerId}`);
  }

  async getAttachment(id: string) {
    return this.request<any>(`/attachments/${id}`);
  }

  async deleteAttachment(id: string) {
    return this.request(`/attachments/${id}`, {
      method: 'DELETE',
    });
  }

  getAttachmentDownloadUrl(filename: string): string {
    const token = this.getToken();
    return `${API_BASE_URL}/attachments/download/${filename}${token ? `?token=${token}` : ''}`;
  }

  async getBookings(params?: { status?: string; from?: string; to?: string; member?: string; equipment?: string }) {
    const query = params
      ? '?' + new URLSearchParams((Object.entries(params).filter(([, v]) => v != null && v !== '') as any)).toString()
      : '';
    return this.request<any[]>(`/bookings${query}`);
  }

  async createBooking(data: {
    tools: string;
    materials: string;
    durationMinutes: number;
    appointmentTime?: string;
    notes?: string;
    appointmentType?: string;
    projectDescription?: string;
    equipmentId?: string;
    equipmentQuantity?: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBooking(id: string, data: { appointmentTime?: string; equipmentId?: string; equipmentQuantity?: string; equipment?: string; notes?: string }) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMyBookings() {
    return this.request<any[]>('/bookings/my');
  }

  async cancelMyBooking(id: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  async updateBookingStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE') {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateMemberBookingStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE') {
    return this.request(`/bookings/${id}/status/member`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async returnBooking(id: string) {
    return this.request(`/bookings/${id}/return`, {
      method: 'POST',
    });
  }

  async updateBookingProgress(id: string, progress: number, projectDescription?: string) {
    return this.request(`/bookings/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress, projectDescription }),
    });
  }

  // Articles methods
  async getArticles() {
    return this.request<any[]>('/articles');
  }
  async getArticle(id: string) {
    return this.request<any>(`/articles/${id}`);
  }
  async createArticle(data: { title: string; author?: string; imageUrl?: string; content?: string; tags?: string }) {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateArticle(id: string, data: { title?: string; author?: string; imageUrl?: string; content?: string; tags?: string; status?: 'DRAFT' | 'PUBLISHED' }) {
    return this.request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteArticle(id: string) {
    return this.request(`/articles/${id}`, { method: 'DELETE' });
  }
  async publishArticle(id: string) {
    return this.request(`/articles/${id}/publish`, { method: 'POST' });
  }
  async unpublishArticle(id: string) {
    return this.request(`/articles/${id}/unpublish`, { method: 'POST' });
  }

  // Workshops methods
  async getWorkshops() {
    return this.request<any[]>('/workshops');
  }
  async getWorkshop(id: string) {
    return this.request<any>(`/workshops/${id}`);
  }
  async createWorkshop(data: { title: string; instructor?: string; date?: string; capacity?: number }) {
    return this.request('/workshops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateWorkshop(id: string, data: { title?: string; instructor?: string; date?: string; capacity?: number; status?: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' }) {
    return this.request(`/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteWorkshop(id: string) {
    return this.request(`/workshops/${id}`, { method: 'DELETE' });
  }
  async cancelWorkshop(id: string) {
    return this.request(`/workshops/${id}/cancel`, { method: 'POST' });
  }
  async completeWorkshop(id: string) {
    return this.request(`/workshops/${id}/complete`, { method: 'POST' });
  }
  async getWorkshopRegistrations(id: string) {
    return this.request<any[]>(`/workshops/${id}/registrations`);
  }
  async addWorkshopRegistration(id: string, memberId: string) {
    return this.request(`/workshops/${id}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    });
  }
  async removeWorkshopRegistration(id: string, memberId: string) {
    return this.request(`/workshops/${id}/registrations/${memberId}`, {
      method: 'DELETE',
    });
  }
  getWorkshopRegistrationsCsvUrl(id: string) {
    return `${API_BASE_URL}/workshops/${id}/registrations/export`;
  }

  // Project Workspace methods
  async getProjectWorkspace(bookingId: string) {
    return this.request<any>(`/projects/${bookingId}`);
  }

  async createProjectTask(bookingId: string, description: string, orderIndex?: number) {
    return this.request(`/projects/${bookingId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ description, orderIndex }),
    });
  }

  async updateProjectTaskStatus(taskId: string, isCompleted: boolean) {
    return this.request(`/projects/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted }),
    });
  }

  async deleteProjectTask(taskId: string) {
    return this.request(`/projects/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Gallery methods
  async getPublicGalleryItems() {
    const response = await fetch(`${API_BASE_URL}/gallery/public`);
    if (!response.ok) {
      throw new Error('Failed to fetch gallery items');
    }
    return response.json();
  }

  async getGalleryItems() {
    return this.request<any[]>('/gallery');
  }

  async getGalleryItem(id: string) {
    return this.request<any>(`/gallery/${id}`);
  }

  async createGalleryItem(data: { title: string; description?: string; imageUrl?: string; file?: File }) {
    if (data.file) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('file', data.file);

      const token = this.getToken();
      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        const error: ApiError = {
          message: `API Error: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }

      return response.json();
    } else {
      return this.request('/gallery', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl
        }),
      });
    }
  }

  async updateGalleryItem(id: string, data: { title?: string; description?: string; imageUrl?: string }) {
    return this.request(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGalleryItem(id: string) {
    return this.request(`/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  async updateGalleryItemOrder(id: string, newOrder: number) {
    return this.request(`/gallery/${id}/order`, {
      method: 'PUT',
      body: JSON.stringify({ order: newOrder }),
    });
  }

  // Contact methods
  async submitContact(data: { name: string; email: string; subject: string; message: string }) {
    return this.request<any>('/contacts/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContacts() {
    return this.request<any[]>('/contacts');
  }

  async getContact(id: string) {
    return this.request<any>(`/contacts/${id}`);
  }

  async getContactsByStatus(status: string) {
    return this.request<any[]>(`/contacts/status/${status}`);
  }

  async markContactAsRead(id: string) {
    return this.request<any>(`/contacts/${id}/read`, {
      method: 'PUT',
    });
  }

  async markContactAsResponded(id: string) {
    return this.request<any>(`/contacts/${id}/responded`, {
      method: 'PUT',
    });
  }

  async updateContactStatus(id: string, status: string) {
    return this.request<any>(`/contacts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async getNewContactsCount() {
    return this.request<number>('/contacts/stats/new-count');
  }

  async getRecentContacts(days: number) {
    return this.request<any[]>(`/contacts/recent/${days}`);
  }
}

export const apiClient = new ApiClient();
