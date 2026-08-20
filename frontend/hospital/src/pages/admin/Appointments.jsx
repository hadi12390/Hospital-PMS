import styles from "./Dashboard.module.css";
import layoutStyles from "./ManageDoctors.module.css";
import mvmodStyles from "./ManagePatient.module.css";


import { useRef, useState ,useMemo } from "react"
import RevenueOverview from './RevenueOverview/RevenueOverview';
import Sidebar from './Sidebar';

import AddPatientModal from "./AddPatientModal";
import AddAppointmentModal from "./ManageAppointments/AddAppointmentModal.jsx";

import Search from "../../assets/manager/search.svg?react";
import Person from "../../assets/manager/person.svg?react";
import ArrowDown from "../../assets/manager/arrowdown.svg?react";
import Dot from "../../assets/manager/dot.svg?react";
import Gear from "../../assets/manager/gear.svg?react";
import Plus from "../../assets/manager/plus.svg?react";

import Save from "../../assets/manager/approvedM.svg?react";
import Approved from "../../assets/manager/saveM.svg?react";
import Calender from "../../assets/manager/calenderM.svg?react";




import PatientTable from "./ManageAppointments/AppointmentsTable.jsx";

// TODO: these should come from the same source of truth as
// AppointmentsTable's appointment data (a shared context, a store, or a
// fetch) so the Add-Appointment form always reflects real patients/doctors.
// Hardcoded here for now so the modal has something to show.
const patientOptions = [
  "Mia Quien", "Adam Smith", "Lara Johnson", "Omar Khalil", "Sara Ahmad",
  "Daniel Brown", "Lina Adel", "Noah Wilson", "John Doe", "Emily Davis",
];
const doctorOptions = ["Dr.Jessica Smeeth"];
const typeOptions = ["Consultation", "Follow Up", "Check Up", "Surgery"];




function ManageAppointment() {
  // ---------- Date helpers ----------
  function getCurrentDate() {
    const date = new Date();
    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  }

  function getFormattedDate() {
    const date = new Date();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const month = months[date.getMonth()];

    function getSuffix(day) {
      if (day > 3 && day < 21) return "th";

      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    return {
      dayName,
      dayNumber,
      suffix: getSuffix(dayNumber),
      month,
    };
  }

  function handleDateChange(e) {
    const value = e.target.value;

    if (!value) {
      setCurrentDate("");
      return;
    }

    const [year, month, day] = value.split("-");
    setCurrentDate(`${day} / ${month} / ${year}`);
  }

  function formatTime(time) {
    let [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
  }

  // ---------- State ----------
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [showMenu, setShowMenu] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const dateInput = useRef();

  const [selectedDate, setSelectedDate] = useState(null);

  const [pickedDate, setPickedDate] = useState("");

  function handleDateChange(e) {
    const value = e.target.value; // "YYYY-MM-DD"
    if (!value) {
      setPickedDate("");
      return;
    }
    const [year, month, day] = value.split("-");
    setPickedDate(`${day} / ${month} / ${year}`);
    if (onDateChange) onDateChange(value);
  }

  function handleSavePatient(patientData) {
    const newPatient = patientData; 
    console.log("New patient saved:", newPatient);
  }

  function handleAddAppointment(appointmentData) {
    // TODO: push this into the same data source AppointmentsTable reads
    // from (context/store/API) so the new appointment actually shows up
    // in the table. Logging for now.
    console.log("New appointment added:", appointmentData);
  }


  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* Right Side */}
      <section className={styles.dashboardContent}>
        {/* Navbar */}
        <nav className={`${styles.nav} ${layoutStyles.navContent}`}>
          <div className={layoutStyles.pageanme}>
            <Gear/>
            Manage Appointments
          </div>
          <div className={`${styles.navContent}`}>
            
            <div className={styles.buttonAddAppoi}>
              
              <button onClick={() => setShowAddAppointment(true)}>
                <img src="/assest/doctor/cards/Add.svg" alt="Add" />
                Appointment
              </button>
            </div>

            <img src="/assest/doctor/cards/LIne3.svg" alt="" />

            <div className={styles.profileSec}>
              <div className={styles.profilePic}>M</div>

              <button
              
                className={styles.profBut}
                onClick={() => setShowMenu(!showMenu)}
              >
                <img src="/assest/doctor/cards/dropDown.svg" alt="Dropdown" />
              </button>

              {showMenu && (
                <div className={styles.dropdownMenu}>
                  <button>
                    <img
                      width="40%"
                      src="/assest/doctor/cards/log-out.svg"
                      alt="a"
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.cards}>

          <div className={layoutStyles.statsRow}>
            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Total</p>
              <p className={layoutStyles.statValue}>94</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Cancelled </p>
              <p className={layoutStyles.statValue}>10</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Pending </p>
              <p className={layoutStyles.statValue}>4</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Confarimed </p>
              <p className={layoutStyles.statValue}>4</p>
            </div>
            
            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Appointments</p>
              <p className={layoutStyles.statValue}>12</p>
            </div>
          </div>

          <PatientTable/>
            {showAddPatient && (
            <AddPatientModal
              onClose={() => setShowAddPatient(false)}
              onSave={handleSavePatient}
            />
          )}

          {showAddAppointment && (
            <AddAppointmentModal
              patients={patientOptions}
              doctors={doctorOptions}
              types={typeOptions}
              onClose={() => setShowAddAppointment(false)}
              onAdd={handleAddAppointment}
            />
          )}
        </main>
      </section>
    </div>
  );
}

export default ManageAppointment;