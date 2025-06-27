//app/events/[id]/book.tsx - Complete version
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

  const handleProceedToBooking = () => {
    if (!event || !user) return;

    // Navigate to confirmation page with event id and selected seats
    router.push(`/events/${event._id}/confirm-booking?seats=${seatsToBook}`);
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

        {/* Unavailable Event Message */}
        {!canBookEvent() && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(800)}
            style={styles.unavailableContainer}
          >
            <MaterialIcons name="event-busy" size={48} color="#FF6B6B" />
            <Text style={styles.unavailableTitle}>
              {isEventPast(event.date) ? "Event Has Passed" : "Event Sold Out"}
            </Text>
            <Text style={styles.unavailableText}>
              {isEventPast(event.date)
                ? "This event has already taken place."
                : "Unfortunately, all tickets for this event have been sold."}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      {canBookEvent() && (
        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.bottomContainer}
        >
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedToBooking}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedButtonText}>
              Proceed to Booking - ₦
              {(event.price * seatsToBook).toLocaleString()}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
      marginTop: 16,
      fontSize: 16,
      color: theme.text,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: theme.text,
      marginTop: 16,
      marginBottom: 24,
      textAlign: "center",
    },
    backButton: {
      backgroundColor: "#007AFF",
      paddingHorizontal: 24,
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    backBtn: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    placeholder: {
      width: 40,
    },
    eventContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      margin: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    eventTitle: {
      fontSize: 24,
      fontWeight: "700",
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
      fontSize: 15,
      color: theme.text,
      lineHeight: 22,
      opacity: 0.8,
    },
    bookingContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
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
      backgroundColor: "#007AFF",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    seatButtonDisabled: {
      backgroundColor: "#C7C7CC",
    },
    seatCount: {
      marginHorizontal: 40,
      alignItems: "center",
    },
    seatCountText: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.text,
    },
    seatCountLabel: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.6,
      marginTop: 4,
    },
    priceBreakdown: {
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#38383A" : "#E5E5EA",
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
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#38383A" : "#E5E5EA",
      marginBottom: 0,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "700",
      color: "#007AFF",
    },
    unavailableContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 40,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    unavailableTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#FF6B6B",
      marginTop: 16,
      marginBottom: 8,
    },
    unavailableText: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.7,
      textAlign: "center",
      lineHeight: 22,
    },
    bottomContainer: {
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 34,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#38383A" : "#E5E5EA",
    },
    proceedButton: {
      backgroundColor: "#007AFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      shadowColor: "#007AFF",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    proceedButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
      marginRight: 8,
    },
  });

export default BookEventScreen;
