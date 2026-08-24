import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const DEFAULT_MENU_ITEMS = [
  {
    id: "dashboard",
    label: "DashBoard",
    icon: "/assest/doctor/sidebar/col-right-svgrepo-com 1.svg",
    to: "/admin/dashboard", 
  },
  {
    id: "doctors",
    label: "Manage Doctors",
    icon: "/assest/doctor/sidebar/person.svg",
    to: "/admin/manage&doctors",
  },
  {
    id: "patients",
    label: "Manage Patients",
    icon: "/assest/doctor/sidebar/dwajdoies.svg",
    to: "/admin/manage&patients",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: "/assest/doctor/sidebar/SVGRepo_iconCarriear.svg",
    to: "/admin/appointments",
  },
];

const DEFAULT_OTHER_MENU_ITEMS = [
  {
    id: "help",
    label: "Help & Center",
    icon: "/assest/doctor/sidebar/SVGRepo_iconCarrier (1).svg",
    to: "/admin/help",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "/assest/doctor/sidebar/SVGRepo_iconCarrier.svg",
    to: "/admin/settings",
  },
];

/**
 * Shared dashboard sidebar. Same menu everywhere by default — pass
 * `items` / `otherItems` if a specific dashboard ever needs to override them.
 *
 * Active styling is route-driven via NavLink — whichever item's `to`
 * matches the current URL gets `styles.active` automatically.
 *
 * `onSelect(id)` is optional — fires on click in addition to navigation,
 * useful for e.g. closing a mobile sidebar drawer.
 */
function Sidebar({
  logo = "/assest/doctor/sidebar/logo.svg",
  items = DEFAULT_MENU_ITEMS,
  otherItems = DEFAULT_OTHER_MENU_ITEMS,
  onSelect,
}) {
  const linkClassName = (extra = "") =>
    ({ isActive }) =>
      `${styles.options} ${extra} ${isActive ? styles.active : ""}`;

  return (
    <aside className={styles.sideBar}>
      <img src={logo} alt="Logo" />

      <p className={styles.optName}>MENU</p>

      <div className={styles.optionsContainer}>
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={linkClassName()}
            onClick={() => onSelect?.(item.id)}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <p className={styles.optName}>OTHER MENU</p>

      <div className={styles.optionsContainer}>
        {otherItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={linkClassName(styles.otherMenu)}
            onClick={() => onSelect?.(item.id)}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;