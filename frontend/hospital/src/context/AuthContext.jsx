import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // null = not checked yet
  // true = patient information is incomplete
  // false = patient information is complete
  const [patientIncomplete, setPatientIncomplete] = useState(null);

  // --------------------------------------------------
  // Check whether patient information is complete
  // --------------------------------------------------
  const checkPatientStatus = async () => {
    try {
      const hostname = window.location.hostname;

      const response = await fetch(
        `http://${hostname}:8000/add-patient/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personal_id: "",
            first_name: "",
            last_name: "",
            birth_date: null,
            gender: null,
            phone_number: "",
            blood_type: null,
          }),
        }
      );

      console.log("PATIENT CHECK STATUS:", response.status);

      if (response.status === 400) {
        console.log("PATIENT IS INCOMPLETE");
        setPatientIncomplete(true);
        return true;
      }

      if (response.status !== 400) {
        console.log("PATIENT IS COMPLETE");
        setPatientIncomplete(false);
        return false;
      }

      // Any unexpected status
      console.log("Unexpected patient status:", response.status);

      // Safer to block until we know the status
      setPatientIncomplete(true);
      return true;

    } catch (error) {
      console.error("Patient status check failed:", error);

      // Don't allow access when we don't know the status
      setPatientIncomplete(true);
      return true;
    }
  };

  // --------------------------------------------------
  // Get logged-in user
  // --------------------------------------------------
  const getCurrentUser = async () => {
    try {
      const response = await apiFetch("/accounts/me/", {
        method: "GET",
      });

      console.log("ME status:", response.status);

      const data = await response.json();

      console.log("ME response:", data);

      if (!response.ok) {
        setUser(null);
        setPatientIncomplete(null);
        return null;
      }

      setUser(data);

      // IMPORTANT:
      // If this is a patient, check their information
      if (data.role === "patient") {
        await checkPatientStatus();
      } else {
        // Doctors/managers don't need patient information
        setPatientIncomplete(false);
      }

      return data;

    } catch (error) {
      console.error("Failed to get current user:", error);

      setUser(null);
      setPatientIncomplete(null);

      return null;

    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Called after patient successfully completes form
  // --------------------------------------------------
  const completePatientRegistration = () => {
    console.log("PATIENT REGISTRATION COMPLETED");
    setPatientIncomplete(false);
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
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

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Logout failed: ${response.status} ${text}`
        );
      }

      setUser(null);
      setPatientIncomplete(null);

      console.log("Logout successful");

    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // --------------------------------------------------
  // Check authentication when application starts
  // --------------------------------------------------
  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        patientIncomplete,
        getCurrentUser,
        checkPatientStatus,
        completePatientRegistration,
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
