import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  allowedRole,
  children,
  allowIncompletePatient = false,
}) {
  const {
    user,
    loading,
    patientIncomplete,
  } = useAuth();

  // Authentication still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // --------------------------------------------------
  // PATIENT ROUTES
  // --------------------------------------------------
  if (user.role === "patient") {

    // Registration page is always allowed
    if (allowIncompletePatient) {
      return children;
    }

    // We haven't checked patient information yet
    if (patientIncomplete === null) {
      return <div>Checking patient information...</div>;
    }

    // Patient has incomplete information
    if (patientIncomplete === true) {
      return <Navigate to="/patient&register" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
