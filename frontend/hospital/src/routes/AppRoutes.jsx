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
import Notification from "../pages/patient/Notification";

import ManageDoctors from "../pages/admin/ManageDoctors";
import ManagePatient from "../pages/admin/ManagePatient";
import AppointmentAdmin from "../pages/admin/Appointments";
import SettingsAdmin from "../pages/admin/Settings";
import HelpAdmin from "../pages/admin/Appointments";










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
      <Route path="/patient/notifications" element={<Notification />} />

      <Route path="/admin/manage&doctors" element={<ManageDoctors />} />
      <Route path="/admin/manage&patient" element={<ManagePatient />} />
      <Route path="/admin/appointments" element={<AppointmentAdmin />} />
      <Route path="/admin/settings" element={<SettingsAdmin />} />
      <Route path="/admin/help" element={<HelpAdmin />} />


    </Routes>
  );
}

export default AppRoutes;