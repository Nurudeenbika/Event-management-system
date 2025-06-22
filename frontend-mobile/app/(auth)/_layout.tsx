// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="loginAdmin" />
      <Stack.Screen name="registerAdmin" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
