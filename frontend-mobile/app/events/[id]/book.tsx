//app/events/[id]/book.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Appearance,
  ColorSchemeName,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import {
  MaterialIcons,
  Feather,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { apiService, Event } from "@/src/services/api";

interface Theme {
  text: string;
  background: string;
  placeholder: string;
  tint?: string;
  icon?: string;
  tabIconDefault?: string;
  tabIconSelected?: string;
}

const BookEventScreen: React.FC = () => {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [seatsToBook, setSeatsToBook] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [booking, setBooking] = useState<boolean>(false);

  const colorScheme: ColorSchemeName = Appearance.getColorScheme();
  const theme: Theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvent(id!);
      if (response.success && response.data) {
        setEvent(response.data.event);
      } else {
        Alert.alert("Error", "Event not found");
        router.back();
      }
    } catch (error) {
      console.error("Error loading event:", error);
      Alert.alert("Error", "Failed to load event details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = async () => {
    if (!event || !user) return;

    Alert.alert(
      "Confirm Booking",
      `Book ${seatsToBook} seat(s) for ${event.title}?\n\nTotal: ₦${(
        event.price * seatsToBook
      ).toLocaleString()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: async () => {
            try {
              setBooking(true);
              const response = await apiService.createBooking({
                eventId: event._id,
                numberOfTickets: seatsToBook,
              });

              if (response.success) {
                Alert.alert("Success!", "Your booking has been confirmed!", [
                  {
                    text: "View Bookings",
                    onPress: () => router.push("/(tabs)/bookings"),
                  },
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to create booking"
                );
              }
            } catch (error) {
              console.error("Booking error:", error);
              Alert.alert("Error", "Failed to create booking");
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEventPast = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  };

  const canBookEvent = (): boolean => {
    if (!event) return false;
    return !isEventPast(event.date) && event.availableSeats > 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Ticket</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Event Details */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.eventContainer}
        >
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Feather name="calendar" size={20} color={theme.text} />
              <Text style={styles.eventDetailText}>
                {formatDate(event.date)}
              </Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Feather name="map-pin" size={20} color={theme.text} />
              <Text style={styles.eventDetailText}>
                {event.venue}, {event.location}
              </Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Feather name="tag" size={20} color={theme.text} />
              <Text style={styles.eventDetailText}>{event.category}</Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Feather name="users" size={20} color={theme.text} />
              <Text style={styles.eventDetailText}>
                {event.availableSeats} / {event.totalSeats} seats available
              </Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Feather name="dollar-sign" size={20} color={theme.text} />
              <Text style={styles.eventDetailText}>
                ₦{event.price} per ticket
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{event.description}</Text>
        </Animated.View>

        {/* Booking Section */}
        {canBookEvent() && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(800)}
            style={styles.bookingContainer}
          >
            <Text style={styles.sectionTitle}>Select Number of Seats</Text>

            <View style={styles.seatSelector}>
              <TouchableOpacity
                style={[
                  styles.seatButton,
                  seatsToBook <= 1 && styles.seatButtonDisabled,
                ]}
                onPress={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                disabled={seatsToBook <= 1}
              >
                <AntDesign name="minus" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={styles.seatCount}>
                <Text style={styles.seatCountText}>{seatsToBook}</Text>
                <Text style={styles.seatCountLabel}>
                  {seatsToBook === 1 ? "seat" : "seats"}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.seatButton,
                  seatsToBook >= event.availableSeats &&
                    styles.seatButtonDisabled,
                ]}
                onPress={() =>
                  setSeatsToBook(
                    Math.min(event.availableSeats, seatsToBook + 1)
                  )
                }
                disabled={seatsToBook >= event.availableSeats}
              >
                <AntDesign name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {seatsToBook} × ₦{event.price}
                </Text>
                <Text style={styles.priceValue}>
                  ₦{(event.price * seatsToBook).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ₦{(event.price * seatsToBook).toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Status Messages */}
        {!canBookEvent() && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(800)}
            style={styles.statusContainer}
          >
            {isEventPast(event.date) ? (
              <View style={styles.statusMessage}>
                <MaterialIcons name="event-busy" size={48} color="#8E8E93" />
                <Text style={styles.statusTitle}>Event Has Passed</Text>
                <Text style={styles.statusSubtitle}>
                  This event has already taken place
                </Text>
              </View>
            ) : event.availableSeats === 0 ? (
              <View style={styles.statusMessage}>
                <MaterialIcons name="event-seat" size={48} color="#FF3B30" />
                <Text style={styles.statusTitle}>Sold Out</Text>
                <Text style={styles.statusSubtitle}>
                  All tickets for this event have been sold
                </Text>
              </View>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      {/* Book Button */}
      {canBookEvent() && (
        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.bookButtonContainer}
        >
          <TouchableOpacity
            style={[styles.bookButton, booking && styles.bookButtonDisabled]}
            onPress={handleBookTicket}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>
                Book {seatsToBook} {seatsToBook === 1 ? "Ticket" : "Tickets"}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FF3B30",
      marginTop: 16,
      textAlign: "center",
    },
    backButton: {
      marginTop: 20,
      backgroundColor: "#007AFF",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    backBtn: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    placeholder: {
      width: 40,
    },
    eventContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      margin: 20,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    eventTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    eventDetails: {
      marginBottom: 16,
    },
    eventDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    eventDetailText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 12,
      flex: 1,
    },
    description: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
      opacity: 0.8,
    },
    bookingContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      margin: 20,
      marginTop: 0,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
    },
    seatSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    seatButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#007AFF",
      alignItems: "center",
      justifyContent: "center",
    },
    seatButtonDisabled: {
      backgroundColor: "#8E8E93",
    },
    seatCount: {
      marginHorizontal: 40,
      alignItems: "center",
    },
    seatCountText: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.text,
    },
    seatCountLabel: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.6,
    },
    priceBreakdown: {
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
      paddingTop: 16,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    priceLabel: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.8,
    },
    priceValue: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "500",
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
      paddingTop: 12,
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#007AFF",
    },
    statusContainer: {
      margin: 20,
      marginTop: 0,
    },
    statusMessage: {
      alignItems: "center",
      padding: 40,
    },
    statusTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
    },
    statusSubtitle: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.6,
      textAlign: "center",
      marginTop: 8,
    },
    bookButtonContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    bookButton: {
      backgroundColor: "#34C759",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    bookButtonDisabled: {
      backgroundColor: "#8E8E93",
    },
    bookButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
    },
  });

export default BookEventScreen;
