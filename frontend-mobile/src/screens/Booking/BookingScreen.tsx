import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { EventsStackParamList } from "../../navigation/MainNavigator";
import { useBookings } from "../../contexts/BookingContext";
import { Ionicons } from "@expo/vector-icons";

type BookingScreenNavigationProp = StackNavigationProp<
  EventsStackParamList,
  "Booking"
>;
type BookingScreenRouteProp = RouteProp<EventsStackParamList, "Booking">;

interface Props {
  navigation: BookingScreenNavigationProp;
  route: BookingScreenRouteProp;
}

const BookingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { event } = route.params;
  const { createBooking, loading } = useBookings();
  const [numberOfSeats, setNumberOfSeats] = useState(1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`;
  };

  const totalAmount = event.price * numberOfSeats;

  const handleSeatChange = (change: number) => {
    const newSeats = numberOfSeats + change;
    if (newSeats >= 1 && newSeats <= event.availableSeats && newSeats <= 10) {
      setNumberOfSeats(newSeats);
    }
  };

  const handleBooking = async () => {
    try {
      await createBooking(event._id, numberOfSeats);
      Alert.alert(
        "Booking Confirmed!",
        `Your booking for ${numberOfSeats} seat(s) has been confirmed.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("EventsList"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Failed to create booking"
      );
    }
  };

  const confirmBooking = () => {
    Alert.alert(
      "Confirm Booking",
      `Are you sure you want to book ${numberOfSeats} seat(s) for ${event.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: handleBooking },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.eventCard}>
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        )}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventDetail}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.eventDetailText}>
              {formatDate(event.date)} at {event.time}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.eventDetailText}>{event.location}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text style={styles.eventDetailText}>
              {event.availableSeats} seats available
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingCard}>
        <Text style={styles.sectionTitle}>Select Number of Seats</Text>

        <View style={styles.seatSelector}>
          <TouchableOpacity
            style={[
              styles.seatButton,
              numberOfSeats <= 1 && styles.seatButtonDisabled,
            ]}
            onPress={() => handleSeatChange(-1)}
            disabled={numberOfSeats <= 1}
          >
            <Ionicons
              name="remove"
              size={20}
              color={numberOfSeats <= 1 ? "#9ca3af" : "#6366f1"}
            />
          </TouchableOpacity>

          <View style={styles.seatCount}>
            <Text style={styles.seatCountText}>{numberOfSeats}</Text>
            <Text style={styles.seatCountLabel}>
              seat{numberOfSeats !== 1 ? "s" : ""}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.seatButton,
              (numberOfSeats >= event.availableSeats || numberOfSeats >= 10) &&
                styles.seatButtonDisabled,
            ]}
            onPress={() => handleSeatChange(1)}
            disabled={
              numberOfSeats >= event.availableSeats || numberOfSeats >= 10
            }
          >
            <Ionicons
              name="add"
              size={20}
              color={
                numberOfSeats >= event.availableSeats || numberOfSeats >= 10
                  ? "#9ca3af"
                  : "#6366f1"
              }
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.seatLimit}>Maximum 10 seats per booking</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Booking Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Event</Text>
          <Text style={styles.summaryValue}>{event.title}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Number of Seats</Text>
          <Text style={styles.summaryValue}>{numberOfSeats}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price per Seat</Text>
          <Text style={styles.summaryValue}>{formatPrice(event.price)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={confirmBooking}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading
              ? "Booking..."
              : `Book ${numberOfSeats} Seat${numberOfSeats !== 1 ? "s" : ""}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  eventCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 8,
  },
  bookingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  seatSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  seatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  seatButtonDisabled: {
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  seatCount: {
    alignItems: "center",
    marginHorizontal: 32,
  },
  seatCountText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
  },
  seatCountLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  seatLimit: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6366f1",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  bookButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});

export default BookingScreen;
