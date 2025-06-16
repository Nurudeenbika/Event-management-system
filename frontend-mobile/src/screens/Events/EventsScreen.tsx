import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { EventsStackParamList } from "../../navigation/MainNavigator";
import { useEvents } from "../../contexts/EventContext";
import { Event } from "../../types";
import { Ionicons } from "@expo/vector-icons";

type EventsScreenNavigationProp = StackNavigationProp<
  EventsStackParamList,
  "EventsList"
>;

interface Props {
  navigation: EventsScreenNavigationProp;
}

const EventsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    filteredEvents,
    loading,
    error,
    searchQuery,
    selectedCategory,
    selectedDate,
    sortBy,
    fetchEvents,
    searchEvents,
    filterByCategory,
    filterByDate,
    sortEvents,
    clearFilters,
  } = useEvents();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = () => {
    fetchEvents();
  };

  const categories = [
    "Music",
    "Sports",
    "Technology",
    "Art",
    "Food",
    "Business",
  ];
  const sortOptions = [
    { label: "Date", value: "date" },
    { label: "Title", value: "title" },
    { label: "Price", value: "price" },
    { label: "Availability", value: "availability" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`;
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
      )}
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.eventPrice}>{formatPrice(item.price)}</Text>
        </View>

        <Text style={styles.eventCategory}>{item.category}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailItem}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.eventDetailText}>
              {formatDate(item.date)} at {item.time}
            </Text>
          </View>

          <View style={styles.eventDetailItem}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.eventDetailItem}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.eventDetailText}>
              {item.availableSeats} seats left
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Categories</Text>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => filterByCategory("")}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => filterByCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sort By</Text>
          <View style={styles.sortContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortChip,
                  sortBy === option.value && styles.sortChipActive,
                ]}
                onPress={() => sortEvents(option.value)}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === option.value && styles.sortChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={clearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={searchEvents}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter-outline" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {renderFilters()}

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  categoryChipActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#6b7280",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  sortContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  sortChipActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  sortChipText: {
    fontSize: 14,
    color: "#6b7280",
  },
  sortChipTextActive: {
    color: "#fff",
  },
  clearFiltersButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  clearFiltersText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f3f4f6",
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 8,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6366f1",
  },
  eventCategory: {
    fontSize: 12,
    color: "#6366f1",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export default EventsScreen;
