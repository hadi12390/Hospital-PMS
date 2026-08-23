import { Routes, Route } from "react-router-dom";

import NotFound from "../pages/auth/NotFound";
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
import HelpAdmin from "../pages/admin/Help.jsx";

import AddUserAdmin from "../pages/admin/AddUser.jsx";


import DoctorProfile from "../pages/admin/ManageDoctors/doctorprofile/DoctorProfile.jsx";
import ManageDoctorAppointments from "../pages/admin/ManageDoctors/doctorprofile/doctorappointments/DoctorAppointments.jsx";

import PatientProfile from "../pages/admin/ManagePatient/patientprofile/PatientProfile.jsx";
import ManagePatientAppointments from "../pages/admin/ManagePatient/patientprofile/appointmentappointments/Appointments.jsx";


import DoctorManagePatient from "../pages/doctor/ManagePatient.jsx";
import DoctorAppointments from "../pages/doctor/Appointments.jsx";
import DoctorSchedule from "../pages/doctor/Schedule.jsx";
import DoctorHelp from "../pages/doctor/Help.jsx";
import DoctorSettings from "../pages/doctor/Settings.jsx";
import DoctorPending from "../pages/doctor/Pending.jsx";
import AddAppointment from "../pages/doctor/AddAppointment.jsx";




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
      <Route path="/admin/manage&patients" element={<ManagePatient />} />
      <Route path="/admin/appointments" element={<AppointmentAdmin />} />
      <Route path="/admin/settings" element={<SettingsAdmin />} />
      <Route path="/admin/help" element={<HelpAdmin />} />

      <Route path="/admin/manage&doctors/doctor&profile" element={<DoctorProfile />} />
      <Route path="/admin/manage&doctors/doctor&profile/appointments" element={<ManageDoctorAppointments />} />

      <Route path="/admin/manage&patients/patient&profile" element={<PatientProfile />} />

      <Route path="/admin/manage&patients/patient&profile/appointments" element={<ManagePatientAppointments />} />
      
      <Route path="/admin/add&user" element={<AddUserAdmin />} />
    


      <Route path="/doctor/mypatients" element={<DoctorManagePatient />} />
      <Route path="/doctor/myappointments" element={<DoctorAppointments />} />
      <Route path="/doctor/myschedule" element={<DoctorSchedule />} />
      <Route path="/doctor/help" element={<DoctorHelp />} />
      <Route path="/doctor/settings" element={<DoctorSettings />} />
      <Route path="/doctor/pending" element={<DoctorPending />} />
      <Route path="/doctor/add&appointment" element={<AddAppointment/>} />



      <Route path="*" element={<NotFound />} />

      

    </Routes>
  );
}

export default AppRoutes;