import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Appearance, ColorSchemeName } from "react-native";

interface Theme {
  text: string;
  background: string;
  placeholder: string;
}

const BookingSuccessScreen: React.FC = () => {
  const { eventId, bookingId } = useLocalSearchParams<{
    eventId: string;
    bookingId: string;
  }>();

  const colorScheme: ColorSchemeName = Appearance.getColorScheme();
  const theme: Theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(theme);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View entering={FadeInUp.duration(800)} style={styles.content}>
        <Ionicons name="checkmark-circle" size={100} color="#34C759" />
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.message}>
          Thank you for booking. Your booking ID is:
        </Text>
        <Text style={styles.bookingId}>{bookingId}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/events/${eventId}`)}
        >
          <Text style={styles.buttonText}>Back to Event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.homeButton]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: theme.background,
    },
    content: {
      alignItems: "center",
      textAlign: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 24,
    },
    message: {
      fontSize: 16,
      color: theme.text,
      textAlign: "center",
      marginTop: 12,
    },
    bookingId: {
      fontSize: 18,
      fontWeight: "600",
      color: "#007AFF",
      marginTop: 12,
    },
    button: {
      marginTop: 24,
      backgroundColor: "#007AFF",
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 10,
    },
    homeButton: {
      backgroundColor: "#5856D6",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default BookingSuccessScreen;
