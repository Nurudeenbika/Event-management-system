import React, { createContext, useContext, useState, ReactNode } from "react";
import { Booking, BookingContextType } from "../types";
import { apiClient } from "../utils/api";
import { useAuth } from "./AuthContext";

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchBookings = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/bookings", token);
      setBookings(response.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (eventId: string, numberOfSeats: number) => {
    if (!token) throw new Error("Authentication required");

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(
        "/bookings",
        { eventId, numberOfSeats },
        token
      );
      setBookings((prev) => [response.booking, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!token) throw new Error("Authentication required");

    try {
      setLoading(true);
      setError(null);
      await apiClient.put(`/bookings/${bookingId}/cancel`, {}, token);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" as const }
            : booking
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: BookingContextType = {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    cancelBooking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
