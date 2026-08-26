import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // User is already logged in
  if (user) {
    if (user.role === "manager") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "doctor") {
      return <Navigate to="/doctor/dashboard" replace />;
    }

    if (user.role === "patient") {
      return <Navigate to="/patient/home" replace />;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  // User is not logged in
  return children;
}

export default GuestRoute;