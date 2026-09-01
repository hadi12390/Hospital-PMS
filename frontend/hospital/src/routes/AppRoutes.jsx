import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import GuestRoute from "../context/GuestRoute";

import NotFound from "../pages/auth/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RestPassword from "../pages/auth/RestPassword";
import RestPasswordDone from "../pages/auth/RestPasswordDone";

import RegisterA from "../pages/auth/RegisterA";





// Admin
import AdminDashboard from "../pages/admin/Dashboard";
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
import PatientRegister from "../pages/patient/reginfo/Register.jsx";
import PatientRegisterConfirm from "../pages/patient/reginfo/RegisterConfirm.jsx";



// Doctor
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorManagePatient from "../pages/doctor/ManagePatient.jsx";
import DoctorAppointments from "../pages/doctor/Appointments.jsx";
import DoctorSchedule from "../pages/doctor/Schedule.jsx";
import DoctorHelp from "../pages/doctor/Help.jsx";
import DoctorSettings from "../pages/doctor/Settings.jsx";
import DoctorPending from "../pages/doctor/Pending.jsx";
import AddAppointment from "../pages/doctor/AddAppointment.jsx";

// Patient
import PatientHome from "../pages/patient/Home";
import AppointmentPatient from "../pages/patient/Appointmet";
import AppointmentDoctor from "../pages/patient/Doctor";
import MakeAppointment from "../pages/patient/MakeAppointment";
import Reports from "../pages/patient/Reports";
import Payment from "../pages/patient/Payment";
import Flag from "../pages/patient/Flag";
import Setting from "../pages/patient/Settings";
import Notification from "../pages/patient/Notification";


function AppRoutes() {
  return (
    <Routes>

      {/* ==================== AUTH ==================== */}

      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
  
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/resetpassword" element={<GuestRoute><RestPassword /></GuestRoute>} />
      <Route path="/resetpasswordDone" element={<GuestRoute><RestPasswordDone /></GuestRoute>} />

      <Route path="/patient&register" element={<PatientRegister />} />
      <Route path="/patient&register/confirmed" element={<PatientRegisterConfirm />} />
      

      <Route path="/register/successful" element={<RegisterA />} />

      


      {/* ==================== ADMIN ==================== */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="manager">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage&doctors"
        element={
          <ProtectedRoute allowedRole="manager">
            <ManageDoctors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage&patients"
        element={
          <ProtectedRoute allowedRole="manager">
            <ManagePatient />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRole="manager">
            <AppointmentAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRole="manager">
            <SettingsAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/help"
        element={
          <ProtectedRoute allowedRole="manager">
            <HelpAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/add&user"
        element={
          <ProtectedRoute allowedRole="manager">
            <AddUserAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage&doctors/doctor&profile"
        element={
          <ProtectedRoute allowedRole="manager">
            <DoctorProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage&doctors/doctor&profile/appointments"
        element={
          <ProtectedRoute allowedRole="manager">
            <ManageDoctorAppointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage&patients/patient&profile/:patientId"
        element={
          <ProtectedRoute allowedRole="manager">
            <PatientProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage&patients/patient&profile/appointments"
        element={
          <ProtectedRoute allowedRole="manager">
            <ManagePatientAppointments />
          </ProtectedRoute>
        }
      />


      {/* ==================== DOCTOR ==================== */}

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/mypatients"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorManagePatient />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/myappointments"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/myschedule"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorSchedule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/help"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorHelp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/settings"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/pending"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorPending />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/add&appointment"
        element={
          <ProtectedRoute allowedRole="doctor">
            <AddAppointment />
          </ProtectedRoute>
        }
      />


      {/* ==================== PATIENT ==================== */}

      <Route
        path="/patient/home"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/appointment"
        element={
          <ProtectedRoute allowedRole="patient">
            <AppointmentPatient />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/doctor"
        element={
          <ProtectedRoute allowedRole="patient">
            <AppointmentDoctor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/make&appointment"
        element={
          <ProtectedRoute allowedRole="patient">
            <MakeAppointment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/reports"
        element={
          <ProtectedRoute allowedRole="patient">
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/payment"
        element={
          <ProtectedRoute allowedRole="patient">
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/flag"
        element={
          <ProtectedRoute allowedRole="patient">
            <Flag />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/settings"
        element={
          <ProtectedRoute allowedRole="patient">
            <Setting />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/notifications"
        element={
          <ProtectedRoute allowedRole="patient">
            <Notification />
          </ProtectedRoute>
        }
      />


      {/* ==================== NOT FOUND ==================== */}

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;