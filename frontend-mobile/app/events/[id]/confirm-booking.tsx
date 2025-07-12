//app/events/[id]/confirm-booking.tsx
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

interface BookingForm {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

const ConfirmBookingScreen: React.FC = () => {
  const { user } = useAuth();
  const { id, seats } = useLocalSearchParams<{ id: string; seats: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [booking, setBooking] = useState<boolean>(false);
  const [formData, setFormData] = useState<BookingForm>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    specialRequests: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<BookingForm>>({});

  const seatsToBook = parseInt(seats || "1");
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

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingForm> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact name is required";
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "Emergency contact phone is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = "Please enter a valid emergency phone number";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmBooking = async () => {
    if (!event || !user) return;

    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
      return;
    }

    Alert.alert(
      "Confirm Booking",
      `Confirm booking for ${seatsToBook} seat(s) at ${
        event.title
      }?\n\nTotal: ₦${(event.price * seatsToBook).toLocaleString()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Pay",
          onPress: async () => {
            try {
              setBooking(true);
              const response = await apiService.createBooking({
                event: event._id,
                seatsBooked: seatsToBook,
                bookingDetails: {
                  fullName: formData.fullName,
                  email: formData.email,
                  phone: formData.phone,
                  emergencyContact: formData.emergencyContact,
                  emergencyPhone: formData.emergencyPhone,
                  specialRequests: formData.specialRequests,
                  agreeToTerms: formData?.agreeToTerms,
                },
              });

              if (response.success && response.data) {
                // Show success alert and redirect to bookings
                Alert.alert(
                  "Booking Successful!",
                  `Your booking for ${event.title} has been confirmed. You will receive a confirmation email shortly.`,
                  [
                    {
                      text: "View My Bookings",
                      onPress: () => router.push("/bookings"),
                    },
                  ]
                );
                console.log("response.data.event:", response.data.event);
                //console.log("response.success:", response.success);
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to create booking"
                );
                console.error(
                  "Booking error:",
                  response.error || "Unknown error"
                );
                console.log("Booking API response:", response);
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

  const updateField = (field: keyof BookingForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Summary */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.eventSummary}
        >
          <Text style={styles.sectionTitle}>Event Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.summaryRow}>
              <Feather name="calendar" size={16} color={theme.text} />
              <Text style={styles.summaryText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="map-pin" size={16} color={theme.text} />
              <Text style={styles.summaryText}>
                {event.venue}, {event.location}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="users" size={16} color={theme.text} />
              <Text style={styles.summaryText}>
                {seatsToBook} {seatsToBook === 1 ? "seat" : "seats"}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.priceRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                ₦{(event.price * seatsToBook).toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Booking Information Form */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(800)}
          style={styles.formContainer}
        >
          <Text style={styles.sectionTitle}>Booking Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(text) => updateField("fullName", text)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.placeholder}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              placeholder="Enter your email address"
              placeholderTextColor={theme.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => updateField("phone", text)}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.placeholder}
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact Name *</Text>
            <TextInput
              style={[
                styles.input,
                errors.emergencyContact && styles.inputError,
              ]}
              value={formData.emergencyContact}
              onChangeText={(text) => updateField("emergencyContact", text)}
              placeholder="Enter emergency contact name"
              placeholderTextColor={theme.placeholder}
            />
            {errors.emergencyContact && (
              <Text style={styles.errorText}>{errors.emergencyContact}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact Phone *</Text>
            <TextInput
              style={[styles.input, errors.emergencyPhone && styles.inputError]}
              value={formData.emergencyPhone}
              onChangeText={(text) => updateField("emergencyPhone", text)}
              placeholder="Enter emergency contact phone"
              placeholderTextColor={theme.placeholder}
              keyboardType="phone-pad"
            />
            {errors.emergencyPhone && (
              <Text style={styles.errorText}>{errors.emergencyPhone}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.specialRequests}
              onChangeText={(text) => updateField("specialRequests", text)}
              placeholder="Any special requirements or requests..."
              placeholderTextColor={theme.placeholder}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                updateField("agreeToTerms", !formData.agreeToTerms)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.agreeToTerms && styles.checkboxChecked,
                ]}
              >
                {formData.agreeToTerms && (
                  <AntDesign name="check" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms and Conditions</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.agreeToTerms && (
              <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Confirm Button */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(800)}
        style={styles.confirmButtonContainer}
      >
        <TouchableOpacity
          style={[
            styles.confirmButton,
            booking && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={booking}
        >
          {booking ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.confirmButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirm & Pay ₦{(event.price * seatsToBook).toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
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
      fontSize: 12,
      color: "#FF3B30",
      marginTop: 4,
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
    eventSummary: {
      margin: 20,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    summaryCard: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 14,
      color: theme.text,
      marginLeft: 8,
      flex: 1,
    },
    priceRow: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
      justifyContent: "space-between",
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#007AFF",
    },
    formContainer: {
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
      margin: 20,
      marginTop: 10,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
    },
    inputError: {
      borderColor: "#FF3B30",
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    termsContainer: {
      marginTop: 10,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
      borderRadius: 4,
      marginRight: 12,
      marginTop: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: "#007AFF",
      borderColor: "#007AFF",
    },
    termsText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
      lineHeight: 20,
    },
    termsLink: {
      color: "#007AFF",
      textDecorationLine: "underline",
    },
    confirmButtonContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    confirmButton: {
      backgroundColor: "#34C759",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    confirmButtonDisabled: {
      backgroundColor: "#8E8E93",
    },
    confirmButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
    },
    loadingButton: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

export default ConfirmBookingScreen;
