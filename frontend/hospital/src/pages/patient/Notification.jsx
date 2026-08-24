import styles from "./Notification.module.css";

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
import Deletel from "../../assets/patient/deleteL.svg?react";
import NotificationLogo from "../../assets/patient/notification.svg?react";



import { useEffect, useRef, useState } from 'react';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import AppointmentButton from "./AppointmentButton";

const initialNotifications = [
  { id: 1, time: "10:00 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Ahmad has been confirmed" },
  { id: 2, time: "9:45 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Sarah has been confirmed" },
  { id: 3, time: "9:30 AM", title: "Prescription Ready", message: "Your prescription is ready for pickup at the pharmacy" },
  { id: 4, time: "9:10 AM", title: "Appointment Reminder", message: "You have an appointment with Dr.Khaled tomorrow at 11:00 AM" },
  { id: 5, time: "8:50 AM", title: "Lab Results Ready", message: "Your recent lab results have been uploaded to your profile" },
  { id: 6, time: "8:30 AM", title: "Appointment Rescheduled", message: "Your appointment with Dr.Ahmad was moved to 2:00 PM" },
  { id: 7, time: "8:15 AM", title: "Payment Received", message: "Your payment for the last visit has been received" },
  { id: 8, time: "7:55 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Layla has been confirmed" },
  { id: 9, time: "7:40 AM", title: "New Message", message: "Dr.Omar sent you a message regarding your treatment plan" },
  { id: 11, time: "7:20 AM", title: "Appointment Cancelled", message: "Your appointment with Dr.Nour has been cancelled" },
  { id: 12, time: "10:00 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Ahmad has been confirmed" },
  { id: 13, time: "9:45 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Sarah has been confirmed" },
  { id: 14, time: "9:30 AM", title: "Prescription Ready", message: "Your prescription is ready for pickup at the pharmacy" },
  { id: 15, time: "9:10 AM", title: "Appointment Reminder", message: "You have an appointment with Dr.Khaled tomorrow at 11:00 AM" },
  { id: 16, time: "8:50 AM", title: "Lab Results Ready", message: "Your recent lab results have been uploaded to your profile" },
  { id: 17, time: "8:30 AM", title: "Appointment Rescheduled", message: "Your appointment with Dr.Ahmad was moved to 2:00 PM" },
  { id: 18, time: "8:15 AM", title: "Payment Received", message: "Your payment for the last visit has been received" },
  { id: 19, time: "7:55 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Layla has been confirmed" },
  { id: 20, time: "7:40 AM", title: "New Message", message: "Dr.Omar sent you a message regarding your treatment plan" },
  { id: 21, time: "7:20 AM", title: "Appointment Cancelled", message: "Your appointment with Dr.Nour has been cancelled" },
  { id: 22, time: "10:00 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Ahmad has been confirmed" },
  { id: 23, time: "9:45 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Sarah has been confirmed" },
  { id: 24, time: "9:30 AM", title: "Prescription Ready", message: "Your prescription is ready for pickup at the pharmacy" },
  { id: 25, time: "9:10 AM", title: "Appointment Reminder", message: "You have an appointment with Dr.Khaled tomorrow at 11:00 AM" },
  { id: 26, time: "8:50 AM", title: "Lab Results Ready", message: "Your recent lab results have been uploaded to your profile" },
  { id: 27, time: "8:30 AM", title: "Appointment Rescheduled", message: "Your appointment with Dr.Ahmad was moved to 2:00 PM" },
  { id: 28, time: "8:15 AM", title: "Payment Received", message: "Your payment for the last visit has been received" },
  { id: 29, time: "7:55 AM", title: "Appointment Confirmed", message: "Your appointment with Dr.Layla has been confirmed" },
  { id: 30, time: "7:40 AM", title: "New Message", message: "Dr.Omar sent you a message regarding your treatment plan" },
  { id: 31, time: "7:20 AM", title: "Appointment Cancelled", message: "Your appointment with Dr.Nour has been cancelled" },
  
];

function NotificationCard({ notification, stage, index, onClear, onOverlayEnd, onCollapseEnd }) {
  const wrapperRef = useRef(null);
  const [height, setHeight] = useState(null);


  // When collapsing starts: measure the real pixel height first, then on the
  // next frame animate it down to 0. Avoids the grid 1fr->0fr snap issue.
  useEffect(() => {
    if (stage === "collapsing" && wrapperRef.current) {
      const fullHeight = wrapperRef.current.scrollHeight;
      setHeight(fullHeight);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [stage]);

  const collapsingStyle =
    stage === "collapsing"
      ? {
          height: height === null ? "auto" : height,
          marginBottom: height === 0 ? 0 : undefined,
          opacity: height === 0 ? 0 : undefined,
        }
      : { animationDelay: `${index * 80}ms` };

  return (
    <div
      ref={wrapperRef}
      className={`${styles.notificationWrapper} ${stage === "idle" ? styles.enter : ""}`}
      style={collapsingStyle}
      onTransitionEnd={onCollapseEnd}
    >
      <div className={styles.notificationCard}>
        <div className={`${styles.notificationCardHeaderA} ${stage !== "idle" ? styles.fadeContent : ""}`}>
          <div className={styles.notificationCardHeader}>
            {notification.title}
            <div>{notification.time}</div>
          </div>
          <div className={styles.notificationCardBody}>
            {notification.message}
          </div>
        </div>

        <button
          className={`${styles.notificationCardFooter} ${stage !== "idle" ? styles.fadeContent : ""}`}
          onClick={onClear}
        >
          clear
        </button>

        <div
          className={`${styles.clearOverlay} ${stage !== "idle" ? styles.clearOverlayActive : ""}`}
          onTransitionEnd={onOverlayEnd}
        />
      </div>
    </div>
  );
}

function notification(){
  const [searchValue, setSearchValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();


  const [notifications, setNotifications] = useState(initialNotifications);
  // stages keyed by notification id: "idle" | "clearing" | "collapsing"
  const [stages, setStages] = useState({});

  const getStage = (id) => stages[id] || "idle";

  const handleClear = (id) => {
    setStages((prev) => ({ ...prev, [id]: "clearing" }));
  };

  const handleOverlayEnd = (id) => (e) => {
    if (e.target !== e.currentTarget) return;
    if (getStage(id) === "clearing") {
      setStages((prev) => ({ ...prev, [id]: "collapsing" }));
    }
  };

  const handleCollapseEnd = (id) => (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "height") return;
    if (getStage(id) === "collapsing") {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setStages((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

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
        <div className={styles.buttonAddAppoi}>
          <button
            className={styles.mappbut}
            onClick={() => navigate("/patient/make&appointment")}
          >
            <div className={styles.addDivApp}>+</div>
            Make an New Appointment
          </button>
        </div>
  
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
            <h2>Notifications</h2>
        <div className={styles.cardsContent}>
          <div className={styles.cardsContentHeader}>
          </div>
          <div>

            <div className={styles.cardsContentBody}>
                <div className={styles.cardsContentBodyA}>
                    {notifications.map((n, index) => (
                        <NotificationCard
                            key={n.id}
                            notification={n}
                            stage={getStage(n.id)}
                            index={index}
                            onClear={() => handleClear(n.id)}
                            onOverlayEnd={handleOverlayEnd(n.id)}
                            onCollapseEnd={handleCollapseEnd(n.id)}
                        />
                    ))}
                </div>
            </div>
          </div>         

        </div>
      </main>
    </section>
    </div>
  );

}

export default notification;