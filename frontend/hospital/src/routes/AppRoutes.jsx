import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import DoctorDashboard from "../pages/doctor/Dashboard";
import PatientHome from "../pages/patient/Home";
import Register from "../pages/auth/Register";
import RestPassword from "../pages/auth/RestPassword";
import RestPasswordDone from "../pages/auth/RestPasswordDone";
import AppointmentPatient from "../pages/patient/Appointmet";
import AppointmentDoctor from "../pages/patient/Doctor";
import MakeAppointment from "../pages/patient/MakeAppointment";
import Reports from "../pages/patient/Reports";
import Payment from "../pages/patient/Payment";
import Flag from "../pages/patient/Flag";
import Setting from "../pages/patient/Settings";





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
      <Route path="/patient/appointment" element={<AppointmentPatient />} />
      <Route path="/patient/doctor" element={<AppointmentDoctor />} />
      <Route path="/patient/make&appointment" element={<MakeAppointment />} />
      <Route path="/patient/reports" element={<Reports />} />
      <Route path="/patient/payment" element={<Payment />} />
      <Route path="/patient/flag" element={<Flag />} />
      <Route path="/patient/settings" element={<Setting />} />
    </Routes>
  );
}

export default AppRoutes;