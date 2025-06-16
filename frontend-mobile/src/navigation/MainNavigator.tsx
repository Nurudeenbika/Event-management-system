import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import EventsScreen from "../screens/Events/EventsScreen";
import EventDetailsScreen from "../screens/Events/EventDetailsScreen";
import BookingScreen from "../screens/Booking/BookingScreen";
import BookingHistoryScreen from "../screens/Booking/BookingHistoryScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { Event } from "../types";

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { event: Event };
  Booking: { event: Event };
};

export type BookingsStackParamList = {
  BookingHistory: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type MainTabParamList = {
  EventsTab: undefined;
  BookingsTab: undefined;
  ProfileTab: undefined;
};

const EventsStack = createStackNavigator<EventsStackParamList>();
const BookingsStack = createStackNavigator<BookingsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const EventsNavigator = () => (
  <EventsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#6366f1" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <EventsStack.Screen
      name="EventsList"
      component={EventsScreen}
      options={{ title: "Events" }}
    />
    <EventsStack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: "Event Details" }}
    />
    <EventsStack.Screen
      name="Booking"
      component={BookingScreen}
      options={{ title: "Book Event" }}
    />
  </EventsStack.Navigator>
);

const BookingsNavigator = () => (
  <BookingsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#6366f1" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <BookingsStack.Screen
      name="BookingHistory"
      component={BookingHistoryScreen}
      options={{ title: "My Bookings" }}
    />
  </BookingsStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#6366f1" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <ProfileStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Profile" }}
    />
  </ProfileStack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "EventsTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "BookingsTab") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{ title: "Events" }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsNavigator}
        options={{ title: "Bookings" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
