import React, { useState } from "react";
import {
  Appearance,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Colors } from "../../constants/Colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const colorScheme = Appearance.getColorScheme();

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInUp.duration(800)}
        style={styles.logoContainer}
      >
        <MaterialIcons name="event" size={28} color={theme.text} />
        <Text style={styles.brand}>Vasrefil Event Management</Text>
      </Animated.View>
      {/* <Animated.Text
        entering={FadeInUp.delay(300).duration(800)}
        style={styles.title}
      >
        Login
      </Animated.Text> */}
      {/* <Text style={styles.title}>Login</Text> */}

      <TextInput
        style={styles.input}
        placeholder="Email"
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
        onPress={() => router.push("/(auth)/forgot-password")} // or your desired route
        style={{ alignSelf: "flex-end", marginBottom: 15 }}
      >
        <Text style={[styles.linkText, { fontSize: 14 }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.linkText}>
          Don&apos;t have an account? Register
        </Text>
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
