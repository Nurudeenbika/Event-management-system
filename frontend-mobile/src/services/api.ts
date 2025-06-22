// API Service for Event Management App
// File: src/services/api.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

// Base Configuration
const API_BASE_URL = "http://localhost:5000/api"; // Replace with your actual API URL
const API_TIMEOUT = 10000; // 10 seconds

// Types and Interfaces
export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  location: string;
  category: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status?: "active" | "cancelled" | "completed";
  imageUrl?: string;
  tags?: string[];
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  category: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: "active" | "cancelled" | "completed";
}

export interface DashboardStats {
  overview: {
    totalEvents: number;
    totalBookings: number;
    totalUsers: number;
    totalRevenue: number;
    upcomingEvents: number;
    pastEvents: number;
    activeEvents: number;
    cancelledEvents: number;
  };
  recentEvents: Event[];
  topCategories: {
    category: string;
    count: number;
    revenue: number;
  }[];
  monthlyStats: {
    month: string;
    events: number;
    bookings: number;
    revenue: number;
  }[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  phone?: string;
  avatar?: string;
}

export interface Booking {
  _id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  numberOfTickets: number;
  totalAmount: number;
  bookingDate: string;
  status: "confirmed" | "cancelled" | "pending";
  paymentStatus: "paid" | "pending" | "failed";
  bookingReference: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  search?: string;
  sortBy?: "date" | "title" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  status?: "upcoming" | "past" | "active" | "cancelled";
  dateFrom?: string;
  dateTo?: string;
}

// HTTP Client Class
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      console.error("API Upload Error:", error);
      return {
        success: false,
        error:
          error.name === "AbortError"
            ? "Request timeout"
            : error.message || "Network error",
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        pagination: data.pagination,
      };
    } catch (error: any) {
      console.error("API Request Error:", error);
      return {
        success: false,
        error:
          error.name === "AbortError"
            ? "Request timeout"
            : error.message || "Network error",
      };
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// API Service Class
class ApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient(API_BASE_URL);
  }

  // Auth Methods
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.client.post("/auth/login", { email, password });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.client.post("/auth/register", userData);
  }

  async logout(): Promise<ApiResponse> {
    return this.client.post("/auth/logout");
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.client.post("/auth/refresh");
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.client.get("/auth/profile");
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.client.put("/auth/profile", userData);
  }

  // Events Methods
  async getEvents(
    params?: GetEventsParams
  ): Promise<ApiResponse<{ events: Event[]; pagination?: any }>> {
    return this.client.get("/events", params);
  }

  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    return this.client.get(`/events/${eventId}`);
  }

  async createEvent(eventData: CreateEventData): Promise<ApiResponse<Event>> {
    return this.client.post("/events", eventData);
  }

  async updateEvent(
    eventId: string,
    eventData: UpdateEventData
  ): Promise<ApiResponse<Event>> {
    return this.client.put(`/events/${eventId}`, eventData);
  }

  async deleteEvent(eventId: string): Promise<ApiResponse> {
    return this.client.delete(`/events/${eventId}`);
  }

  async getEventCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.client.get("/events/categories");
  }

  async getEventLocations(): Promise<ApiResponse<{ locations: string[] }>> {
    return this.client.get("/events/locations");
  }

  async searchEvents(query: string): Promise<ApiResponse<{ events: Event[] }>> {
    return this.client.get("/events/search", { q: query });
  }

  // Dashboard & Stats Methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.client.get("/dashboard/stats");
  }

  async getAdminStats(): Promise<ApiResponse<DashboardStats>> {
    return this.client.get("/admin/stats");
  }

  // Booking Methods
  async createBooking(bookingData: {
    eventId: string;
    numberOfTickets: number;
  }): Promise<ApiResponse<Booking>> {
    return this.client.post("/bookings", bookingData);
  }

  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ bookings: Booking[] }>> {
    return this.client.get("/bookings", params);
  }

  async getBooking(bookingId: string): Promise<ApiResponse<Booking>> {
    return this.client.get(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse> {
    return this.client.delete(`/bookings/${bookingId}`);
  }

  async getEventBookings(
    eventId: string
  ): Promise<ApiResponse<{ bookings: Booking[] }>> {
    return this.client.get(`/events/${eventId}/bookings`);
  }

  // User Management (Admin only)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<ApiResponse<{ users: User[] }>> {
    return this.client.get("/admin/users", params);
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.client.get(`/admin/users/${userId}`);
  }

  async updateUser(
    userId: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.client.put(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.client.delete(`/admin/users/${userId}`);
  }

  // Utility Methods
  async uploadImage(
    imageUri: string
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "image.jpg",
    } as any);

    return this.client.upload("/upload/image", formData);
  }

  // Payment Methods
  async initiatePayment(paymentData: {
    bookingId: string;
    amount: number;
    paymentMethod: string;
  }): Promise<ApiResponse<{ paymentUrl: string; reference: string }>> {
    return this.client.post("/payments/initiate", paymentData);
  }

  async verifyPayment(
    reference: string
  ): Promise<ApiResponse<{ status: string; booking: Booking }>> {
    return this.client.get(`/payments/verify/${reference}`);
  }

  // Mock data for development/testing
  async getMockEvents(): Promise<ApiResponse<{ events: Event[] }>> {
    // This is for development when backend is not ready
    const mockEvents: Event[] = [
      {
        _id: "1",
        title: "Tech Conference 2024",
        description:
          "Annual technology conference featuring the latest innovations",
        date: "2024-07-15T10:00:00Z",
        venue: "Lagos Convention Centre",
        location: "Lagos",
        category: "Technology",
        price: 15000,
        totalSeats: 500,
        availableSeats: 450,
        createdBy: "admin1",
        createdAt: "2024-06-01T10:00:00Z",
        updatedAt: "2024-06-01T10:00:00Z",
        status: "active",
      },
      {
        _id: "2",
        title: "Music Festival",
        description: "Three-day music festival with top artists",
        date: "2024-08-20T18:00:00Z",
        venue: "National Stadium",
        location: "Abuja",
        category: "Music",
        price: 25000,
        totalSeats: 1000,
        availableSeats: 0,
        createdBy: "admin1",
        createdAt: "2024-06-05T10:00:00Z",
        updatedAt: "2024-06-05T10:00:00Z",
        status: "active",
      },
    ];

    return {
      success: true,
      data: { events: mockEvents },
    };
  }

  async getMockDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const mockStats: DashboardStats = {
      overview: {
        totalEvents: 25,
        totalBookings: 1250,
        totalUsers: 850,
        totalRevenue: 18750000,
        upcomingEvents: 15,
        pastEvents: 10,
        activeEvents: 20,
        cancelledEvents: 5,
      },
      recentEvents: [],
      topCategories: [
        { category: "Technology", count: 8, revenue: 5000000 },
        { category: "Music", count: 6, revenue: 7500000 },
        { category: "Sports", count: 4, revenue: 3000000 },
      ],
      monthlyStats: [
        { month: "Jan", events: 3, bookings: 150, revenue: 2250000 },
        { month: "Feb", events: 4, bookings: 200, revenue: 3000000 },
        { month: "Mar", events: 5, bookings: 250, revenue: 3750000 },
      ],
    };

    return {
      success: true,
      data: mockStats,
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export utility functions
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("authToken", token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

// Export default
export default apiService;
