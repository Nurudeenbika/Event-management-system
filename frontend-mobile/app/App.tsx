//index.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { EventProvider } from "../src/contexts/EventContext";
import { BookingProvider } from "../src/contexts/BookingContext";
import AuthNavigator from "../src/navigation/AuthNavigator";
import MainNavigator from "../src/navigation/MainNavigator";
import LoadingScreen from "../src/screens/LoadingScreen";

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <BookingProvider>
          <AppContent />
          <StatusBar style="auto" />
        </BookingProvider>
      </EventProvider>
    </AuthProvider>
  );
}
