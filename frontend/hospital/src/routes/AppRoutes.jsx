import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import DoctorDashboard from "../pages/doctor/Dashboard";
import PatientHome from "../pages/patient/Home";
import Register from "../pages/auth/Register";
import RestPassword from "../pages/auth/RestPassword";
import RestPasswordDone from "../pages/auth/RestPasswordDone";




function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/patient/home" element={<PatientHome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/resetpassword" element={<RestPassword />} />
      <Route path="/resetpasswordDone" element={<RestPasswordDone />} />

    </Routes>
  );
}

export default AppRoutes;