import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../types";
import { apiClient } from "../utils/api";
import { storage } from "../utils/storage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await storage.getItem("authToken");
      const storedUser = await storage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });

      setUser(response.data.user);
      setToken(response.data.token);

      await storage.setItem("authToken", response.data.token);
      await storage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        password,
      });

      setUser(response.user);
      setToken(response.token);

      await storage.setItem("authToken", response.token);
      await storage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Make API call to request password reset
      const response = await apiClient.post("/auth/reset-password", {
        email,
      });

      // Return success message or any relevant data
      return {
        success: true,
        message: response.message || "Password reset email sent successfully",
      };
    } catch (error) {
      // Handle different types of errors
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object"
      ) {
        const response = (error as any).response;
        if (response?.status === 404) {
          throw new Error("No account found with this email address");
        } else if (response?.status === 429) {
          throw new Error("Too many reset attempts. Please try again later");
        } else if (response?.data?.message) {
          throw new Error(response.data.message);
        }
      }
      throw new Error("Failed to send password reset email. Please try again");
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);

      await storage.removeItem("authToken");
      await storage.removeItem("user");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
