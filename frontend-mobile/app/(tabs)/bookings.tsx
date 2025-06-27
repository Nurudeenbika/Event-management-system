import React, { useState, useEffect, useCallback } from "react";
import {
  Appearance,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  FlatList,
  ListRenderItem,
  ColorSchemeName,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Colors } from "../../constants/Colors";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";
import {
  MaterialIcons,
  Feather,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { apiService } from "../../src/services/api";

// Types
type BookingStatus = "all" | "confirmed" | "cancelled" | "pending";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  venue: string;
  location: string;
  price: number;
  imageUrl?: string;
}

interface Booking {
  _id: string;
  user: User;
  event: Event;
  seatsBooked: number;
  totalAmount: number;
  status: "confirmed" | "cancelled" | "pending";
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: {
    _id: string;
    count: number;
    totalSeats: number;
    totalRevenue: number;
  }[];
}

interface Theme {
  text: string;
  background: string;
  placeholder: string;
  tint?: string;
  icon?: string;
  tabIconDefault?: string;
  tabIconSelected?: string;
}

const BookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<BookingStatus>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState<
    {
      _id: string;
      count: number;
      totalSeats: number;
      totalRevenue: number;
    }[]
  >([]);

  const colorScheme: ColorSchemeName = Appearance.getColorScheme();
  const theme: Theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  // Load initial data
  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const loadBookings = async (page: number = 1) => {
    try {
      setLoading(page === 1);

      const params: any = {
        page,
        limit: pagination.limit,
      };

      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      let response;
      if (user?.role === "admin") {
        response = await apiService.getAllBookings(params);
      } else {
        response = await apiService.getUserBookings(params);
      }

      if (response.success && response.data) {
        const {
          bookings: newBookings,
          pagination: newPagination,
          stats: newStats,
        } = response.data;

        if (page === 1) {
          setBookings(newBookings);
        } else {
          setBookings((prev) => [...prev, ...newBookings]);
        }

        setPagination(newPagination);
        if (newStats) {
          setStats(newStats);
        }
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings(1);
    setRefreshing(false);
  }, [filterStatus]);

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiService.cancelBooking(bookingId);
              if (response.success) {
                setShowBookingDetails(false);
                await loadBookings(1);
                Alert.alert("Success", "Booking cancelled successfully");
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to cancel booking"
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "#34C759";
      case "cancelled":
        return "#FF3B30";
      case "pending":
        return "#FF9500";
      default:
        return "#8E8E93";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "check-circle";
      case "cancelled":
        return "x-circle";
      case "pending":
        return "clock";
      default:
        return "help-circle";
    }
  };

  const isBookingCancellable = (booking: Booking): boolean => {
    if (booking.status !== "confirmed") return false;

    const eventDate = new Date(booking.event.date);
    const now = new Date();
    const hoursDifference =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDifference >= 24;
  };

  const renderBookingCard: ListRenderItem<Booking> = ({ item: booking }) => (
    <Animated.View entering={FadeInRight.delay(100)} style={styles.bookingCard}>
      <TouchableOpacity
        onPress={() => {
          setSelectedBooking(booking);
          setShowBookingDetails(true);
        }}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.bookingTitleContainer}>
            <Text style={styles.bookingTitle}>{booking.event.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.status) },
              ]}
            >
              <Feather
                name={getStatusIcon(booking.status) as any}
                size={12}
                color="#fff"
              />
              <Text style={styles.statusText}>
                {booking.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.bookingDetailRow}>
            <Feather name="calendar" size={16} color={theme.text} />
            <Text style={styles.bookingDetailText}>
              {formatDate(booking.event.date)}
            </Text>
          </View>
          <View style={styles.bookingDetailRow}>
            <Feather name="map-pin" size={16} color={theme.text} />
            <Text style={styles.bookingDetailText}>
              {booking.event.venue}, {booking.event.location}
            </Text>
          </View>
          <View style={styles.bookingDetailRow}>
            <Feather name="users" size={16} color={theme.text} />
            <Text style={styles.bookingDetailText}>
              {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.bookingDetailRow}>
            <Feather name="dollar-sign" size={16} color={theme.text} />
            <Text style={styles.bookingDetailText}>
              {formatCurrency(booking.totalAmount)}
            </Text>
          </View>
          {user?.role === "admin" && (
            <View style={styles.bookingDetailRow}>
              <Feather name="user" size={16} color={theme.text} />
              <Text style={styles.bookingDetailText}>{booking.user.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.bookingDate}>
            Booked on {formatDate(booking.bookingDate)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-busy" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateText}>No bookings found</Text>
      <Text style={styles.emptyStateSubtext}>
        {filterStatus === "all"
          ? "You haven't made any bookings yet"
          : `No ${filterStatus} bookings found`}
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => router.push("/(tabs)/dashboard")}
      >
        <Text style={styles.emptyStateButtonText}>Browse Events</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = (): React.ReactElement => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading bookings...</Text>
    </View>
  );

  const renderStatsSection = (): React.ReactElement | null => {
    if (user?.role !== "admin" || stats.length === 0) return null;

    const totalBookings = stats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = stats.reduce(
      (sum, stat) => sum + stat.totalRevenue,
      0
    );
    const totalSeats = stats.reduce((sum, stat) => sum + stat.totalSeats, 0);

    return (
      <Animated.View
        entering={FadeInUp.delay(400).duration(800)}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalBookings}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#007AFF" }]}>
            {totalSeats}
          </Text>
          <Text style={styles.statLabel}>Seats Booked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#34C759" }]}>
            {formatCurrency(totalRevenue)}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return <View style={styles.container}>{renderLoadingState()}</View>;
  }

  const filterButtons: BookingStatus[] = [
    "all",
    "confirmed",
    "pending",
    "cancelled",
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="book" size={24} color={theme.text} />
            <Text style={styles.headerTitle}>
              {user?.role === "admin" ? "All Bookings" : "My Bookings"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard")}
            style={styles.headerButton}
          >
            <Ionicons name="home-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Section - Admin Only */}
        {renderStatsSection()}

        {/* Filter Section */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800)}
          style={styles.filterSection}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterButtons.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.activeFilterButton,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterStatus === status && styles.activeFilterButtonText,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Bookings List */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(800)}
          style={styles.bookingsContainer}
        >
          <FlatList
            data={bookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookingsList}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false}
            onEndReached={() => {
              if (pagination.page < pagination.pages) {
                loadBookings(pagination.page + 1);
              }
            }}
            onEndReachedThreshold={0.1}
          />
        </Animated.View>
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={showBookingDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingDetails(false)}
      >
        {selectedBooking && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity
                onPress={() => setShowBookingDetails(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Event Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Event Information</Text>
                <Text style={styles.eventTitle}>
                  {selectedBooking.event.title}
                </Text>

                <View style={styles.detailRow}>
                  <Feather name="calendar" size={20} color={theme.text} />
                  <Text style={styles.detailText}>
                    {formatDate(selectedBooking.event.date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="map-pin" size={20} color={theme.text} />
                  <Text style={styles.detailText}>
                    {selectedBooking.event.venue},{" "}
                    {selectedBooking.event.location}
                  </Text>
                </View>
              </View>

              {/* Booking Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  Booking Information
                </Text>

                <View style={styles.detailRow}>
                  <Feather name="users" size={20} color={theme.text} />
                  <Text style={styles.detailText}>
                    {selectedBooking.seatsBooked} seat
                    {selectedBooking.seatsBooked > 1 ? "s" : ""}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="dollar-sign" size={20} color={theme.text} />
                  <Text style={styles.detailText}>
                    {formatCurrency(selectedBooking.totalAmount)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="clock" size={20} color={theme.text} />
                  <Text style={styles.detailText}>
                    Booked on {formatDate(selectedBooking.bookingDate)}
                  </Text>
                </View>

                {user?.role === "admin" && (
                  <View style={styles.detailRow}>
                    <Feather name="user" size={20} color={theme.text} />
                    <Text style={styles.detailText}>
                      {selectedBooking.user.name} ({selectedBooking.user.email})
                    </Text>
                  </View>
                )}
              </View>

              {/* Status */}
              <View style={styles.detailSection}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedBooking.status) },
                    styles.fullWidthBadge,
                  ]}
                >
                  <Feather
                    name={getStatusIcon(selectedBooking.status) as any}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.statusText}>
                    {selectedBooking.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {isBookingCancellable(selectedBooking) &&
                  user?.role !== "admin" && (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => handleCancelBooking(selectedBooking._id)}
                    >
                      <Text style={styles.buttonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  )}

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    setShowBookingDetails(false);
                    router.push(`/events/${selectedBooking.event._id}` as any);
                  }}
                >
                  <Text style={styles.buttonText}>View Event</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

