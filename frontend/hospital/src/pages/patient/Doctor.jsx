import styles from "./Doctor.module.css";

import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";
import DownArrow from "../../assets/patient/down.svg?react";
import Blood from "../../assets/patient/blood.svg?react";
import Heart from "../../assets/patient/heart-pulse.svg?react";
import Yourdoc from "../../assets/patient/doctoer.svg?react";
import TimePast from "../../assets/patient/time-past.svg?react";
import Arrow from "../../assets/patient/arrowoo.svg?react";
import Search from "../../assets/patient/search.svg?react";
import Location from "../../assets/patient/location.svg?react";
import Status from "../../assets/patient/status.svg?react";
import Approved from "../../assets/patient/approved.svg?react";
import ExpArrow from "../../assets/patient/expArrwo.svg?react";
import Pill from "../../assets/patient/drugs.svg?react";
import Star from "../../assets/patient/star.svg?react";
import Locwhite from "../../assets/patient/locwhite.svg?react";
import Plusvec from "../../assets/patient/plusvec.svg?react";
import NotificationLogo from "../../assets/patient/notification.svg?react";


import { useRef, useState ,useEffect} from 'react';
import { NavLink } from "react-router-dom";

import AppointmentButton from "./AppointmentButton";

function PatientDoctor(){
const [apiData,setApiData] = useState([]);

useEffect(() => {
  async function getData() {
    try {
      const hostName = window.location.hostname;

      const response = await fetch(
        `http://${hostName}:8000/doctor/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      console.log(data);

      setApiData(data);

    } catch (error) {
      console.error("Failed to fetch doctor data:", error);
    }
  }

  getData();
}, []);


  const [searchValue, setSearchValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  const toggleCard = () => {
  const next = !expanded;
  setExpanded(next);

  if (next) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start", // or "center"
        });
      }, 350);
    }
  };
  return (
    <div className={`${styles.PatientDashboard}`}>

      <aside className={styles.sideBar}>
      
              {/* Logo */}
              <div className={styles.sidebarLogo}>
                  <img
                      src="/assest/patient/logo.svg"
                      alt="Logo"
                  />
              </div>
      
      
              <div className={styles.contSide}>
      
                  {/* ================= MAIN MENU ================= */}
                  <div className={styles.optionsContainer}>
      
                      {/* Home */}
                      <NavLink
                          to="/patient/home"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.homeLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <HomeLogo className={styles.homelogoicon} />
                      </NavLink>
      
      
                      {/* Appointments */}
                      <NavLink
                          to="/patient/appointment"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.appLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <AppLogo className={styles.applogoicon} />
                      </NavLink>
      
      
                      {/* Doctors */}
                      <NavLink
                          to="/patient/doctor"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.docLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <DocLogo className={styles.doclogoicon} />
                      </NavLink>
      
      
                      {/* Reports */}
                      <NavLink
                          to="/patient/reports"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.pillLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <PillLogo className={styles.pilllogoicon} />
                      </NavLink>
      
      
                      {/* Payments */}
                      <NavLink
                          to="/patient/payment"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.docuLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <DocuLogo className={styles.doculogoicon} />
                      </NavLink>
      
                  </div>
      
      
                  {/* ================= SECOND MENU ================= */}
                  <div
                      className={`${styles.optionsContainer} ${styles.optionsContainerNN}`}
                  >
      
                      {/* Help */}
                      <NavLink
                          to="/patient/flag"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.helpLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <HelpLogo className={styles.helplogoicon} />
                      </NavLink>
      
      
                      {/* Settings */}
                      <NavLink
                          to="/patient/settings"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.settLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <SettLogo className={styles.settlogoicon} />
                      </NavLink>
      
                  </div>
      
      
                  {/* ================= LOGOUT SECTION ================= */}
                  <div className={styles.logoutsec}>
      
                      <div className={`${styles.optionsContainer} ${styles.optionsContainerLL}`}>
      
                          {/* Logout */}
                          <button
                              type="button"
                              className={`${styles.options} ${styles.logoutLogoButton}`}
                          >
                              <LogOutLogo
                                  className={styles.logoutlogoicon}
                              />
                          </button>
      
      
                          {/* Notifications */}
                          <NavLink
                              to="/patient/notifications"
                              className={({ isActive }) =>
                                  `${styles.options} ${styles.notificationLogoButton} ${
                                      isActive ? styles.active : ""
                                  }`
                              }
                          >
                              <NotificationLogo
                                  className={styles.notificationlogoicon}
                              />
                          </NavLink>
      
                      </div>
      
      
                      {/* Profile picture */}
                      <div className={styles.profPicLogOut}>
                          <img
                              src="/assest/patient/pp.png"
                              alt="Profile"
                          />
                      </div>
      
                  </div>
      
              </div>
      
      </aside>


      <section className={styles.dashboardContent}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={`${styles.navContentSearch} ${styles.glass}`}>
          <div className={styles.searchIcon}>
            <Search size={18} />
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for Doctor"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className={`${styles.navContent} ${styles.glass}`}>
  
          <div className={styles.profileSec}>
            <div className={styles.profilePic}>
            <img className={styles.navPP} src="/assest/patient/pp.png" alt="Profile" />

            </div>
              <div className={styles.nameNav}>
                <p>Mia Quian</p>
              </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.cards}>
        <div className={`${styles.cardsDCont} staggerList`}>
        {apiData.map((doctor) => (
            <div className={styles.Dcards} key={doctor.public_id}>

                <div className={styles.secOneBox}>
                <div className={`${styles.photoCont} ${styles.glass}`}>
                    {doctor.profile_picture ? (
                    <img
                        src={
                        doctor.profile_picture.startsWith("http")
                            ? doctor.profile_picture
                            : `http://${window.location.hostname}:8000${doctor.profile_picture}`
                        }
                        alt={`${doctor.first_name} ${doctor.last_name}`}
                    />
                    ) : (
                    <div>
                        {doctor.first_name?.charAt(0).toUpperCase()}
                    </div>
                    )}
                </div>
                </div>

                <div className={styles.infoANDb}>

                <div className={styles.infoDEV}>

                    <h1 className={styles.heroCardInfo}>
                    Dr.{" "}
                    {doctor.first_name?.charAt(0).toUpperCase()}
                    {doctor.first_name?.slice(1)}{" "}
                    {doctor.last_name}
                    </h1>

                    <div className={styles.infoshehe}>

                    <div className={styles.thingsCards}>
                        <Pill />
                        {doctor.specialty}
                    </div>

                    <div className={styles.thingsCards}>
                        <Star />
                        4.9 (234 Reviews)
                    </div>

                    <div className={styles.thingsCards}>
                        <Locwhite />
                        Amman Medical Center
                    </div>

                    <div className={`${styles.timeICON} ${styles.thingsCards}`}>
                        <TimePast />
                        Available Today
                    </div>

                    </div>
                </div>

                <div className={styles.buttAddDiv}>
                    <AppointmentButton doctor={doctor} />
                </div>

                </div>
            </div>
            ))}
       </div>
       
      </main>
    </section>
    </div>
  );

}

export default PatientDoctor;