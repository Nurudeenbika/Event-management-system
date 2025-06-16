import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Event, EventContextType, EventFilters } from "../types";
// Define types

// Create context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Initial filters
const initialFilters: EventFilters = {
  category: "",
  location: "",
  priceRange: [0, 100000],
  dateRange: [null, null],
  searchQuery: "",
};

// Provider component
export const EventProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filters, setFiltersState] = useState<EventFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/events`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure we always have an array
      const eventsArray = Array.isArray(data?.data?.events)
        ? data.data.events
        : Array.isArray(data?.events)
        ? data.events
        : Array.isArray(data)
        ? data
        : [];

      setEvents(eventsArray);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
      // Set events to empty array on error to prevent iteration issues
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters function
  const applyFilters = () => {
    try {
      // Ensure events is always an array before filtering
      if (!Array.isArray(events)) {
        console.warn("Events is not an array:", events);
        setFilteredEvents([]);
        return;
      }

      let filtered = [...events];

      // Apply category filter
      if (filters.category) {
        filtered = filtered.filter(
          (event) =>
            event.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Apply location filter
      if (filters.location) {
        filtered = filtered.filter((event) =>
          event.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Apply price range filter
      if (filters.priceRange) {
        filtered = filtered.filter(
          (event) =>
            event.price >= filters.priceRange[0] &&
            event.price <= filters.priceRange[1]
        );
      }

      // Apply search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (event) =>
            event.title?.toLowerCase().includes(query) ||
            event.description?.toLowerCase().includes(query) ||
            event.venue?.toLowerCase().includes(query)
        );
      }

      // Apply date range filter
      if (filters.dateRange[0] && filters.dateRange[1]) {
        filtered = filtered.filter((event) => {
          const eventDate = new Date(event.date);
          return (
            eventDate >= filters.dateRange[0]! &&
            eventDate <= filters.dateRange[1]!
          );
        });
      }

      setFilteredEvents(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
      setFilteredEvents([]);
    }
  };

  // Set filters function
  const setFilters = (newFilters: Partial<EventFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear filters function
  const clearFilters = () => {
    setFiltersState(initialFilters);
  };

  // Refresh events function
  const refreshEvents = async () => {
    await fetchEvents();
  };

  // Apply filters whenever events or filters change
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const value: EventContextType = {
    events,
    filteredEvents,
    filters,
    loading,
    error,
    fetchEvents,
    setFilters,
    clearFilters,
    refreshEvents,
    searchQuery: "",
    selectedCategory: "",
    selectedDate: "",
    sortBy: "",
    searchEvents: function (query: string): void {
      throw new Error("Function not implemented.");
    },
    filterByCategory: function (category: string): void {
      throw new Error("Function not implemented.");
    },
    filterByDate: function (date: string): void {
      throw new Error("Function not implemented.");
    },
    sortEvents: function (sortBy: string): void {
      throw new Error("Function not implemented.");
    },
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

// Custom hook to use event context
export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};

export default EventContext;

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import { Event, EventContextType } from "../types";
// import { apiClient } from "../utils/api";

// const EventContext = createContext<EventContextType | undefined>(undefined);

// export const useEvents = () => {
//   const context = useContext(EventContext);
//   if (!context) {
//     throw new Error("useEvents must be used within an EventProvider");
//   }
//   return context;
// };

// interface EventProviderProps {
//   children: ReactNode;
// }

// export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [sortBy, setSortBy] = useState("date");

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [events, searchQuery, selectedCategory, selectedDate, sortBy]);

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await apiClient.get("/events");
//       setEvents(response.events);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...events];

//     // Search filter
//     if (searchQuery) {
//       filtered = filtered.filter(
//         (event) =>
//           event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           event.location.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Category filter
//     if (selectedCategory) {
//       filtered = filtered.filter(
//         (event) => event.category === selectedCategory
//       );
//     }

//     // Date filter
//     if (selectedDate) {
//       filtered = filtered.filter((event) => {
//         const eventDate = new Date(event.date).toDateString();
//         const filterDate = new Date(selectedDate).toDateString();
//         return eventDate === filterDate;
//       });
//     }

//     // Sort
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case "date":
//           return new Date(a.date).getTime() - new Date(b.date).getTime();
//         case "title":
//           return a.title.localeCompare(b.title);
//         case "price":
//           return a.price - b.price;
//         case "availability":
//           return b.availableSeats - a.availableSeats;
//         default:
//           return 0;
//       }
//     });

//     setFilteredEvents(filtered);
//   };

//   const searchEvents = (query: string) => {
//     setSearchQuery(query);
//   };

//   const filterByCategory = (category: string) => {
//     setSelectedCategory(category);
//   };

//   const filterByDate = (date: string) => {
//     setSelectedDate(date);
//   };

//   const sortEvents = (sort: string) => {
//     setSortBy(sort);
//   };

//   const clearFilters = () => {
//     setSearchQuery("");
//     setSelectedCategory("");
//     setSelectedDate("");
//     setSortBy("date");
//   };

//   const value: EventContextType = {
//     events,
//     loading,
//     error,
//     filteredEvents,
//     searchQuery,
//     selectedCategory,
//     selectedDate,
//     sortBy,
//     fetchEvents,
//     searchEvents,
//     filterByCategory,
//     filterByDate,
//     sortEvents,
//     clearFilters,
//   };

//   return (
//     <EventContext.Provider value={value}>{children}</EventContext.Provider>
//   );
// };