// Styles
const createStyles = (theme: Theme, colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginLeft: 10,
    },
    headerButton: {
      padding: 8,
    },
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.6,
      textAlign: "center",
    },
    filterSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    filterContainer: {
      flexDirection: "row",
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
      marginRight: 8,
    },
    activeFilterButton: {
      backgroundColor: "#007AFF",
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    activeFilterButtonText: {
      color: "#fff",
    },
    bookingsContainer: {
      paddingHorizontal: 20,
    },
    bookingsList: {
      paddingBottom: 20,
    },
    bookingCard: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    bookingHeader: {
      marginBottom: 12,
    },
    bookingTitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    bookingTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#fff",
    },
    bookingDetails: {
      gap: 8,
      marginBottom: 12,
    },
    bookingDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    bookingDetailText: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.8,
    },
    bookingFooter: {
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
      paddingTop: 12,
    },
    bookingDate: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.6,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.6,
      textAlign: "center",
      marginTop: 8,
    },
    emptyStateButton: {
      backgroundColor: "#007AFF",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    emptyStateButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: theme.text,
      marginTop: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#1C1C1E" : "#E5E5EA",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    detailSection: {
      marginBottom: 24,
    },
    detailSectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
    },
    eventTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    detailText: {
      fontSize: 16,
      color: theme.text,
      flex: 1,
    },
    fullWidthBadge: {
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    actionButtons: {
      gap: 12,
      marginTop: 20,
    },
    button: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    primaryButton: {
      backgroundColor: "#007AFF",
    },
    cancelButton: {
      backgroundColor: "#FF3B30",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });

export default BookingsScreen;
