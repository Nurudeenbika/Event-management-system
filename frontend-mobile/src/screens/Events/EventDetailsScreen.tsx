import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { EventsStackParamList } from "../../navigation/MainNavigator";
import { Ionicons } from "@expo/vector-icons";

type EventDetailsScreenNavigationProp = StackNavigationProp<
  EventsStackParamList,
  "EventDetails"
>;
type EventDetailsScreenRouteProp = RouteProp<
  EventsStackParamList,
  "EventDetails"
>;

interface Props {
  navigation: EventDetailsScreenNavigationProp;
  route: EventDetailsScreenRouteProp;
}

const EventDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { event } = route.params;

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
    return price === 0 ? "Free Event" : `$${price.toFixed(2)}`;
  };

  const handleBookEvent = () => {
    if (event.availableSeats === 0) {
      Alert.alert("Sold Out", "This event is fully booked.");
      return;
    }
    navigation.navigate("Booking", { event });
  };

  const isEventPast = () => {
    const eventDate = new Date(`${event.date} ${event.time}`);
    return eventDate < new Date();
  };

  const isPastEvent = isEventPast();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.price}>{formatPrice(event.price)}</Text>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{event.category}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={20} color="#6366f1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="location" size={20} color="#6366f1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="people" size={20} color="#6366f1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Availability</Text>
              <Text style={styles.detailText}>
                {event.availableSeats} of {event.totalSeats} seats available
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <View style={styles.availabilityBar}>
          <View style={styles.availabilityBarBackground}>
            <View
              style={[
                styles.availabilityBarFill,
                {
                  width: `${
                    ((event.totalSeats - event.availableSeats) /
                      event.totalSeats) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.availabilityText}>
            {event.totalSeats - event.availableSeats} seats booked
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (event.availableSeats === 0 || isPastEvent) &&
              styles.bookButtonDisabled,
          ]}
          onPress={handleBookEvent}
          disabled={event.availableSeats === 0 || isPastEvent}
        >
          <Text style={styles.bookButtonText}>
            {isPastEvent
              ? "Event Has Ended"
              : event.availableSeats === 0
              ? "Sold Out"
              : "Book Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  eventImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginRight: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6366f1",
  },
  categoryContainer: {
    marginBottom: 24,
  },
  category: {
    fontSize: 14,
    color: "#6366f1",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 22,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
  },
  availabilityBar: {
    marginBottom: 20,
  },
  availabilityBarBackground: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
  },
  availabilityBarFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  bookButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default EventDetailsScreen;
