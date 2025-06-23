import React, { useState } from "react";
import {
  Appearance,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Colors } from "../../../constants/Colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function AdminLoginScreen() {
  const [name, setName] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAdmin, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginAdmin(email, password);

      // Check if user is admin after login
      if (user?.role !== "admin") {
        throw new Error("Only admin users can access this portal");
      }

      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.error("Admin login failed:", error);
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Failed to login as admin"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInUp.duration(800)}
        style={styles.logoContainer}
      >
        <MaterialIcons name="event" size={28} color={theme.text} />
        <Text style={styles.brand}>Vasrefil Admin Portal</Text>
      </Animated.View>

      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/forgot-password")}
        style={{ alignSelf: "flex-end", marginBottom: 15 }}
      >
        <Text style={[styles.linkText, { fontSize: 14 }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Admin Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/admin/register")}>
        <Text style={styles.linkText}>Need admin access? Register Admin</Text>
      </TouchableOpacity>
    </View>
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
      justifyContent: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
      marginBottom: 30,
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "papayawhip" : "#000",
      padding: 10,
      color: theme.text,
      marginBottom: 15,
      borderRadius: 5,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "papayawhip" : "#000",
      paddingHorizontal: 10,
      borderRadius: 5,
      marginBottom: 15,
    },
    passwordInput: {
      flex: 1,
      paddingVertical: 10,
      color: theme.text,
    },
    button: {
      backgroundColor: "#007AFF",
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 15,
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
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    linkText: {
      textAlign: "center",
      color: "#007AFF",
    },
  });
}
