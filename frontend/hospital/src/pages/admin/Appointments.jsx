import styles from "./Dashboard.module.css";
import { useRef, useState ,useMemo } from "react"
import RevenueOverview from './RevenueOverview/RevenueOverview';
import Sidebar from './Sidebar';


function Appointment() {
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



  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* Right Side */}
      <section className={styles.dashboardContent}>
        {/* Navbar */}
        <nav className={styles.nav}>
          <div className={styles.navContent}>
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
        
        </main>
      </section>
    </div>
  );
}

export default Appointment;