import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const response = await apiFetch("/accounts/me/", {
        method: "GET",
      });

      console.log("ME status:", response.status);
      console.log("ME ok:", response.ok);

      const data = await response.json();

      console.log("ME response:", data);

      if (!response.ok) {
        setUser(null);
        return null;
      }

      setUser(data);

      return data;

    } catch (error) {
      console.error("Failed to get current user:", error);
      setUser(null);
      return null;

    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const hostname = window.location.hostname;

      const response = await fetch(
        `http://${hostname}:8000/dj-rest-auth/logout/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Logout status:", response.status);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Logout failed: ${response.status} ${text}`);
      }

      setUser(null);

      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        getCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}