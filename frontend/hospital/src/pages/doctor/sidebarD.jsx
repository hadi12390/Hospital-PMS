import styles from "./Dashboard.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const MENU_ITEMS = [
  {
    id: "appointment",
    label: "Dashboard",
    icon: "/assest/doctor/sidebar/col-right-svgrepo-com 1.svg",
    path: "/doctor/dashboard",
  },
  {
    id: "myPatients",
    label: "My Patients",
    icon: "/assest/doctor/sidebar/person.svg",
    path: "/doctor/mypatients",
  },
  {
    id: "patientInfo",
    label: "My Appointments",
    icon: "/assest/doctor/sidebar/dwajdoies.svg",
    path: "/doctor/myappointments",
  },
  {
    id: "mySchedule",
    label: "My Schedule",
    icon: "/assest/doctor/sidebar/TAQWI.svg",
    path: "/doctor/myschedule",
  },
];

const OTHER_MENU_ITEMS = [
  {
    id: "help",
    label: "Help & Center",
    icon: "/assest/doctor/sidebar/SVGRepo_iconCarrier (1).svg",
    path: "/doctor/help",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "/assest/doctor/sidebar/SVGRepo_iconCarrier.svg",
    path: "/doctor/settings",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <aside className={styles.sideBar}>
      <img src="/assest/doctor/sidebar/logo.svg" alt="Logo" />

      <p className={styles.optName}>MENU</p>

      <div className={styles.optionsContainer}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.options} ${
              isActive(item.path) ? styles.activeOption : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <p className={styles.optName}>OTHER MENU</p>

      <div className={styles.optionsContainer}>
        {OTHER_MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.options} ${styles.otherMenu} ${
              isActive(item.path) ? styles.activeOption : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;