import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import DoctorDashboard from "../pages/doctor/Dashboard";
import PatientHome from "../pages/patient/Home";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/patient/home" element={<PatientHome />} />
    </Routes>
  );
}

export default AppRoutes;