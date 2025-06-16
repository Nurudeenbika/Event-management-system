import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event, Booking } from "../../types";

const BookingHistoryScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API call
  const mockBookings: Booking[] = [
    {
      _id: "1",
      userId: "user1",
      eventId: "event1",
      event: {
        _id: "event1",
        title: "React Native Workshop",
        description: "Learn React Native development from industry experts",
        category: "Technology",
        location: "Tech Hub Conference Center",
        date: "2024-06-15",
        time: "10:00 AM",
        totalSeats: 50,
        availableSeats: 30,
        price: 99.99,
        imageUrl: "https://via.placeholder.com/300x200",
        createdAt: "2024-05-01T10:00:00Z",
        updatedAt: "2024-05-20T10:00:00Z",
        venue: "",
        createdBy: "",
      },
      numberOfSeats: 2,
      totalAmount: 199.98,
      bookingDate: "2024-05-20T10:00:00Z",
      status: "confirmed",
    },
    {
      _id: "2",
      userId: "user1",
      eventId: "event2",
      event: {
        _id: "event2",
        title: "UI/UX Design Masterclass",
        description: "Master the principles of modern UI/UX design",
        category: "Design",
        location: "Design Studio Downtown",
        date: "2024-07-08",
        time: "2:00 PM",
        totalSeats: 30,
        availableSeats: 15,
        price: 149.99,
        imageUrl: "https://via.placeholder.com/300x200",
        createdAt: "2024-05-01T10:00:00Z",
        updatedAt: "2024-05-18T10:00:00Z",
        venue: "",
        createdBy: "",
      },
      numberOfSeats: 1,
      totalAmount: 149.99,
      bookingDate: "2024-05-18T10:00:00Z",
      status: "confirmed",
    },
    {
      _id: "3",
      userId: "user1",
      eventId: "event3",
      event: {
        _id: "event3",
        title: "JavaScript Conference 2024",
        description: "Annual JavaScript developers conference",
        category: "Technology",
        location: "Grand Convention Center",
        date: "2024-05-10",
        time: "9:00 AM",
        totalSeats: 200,
        availableSeats: 50,
        price: 299.99,
        imageUrl: "https://via.placeholder.com/300x200",
        createdAt: "2024-04-01T10:00:00Z",
        updatedAt: "2024-04-25T10:00:00Z",
        venue: "",
        createdBy: "",
      },
      numberOfSeats: 1,
      totalAmount: 299.99,
      bookingDate: "2024-04-25T10:00:00Z",
      status: "confirmed",
    },
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBookings(mockBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            setBookings((prev) =>
              prev.map((booking) =>
                booking._id === bookingId
                  ? { ...booking, status: "cancelled" as const }
                  : booking
              )
            );
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.eventTitle}>{item.event.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={12}
            color="white"
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.event.date} at {item.event.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="ticket-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.numberOfSeats} seat(s)</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>${item.totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="barcode-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>ID: {item._id}</Text>
        </View>
      </View>

      {item.status === "confirmed" && (
        <View style={styles.bookingActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your event bookings will appear here once you make your first
            reservation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
  },
  bookingActions: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  cancelButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default BookingHistoryScreen;
