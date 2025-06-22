//app/(tabs)/dashbord
import React, { useState, useEffect, useCallback } from "react";
import {
  Appearance,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
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
import {
  apiService,
  Event,
  DashboardStats,
  CreateEventData,
} from "../../src/services/api";

type FilterStatus = "all" | "upcoming" | "past";

interface Theme {
  text: string;
  background: string;
  placeholder: string;
  tint?: string;
  icon?: string;
  tabIconDefault?: string;
  tabIconSelected?: string;
}

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Form states
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("");
  const [eventVenue, setEventVenue] = useState<string>("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventCategory, setEventCategory] = useState<string>("");
  const [eventPrice, setEventPrice] = useState<string>("");
  const [totalSeats, setTotalSeats] = useState<string>("");
  const [availableSeats, setAvailableSeats] = useState<string>("");

  const colorScheme: ColorSchemeName = Appearance.getColorScheme();
  const theme: Theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data when filter changes
  useEffect(() => {
    loadEvents();
  }, [filterStatus]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadEvents(),
        loadCategories(),
        loadLocations(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      if (user?.role === "admin") {
        const response = await apiService.getDashboardStats();
        if (response.success && response.data) {
          setDashboardStats(response.data);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const now = new Date();
      let params: any = { limit: 50 };

      if (filterStatus === "upcoming") {
        params.sortBy = "date";
        params.sortOrder = "asc";
      } else if (filterStatus === "past") {
        params.sortBy = "date";
        params.sortOrder = "desc";
      }

      const response = await apiService.getEvents(params);

      if (response.success && response.data) {
        let filteredEvents = response.data.events;

        // Apply client-side filtering for past/upcoming
        if (filterStatus === "upcoming") {
          filteredEvents = filteredEvents.filter(
            (event) => new Date(event.date) >= now
          );
        } else if (filterStatus === "past") {
          filteredEvents = filteredEvents.filter(
            (event) => new Date(event.date) < now
          );
        }

        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      Alert.alert("Error", "Failed to load events");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getEventCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await apiService.getEventLocations();
      if (response.success && response.data) {
        setLocations(response.data.locations);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleCreateEvent = async () => {
    if (
      !eventTitle.trim() ||
      !eventDescription.trim() ||
      !eventDate ||
      !eventTime.trim() ||
      !eventVenue.trim() ||
      !eventLocation.trim() ||
      !eventCategory.trim() ||
      !eventPrice ||
      !totalSeats ||
      !availableSeats.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const eventData: CreateEventData = {
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        venue: eventVenue,
        location: eventLocation,
        category: eventCategory,
        price: parseFloat(eventPrice),
        totalSeats: parseInt(totalSeats),
        availableSeats: parseInt(availableSeats),
      };

      const response = await apiService.createEvent(eventData);

      if (response.success) {
        // Reset form
        setEventTitle("");
        setEventDescription("");
        setEventDate("");
        setEventTime("");
        setEventVenue("");
        setEventLocation("");
        setEventCategory("");
        setEventPrice("");
        setTotalSeats("");
        setAvailableSeats("");
        setShowCreateModal(false);

        Alert.alert("Success", "Event created successfully!");
        await loadEvents();
        await loadDashboardStats();
      } else {
        Alert.alert("Error", response.error || "Failed to create event");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await apiService.deleteEvent(eventId);
            if (response.success) {
              setShowEventDetails(false);
              await loadEvents();
              await loadDashboardStats();
              Alert.alert("Success", "Event deleted successfully");
            } else {
              Alert.alert("Error", response.error || "Failed to delete event");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete event");
          }
        },
      },
    ]);
  };

  const handleLogout = async (): Promise<void> => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
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

  const isEventPast = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  };

  const getEventStatusColor = (event: Event): string => {
    if (isEventPast(event.date)) {
      return "#8E8E93"; // Past events
    }
    if (event.availableSeats === 0) {
      return "#FF3B30"; // Sold out
    }
    return "#34C759"; // Available
  };

  const getEventStatusText = (event: Event): string => {
    if (isEventPast(event.date)) {
      return "PAST";
    }
    if (event.availableSeats === 0) {
      return "SOLD OUT";
    }
    return "AVAILABLE";
  };

  const renderEventCard: ListRenderItem<Event> = ({ item: event }) => (
    <Animated.View entering={FadeInRight.delay(100)} style={styles.eventCard}>
      <TouchableOpacity
        onPress={() => {
          setSelectedEvent(event);
          setShowEventDetails(true);
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getEventStatusColor(event) },
            ]}
          >
            <Text style={styles.statusText}>{getEventStatusText(event)}</Text>
          </View>
        </View>

        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Feather name="calendar" size={16} color={theme.text} />
            <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Feather name="map-pin" size={16} color={theme.text} />
            <Text style={styles.eventDetailText}>
              {event.venue}, {event.location}
            </Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Feather name="users" size={16} color={theme.text} />
            <Text style={styles.eventDetailText}>
              {event.availableSeats} / {event.totalSeats} seats available
            </Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Feather name="dollar-sign" size={16} color={theme.text} />
            <Text style={styles.eventDetailText}>₦{event.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-busy" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateText}>No events found</Text>
      <Text style={styles.emptyStateSubtext}>
        {user?.role === "admin"
          ? "Create your first event to get started"
          : "Check back later for new events"}
      </Text>
    </View>
  );

  const renderLoadingState = (): React.ReactElement => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading dashboard...</Text>
    </View>
  );

  if (loading) {
    return <View style={styles.container}>{renderLoadingState()}</View>;
  }

  const filterButtons: FilterStatus[] = ["all", "upcoming", "past"];

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
            <MaterialIcons name="event" size={24} color={theme.text} />
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </Animated.View>

        {/* Welcome Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.welcomeSection}
        >
          <Text style={styles.welcomeText}>
            Welcome back, {user?.name || "User"}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            {user?.role === "admin"
              ? "Manage your events efficiently"
              : "Discover amazing events"}
          </Text>
        </Animated.View>

        {/* Stats Cards - Only show for admin */}
        {user?.role === "admin" && dashboardStats && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(800)}
            style={styles.statsContainer}
          >
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardStats.overview.totalEvents}
              </Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: "#007AFF" }]}>
                {dashboardStats.overview.totalBookings}
              </Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: "#34C759" }]}>
                {dashboardStats.overview.totalUsers}
              </Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: "#FF9500" }]}>
                ₦{dashboardStats.overview.totalRevenue.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </Animated.View>
        )}

        {/* Filter and Create Button */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800)}
          style={styles.actionSection}
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

          {user?.role === "admin" && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <AntDesign name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Events List */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(800)}
          style={styles.eventsContainer}
        >
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false}
          />
        </Animated.View>
      </ScrollView>

      {/* Create Event Modal - Only for admin */}
      {user?.role === "admin" && (
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Event</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                placeholderTextColor={theme.placeholder}
                value={eventTitle}
                onChangeText={setEventTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Event Description"
                placeholderTextColor={theme.placeholder}
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={theme.placeholder}
                value={eventDate}
                onChangeText={setEventDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Time (HH:MM)"
                placeholderTextColor={theme.placeholder}
                value={eventTime}
                onChangeText={setEventTime}
              />

              <TextInput
                style={styles.input}
                placeholder="Venue"
                placeholderTextColor={theme.placeholder}
                value={eventVenue}
                onChangeText={setEventVenue}
              />

              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor={theme.placeholder}
                value={eventLocation}
                onChangeText={setEventLocation}
              />

              <TextInput
                style={styles.input}
                placeholder="Category"
                placeholderTextColor={theme.placeholder}
                value={eventCategory}
                onChangeText={setEventCategory}
              />

              <TextInput
                style={styles.input}
                placeholder="Price (₦)"
                placeholderTextColor={theme.placeholder}
                value={eventPrice}
                onChangeText={setEventPrice}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Total Seats"
                placeholderTextColor={theme.placeholder}
                value={totalSeats}
                onChangeText={setTotalSeats}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Available Seats"
                placeholderTextColor={theme.placeholder}
                value={availableSeats}
                onChangeText={setAvailableSeats}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateEvent}
              >
                <Text style={styles.buttonText}>Create Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Event Details Modal */}
      <Modal
        visible={showEventDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventDetails(false)}
      >
        {selectedEvent && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
              <TouchableOpacity
                onPress={() => setShowEventDetails(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.eventDetailSection}>
                <Text style={styles.eventDetailTitle}>Description</Text>
                <Text style={styles.eventDetailDescription}>
                  {selectedEvent.description}
                </Text>
              </View>

              <View style={styles.eventDetailSection}>
                <Text style={styles.eventDetailTitle}>Event Details</Text>
                <View style={styles.eventDetailRow}>
                  <Feather name="calendar" size={20} color={theme.text} />
                  <Text style={styles.eventDetailText}>
                    {formatDate(selectedEvent.date)}
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Feather name="map-pin" size={20} color={theme.text} />
                  <Text style={styles.eventDetailText}>
                    {selectedEvent.venue}, {selectedEvent.location}
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Feather name="tag" size={20} color={theme.text} />
                  <Text style={styles.eventDetailText}>
                    {selectedEvent.category}
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Feather name="users" size={20} color={theme.text} />
                  <Text style={styles.eventDetailText}>
                    {selectedEvent.availableSeats} / {selectedEvent.totalSeats}{" "}
                    seats available
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Feather name="dollar-sign" size={20} color={theme.text} />
                  <Text style={styles.eventDetailText}>
                    ₦{selectedEvent.price}
                  </Text>
                </View>
              </View>

              <View style={styles.eventDetailSection}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getEventStatusColor(selectedEvent) },
                    styles.fullWidthBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getEventStatusText(selectedEvent)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {!isEventPast(selectedEvent.date) &&
                  selectedEvent.availableSeats > 0 &&
                  user?.role !== "admin" && (
                    <TouchableOpacity
                      style={[styles.button, styles.bookButton]}
                      onPress={() => {
                        setShowEventDetails(false);
                        router.push(`/events/${selectedEvent._id}/book` as any);
                      }}
                    >
                      <Text style={styles.buttonText}>Book Ticket</Text>
                    </TouchableOpacity>
                  )}

                {user?.role === "admin" && (
                  <>
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={() => {
                        setShowEventDetails(false);
                        router.push(`/events/${selectedEvent._id}/edit` as any);
                      }}
                    >
                      <Text style={styles.buttonText}>Edit Event</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButton]}
                      onPress={() => handleDeleteEvent(selectedEvent._id)}
                    >
                      <Text style={styles.buttonText}>Delete Event</Text>
                    </TouchableOpacity>
                  </>
                )}
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
    logoutButton: {
      padding: 8,
    },
    welcomeSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    welcomeText: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 5,
    },
    welcomeSubtext: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.7,
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
      fontSize: 24,
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
    actionSection: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 12,
    },
    filterContainer: {
      flex: 1,
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
    createButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#007AFF",
      alignItems: "center",
      justifyContent: "center",
    },
    eventsContainer: {
      paddingHorizontal: 20,
    },
    eventsList: {
      paddingBottom: 20,
    },
    eventCard: {
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
    eventHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#fff",
    },
    eventDescription: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.7,
      marginBottom: 12,
      lineHeight: 20,
    },
    eventDetails: {
      gap: 8,
    },
    eventDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    eventDetailText: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.8,
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
    input: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      marginBottom: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    button: {
      backgroundColor: "#007AFF",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    eventDetailSection: {
      marginBottom: 24,
    },
    eventDetailTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
    },
    eventDetailDescription: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
    },
    fullWidthBadge: {
      alignSelf: "stretch",
      alignItems: "center",
      paddingVertical: 12,
    },
    actionButtons: {
      gap: 12,
      marginTop: 20,
    },
    bookButton: {
      backgroundColor: "#34C759",
    },
    editButton: {
      backgroundColor: "#FF9500",
    },
    deleteButton: {
      backgroundColor: "#FF3B30",
    },
  });

export default DashboardScreen;
