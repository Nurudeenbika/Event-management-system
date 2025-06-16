import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../../types";

interface UserProfile extends User {
  phone: string;
  avatar: string;
  totalBookings: number;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
  };
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({
    _id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    createdAt: "2024-01-15T10:00:00Z",
    phone: "+1 (555) 123-4567",
    avatar: "https://via.placeholder.com/150",
    totalBookings: 5,
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: false,
    },
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedPhone, setEditedPhone] = useState(user.phone);

  const handleEditProfile = () => {
    setEditedName(user.name);
    setEditedPhone(user.phone);
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    setUser((prev) => ({
      ...prev,
      name: editedName,
      phone: editedPhone,
    }));
    setEditModalVisible(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handlePreferenceChange = (
    key: keyof UserProfile["preferences"],
    value: boolean
  ) => {
    setUser((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Handle logout logic here
          Alert.alert("Logged Out", "You have been successfully logged out.");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your account has been deleted.");
          },
        },
      ]
    );
  };

  const ProfileSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const ProfileRow = ({
    icon,
    title,
    value,
    onPress,
    showArrow = false,
    rightElement,
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.profileRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileRowLeft}>
        <Ionicons name={icon as any} size={20} color="#6366f1" />
        <View style={styles.profileRowText}>
          <Text style={styles.profileRowTitle}>{title}</Text>
          {value && <Text style={styles.profileRowValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.profileRowRight}>
        {rightElement}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.avatarEditButton}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>
      </View>

      {/* Profile Information */}
      <ProfileSection title="Profile Information">
        <ProfileRow
          icon="person-outline"
          title="Full Name"
          value={user.name}
          onPress={handleEditProfile}
          showArrow
        />
        <ProfileRow icon="mail-outline" title="Email" value={user.email} />
        <ProfileRow
          icon="call-outline"
          title="Phone"
          value={user.phone}
          onPress={handleEditProfile}
          showArrow
        />
        <ProfileRow
          icon="create-outline"
          title="Edit Profile"
          onPress={handleEditProfile}
          showArrow
        />
      </ProfileSection>

      {/* Preferences */}
      <ProfileSection title="Preferences">
        <ProfileRow
          icon="mail"
          title="Email Notifications"
          rightElement={
            <Switch
              value={user.preferences.emailNotifications}
              onValueChange={(value) =>
                handlePreferenceChange("emailNotifications", value)
              }
              trackColor={{ false: "#d1d5db", true: "#6366f1" }}
              thumbColor="white"
            />
          }
        />
        <ProfileRow
          icon="notifications"
          title="Push Notifications"
          rightElement={
            <Switch
              value={user.preferences.pushNotifications}
              onValueChange={(value) =>
                handlePreferenceChange("pushNotifications", value)
              }
              trackColor={{ false: "#d1d5db", true: "#6366f1" }}
              thumbColor="white"
            />
          }
        />
        <ProfileRow
          icon="moon"
          title="Dark Mode"
          rightElement={
            <Switch
              value={user.preferences.darkMode}
              onValueChange={(value) =>
                handlePreferenceChange("darkMode", value)
              }
              trackColor={{ false: "#d1d5db", true: "#6366f1" }}
              thumbColor="white"
            />
          }
        />
      </ProfileSection>

      {/* Support & Info */}
      <ProfileSection title="Support & Information">
        <ProfileRow
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() =>
            Alert.alert("Help", "Contact support at support@example.com")
          }
          showArrow
        />
        <ProfileRow
          icon="information-circle-outline"
          title="About"
          onPress={() => Alert.alert("About", "Event Booking App v1.0.0")}
          showArrow
        />
        <ProfileRow
          icon="document-text-outline"
          title="Terms & Privacy"
          onPress={() => Alert.alert("Terms", "Terms and Privacy Policy")}
          showArrow
        />
      </ProfileSection>

      {/* Account Actions */}
      <ProfileSection title="Account">
        <ProfileRow
          icon="log-out-outline"
          title="Logout"
          onPress={handleLogout}
          showArrow
        />
        <ProfileRow
          icon="trash-outline"
          title="Delete Account"
          onPress={handleDeleteAccount}
          showArrow
        />
      </ProfileSection>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={editedPhone}
                onChangeText={setEditedPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "white",
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e7eb",
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6366f1",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    marginHorizontal: 24,
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  profileRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileRowText: {
    marginLeft: 16,
    flex: 1,
  },
  profileRowTitle: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  profileRowValue: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  profileRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalCancel: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  modalSave: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  modalContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
});

export default ProfileScreen;
