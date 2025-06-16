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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const colorScheme = Appearance.getColorScheme();

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await register(name, email, password);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Registration failed:", error);
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
      <Animated.Text
        entering={FadeInUp.delay(300).duration(800)}
        style={styles.title}
      >
        Create Account
      </Animated.Text>
      {/* <View style={styles.logoContainer}>
        <MaterialIcons
          name="event"
          size={28}
          marginButtom={40}
          color={theme.text}
        />
        <Text style={styles.brand}>Vasrefil Event Management</Text>
      </View> */}
      {/* <Text style={styles.title}>Create Account</Text> */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={theme.placeholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />
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
      {/* Confirm Password Field with Eye Icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor={theme.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Feather
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
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
    // brand: {
    //   fontSize: 20,
    //   fontWeight: "800",
    //   textTransform: "uppercase",
    //   textAlign: "center",
    //   marginBottom: 50,
    //   color: theme.text,
    // },
    linkText: {
      textAlign: "center",
      color: "#007AFF",
    },
  });
}
