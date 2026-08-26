import styles from "./Dashboard.module.css";
import layoutStyles from "./ManageDoctors.module.css";
import mvmodStyles from "./ManagePatient.module.css";


import { useRef, useState, useMemo, useEffect } from "react";
import RevenueOverview from './RevenueOverview/RevenueOverview';
import Sidebar from './Sidebar';

import AddPatientModal from "./AddPatientModal";

import Search from "../../assets/manager/search.svg?react";
import Person from "../../assets/manager/person.svg?react";
import ArrowDown from "../../assets/manager/arrowdown.svg?react";
import Dot from "../../assets/manager/dot.svg?react";
import Gear from "../../assets/manager/gear.svg?react";
import Plus from "../../assets/manager/plus.svg?react";

import Save from "../../assets/manager/approvedM.svg?react";
import Approved from "../../assets/manager/saveM.svg?react";
import Calender from "../../assets/manager/calenderM.svg?react";




import PatientTable from "./ManagePatient/PatientTable.jsx";




function ManagePatient() {
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
      setPatients(prev => [...prev, patientData]);
      setShowAddPatient(false);
    }
    
    const [stats, setStats] = useState({
      total_patients: 0,
      new_patients_count: 0,
      total_appointments: 0,
      completed_appointments: 0,
      confirmed_appointments: 0,
      cancelled_appointments: 0,
    });

    const [patients, setPatients] = useState([]);

    useEffect(() => {
    async function getData() {
      try {
        const hostName = window.location.hostname;

        const response = await fetch(
          `http://${hostName}:8000/manager/manage-patients/`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        console.log("Manage Patients API:", data);

        setStats(data.stats);
        setPatients(data.patients);

      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    }

    getData();
  }, []);

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
            Manage Patients
          </div>
          <div className={`${styles.navContent}`}>
            
            <div className={styles.buttonAddAppoi}>
              
              <button>
                <img src="/assest/doctor/cards/Add.svg" alt="Add" />
                Doctor
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
              <p className={layoutStyles.statLabel}>Total Patient</p>
              <p className={layoutStyles.statValue}>{stats.total_patients}</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Today</p>
              <p className={layoutStyles.statValue}>{stats.total_appointments}</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>New This Month</p>
              <p className={layoutStyles.statValue}>{stats.new_patients_count}</p>
            </div>

            <button 
              onClick={() => setShowAddPatient(true)}
              className={`${layoutStyles.statCard} ${layoutStyles.but} `}>
              <Plus/>
              <p className={layoutStyles.statLabel}>Patient</p>
            </button>
          </div>

          <PatientTable patients={patients} />

          {showAddPatient && (
            <AddPatientModal
              onClose={() => setShowAddPatient(false)}
              onSave={handleSavePatient}
            />
          )}
        </main>
      </section>
    </div>
  );
}

export default ManagePatient;