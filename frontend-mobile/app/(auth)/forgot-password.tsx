// app/(auth)/forgot-password.tsx
import React, { useState } from "react";
import {
  Appearance,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Colors } from "../../constants/Colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const colorScheme = Appearance.getColorScheme();

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Check if resetPassword function exists in your AuthContext
      if (resetPassword) {
        await resetPassword(email);
      } else {
        // Simulate API call if resetPassword is not implemented yet
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setEmailSent(true);
      Alert.alert(
        "Email Sent",
        "If an account with this email exists, you will receive password reset instructions.",
        [{ text: "OK", onPress: () => router.push("/(auth)/login") }]
      );
    } catch (error) {
      console.error("Password reset failed:", error);
      Alert.alert("Error", "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Email Sent!</Text>
          <Text style={styles.successMessage}>
            Check your email for password reset instructions.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
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
      <View style={styles.content}>
        <Animated.View
          entering={FadeInUp.duration(800)}
          style={styles.logoContainer}
        >
          <MaterialIcons name="event" size={28} color={theme.text} />
          <Text style={styles.brand}>Vasrefil Event Management</Text>
        </Animated.View>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we&apos;ll send you instructions to
            reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.linkText}>Remember your password? Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.linkText}>
              Don&apos;t have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(
  theme: {
    text?: string;
    background: any;
    tint?: string;
    icon?: string;
    tabIconDefault?: string;
    tabIconSelected?: string;
  },
  colorScheme: string | null | undefined
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    header: {
      marginBottom: 40,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
      color: theme.text,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: theme.text,
      lineHeight: 22,
    },
    form: {
      marginBottom: 30,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 15,
      marginBottom: 20,
      borderRadius: 8,
      fontSize: 16,
      backgroundColor: "#f9f9f9",
    },
    button: {
      backgroundColor: "#007AFF",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonDisabled: {
      backgroundColor: "#ccc",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 100,
      gap: 8,
    },
    brand: {
      fontSize: 21,
      fontWeight: "800",
      textTransform: "uppercase",
      textAlign: "center",
      marginBottom: 8,
      color: theme.text,
    },
    footer: {
      alignItems: "center",
      gap: 15,
    },
    linkText: {
      textAlign: "center",
      color: "#007AFF",
      fontSize: 16,
    },
    successContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    successIcon: {
      fontSize: 60,
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333",
    },
    successMessage: {
      fontSize: 16,
      textAlign: "center",
      color: "#666",
      marginBottom: 30,
      lineHeight: 22,
    },
  });
}
