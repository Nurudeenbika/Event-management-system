import React, { useState, useEffect } from "react";
import {
  Appearance,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  ColorSchemeName,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { MaterialIcons, Feather, AntDesign } from "@expo/vector-icons";
import { apiService, Event, UpdateEventData } from "@/src/services/api";

interface Theme {
  text: string;
  background: string;
  placeholder: string;
  tint?: string;
  icon?: string;
  tabIconDefault?: string;
  tabIconSelected?: string;
}

const EditEventScreen: React.FC = () => {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
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

  // Load event data and other initial data
  useEffect(() => {
    if (id) {
      loadEventData();
      loadCategories();
      loadLocations();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvent(id!);

      if (response.success && response.data) {
        const eventData = response.data.event;
        setEvent(eventData);

        // Populate form fields
        setEventTitle(eventData.title);
        setEventDescription(eventData.description);

        // Format date for input (YYYY-MM-DD)
        const eventDate = new Date(eventData.date);
        setEventDate(eventDate.toISOString());
        setEventTime(eventData.time);
        setEventVenue(eventData.venue);
        setEventLocation(eventData.location);
        setEventCategory(eventData.category);
        setEventPrice(eventData.price.toString());
        setTotalSeats(eventData.totalSeats.toString());
        setAvailableSeats(eventData.availableSeats.toString());
      } else {
        Alert.alert("Error", response.error || "Failed to load event data");
        router.back();
      }
    } catch (error) {
      console.error("Error loading event:", error);
      Alert.alert("Error", "Failed to load event data");
      router.back();
    } finally {
      setLoading(false);
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

  const handleUpdateEvent = async () => {
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
      !availableSeats
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate that available seats doesn't exceed total seats
    const totalSeatsNum = parseInt(totalSeats);
    const availableSeatsNum = parseInt(availableSeats);

    if (availableSeatsNum > totalSeatsNum) {
      Alert.alert("Error", "Available seats cannot exceed total seats");
      return;
    }

    // Validate price
    const priceNum = parseFloat(eventPrice);
    if (priceNum < 0) {
      Alert.alert("Error", "Price cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const eventData: UpdateEventData = {
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        venue: eventVenue,
        location: eventLocation,
        category: eventCategory,
        price: priceNum,
        totalSeats: totalSeatsNum,
        availableSeats: availableSeatsNum,
      };

      const response = await apiService.updateEvent(id!, eventData);

      if (response.success) {
        Alert.alert("Success", "Event updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? All changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading event data...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.form}
        >
          <Text style={styles.sectionTitle}>Event Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor={theme.placeholder}
              value={eventTitle}
              onChangeText={setEventTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter event description"
              placeholderTextColor={theme.placeholder}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <Text style={styles.sectionTitle}>Date & Time</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.placeholder}
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={theme.placeholder}
                value={eventTime}
                onChangeText={setEventTime}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Venue</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter venue name"
              placeholderTextColor={theme.placeholder}
              value={eventVenue}
              onChangeText={setEventVenue}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor={theme.placeholder}
              value={eventLocation}
              onChangeText={setEventLocation}
            />
          </View>

          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category"
              placeholderTextColor={theme.placeholder}
              value={eventCategory}
              onChangeText={setEventCategory}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price (₦)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={theme.placeholder}
              value={eventPrice}
              onChangeText={setEventPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Total Seats</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={theme.placeholder}
                value={totalSeats}
                onChangeText={setTotalSeats}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Available Seats</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={theme.placeholder}
                value={availableSeats}
                onChangeText={setAvailableSeats}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateEvent}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#1C1C1E" : "#E5E5EA",
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    form: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      marginTop: 32,
      marginBottom: 20,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
    },
    saveButton: {
      backgroundColor: "#007AFF",
    },
    cancelButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    cancelButtonText: {
      color: theme.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
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
      backgroundColor: theme.background,
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginTop: 16,
      marginBottom: 24,
    },
  });

export default EditEventScreen;
