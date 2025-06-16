export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  category: string;
  location: string;
  priceRange: [number, number];
  dateRange: [Date | null, Date | null];
  searchQuery: string;
}

export interface Booking {
  _id: string;
  userId: string;
  eventId: string;
  event: Event;
  numberOfSeats: number;
  totalAmount: number;
  bookingDate: string;
  status: "confirmed" | "cancelled";
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  filteredEvents: Event[];
  setFilters: (filters: Partial<EventFilters>) => void;
  refreshEvents: () => Promise<void>;
  searchQuery: string;
  selectedCategory: string;
  selectedDate: string;
  sortBy: string;
  fetchEvents: () => Promise<void>;
  searchEvents: (query: string) => void;
  filterByCategory: (category: string) => void;
  filterByDate: (date: string) => void;
  sortEvents: (sortBy: string) => void;
  clearFilters: () => void;
}

export interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (eventId: string, numberOfSeats: number) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}
