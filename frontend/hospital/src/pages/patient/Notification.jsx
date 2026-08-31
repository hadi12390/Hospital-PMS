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

import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import AppointmentButton from "./AppointmentButton";

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getApiBase() {
  const hostName = window.location.hostname;
  return `http://${hostName}:8000`;
}

/**
 * Reads a cookie value by name (used for Django's csrftoken cookie).
 */
function getCookie(name) {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/**
 * PATCH a notification's is_read flag to true.
 * Adjust the URL/method here if your backend uses a different route.
 *
 * A 403 here (while GET requests succeed) almost always means Django's
 * CSRF protection is rejecting the request because it's missing the
 * X-CSRFToken header. Django reads the token from the `csrftoken` cookie
 * (set automatically once you've made a GET request / logged in), so we
 * pull it from document.cookie and attach it below. If your backend uses
 * a different cookie/header name, adjust CSRF_COOKIE_NAME accordingly.
 */
async function markNotificationRead(publicId) {
  const csrfToken = getCookie("csrftoken");

  const res = await fetch(`${getApiBase()}/notifications/${publicId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    },
    body: JSON.stringify({ is_read: true }),
  });

  if (!res.ok) {
    throw new Error(`Failed to mark notification as read: ${res.status}`);
  }

  return res.json().catch(() => null);
}

/* ---------------------------------------------------------
   NotificationCard — purely presentational, no fetching
--------------------------------------------------------- */

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

  function formatTime(iso) {
    const d = new Date(iso);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minutesStr = String(minutes).padStart(2, "0");
    return `${hours}:${minutesStr}${ampm}`;
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`;
  }

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
            <div>{formatTime(notification.created_at)}</div>
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

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */

function Notification() {
  const [searchValue, setSearchValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // stages keyed by notification public_id: "idle" | "clearing" | "collapsing"
  const [stages, setStages] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function getData() {
      try {
        setLoading(true);
        const res = await fetch(`${getApiBase()}/notifications/`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setNotifications(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
        console.error("Failed to fetch notifications:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getData();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStage = (id) => stages[id] || "idle";

  const handleClear = (publicId) => async () => {
    setStages((prev) => ({ ...prev, [publicId]: "clearing" }));

    try {
      await markNotificationRead(publicId);
    } catch (err) {
      console.error(err);
      // Roll back the animation if the API call failed, so the user
      // can see the notification is still there / unread.
      setStages((prev) => ({ ...prev, [publicId]: "idle" }));
      return;
    }
  };

  const handleOverlayEnd = (publicId) => (e) => {
    if (e.target !== e.currentTarget) return;
    if (getStage(publicId) === "clearing") {
      setStages((prev) => ({ ...prev, [publicId]: "collapsing" }));
    }
  };

  const handleCollapseEnd = (publicId) => (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "height") return;
    if (getStage(publicId) === "collapsing") {
      setNotifications((prev) => prev.filter((n) => n.public_id !== publicId));
      setStages((prev) => {
        const next = { ...prev };
        delete next[publicId];
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
          block: "start",
        });
      }, 350);
    }
  };

  const filteredNotifications = searchValue.trim()
    ? notifications.filter((n) =>
        [n.title, n.message]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : notifications;

  return (
    <div className={`${styles.PatientDashboard}`}>
      <aside className={styles.sideBar}>
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <img src="/assest/patient/logo.svg" alt="Logo" />
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
            <div
              className={`${styles.optionsContainer} ${styles.optionsContainerLL}`}
            >
              {/* Logout */}
              <button
                type="button"
                className={`${styles.options} ${styles.logoutLogoButton}`}
              >
                <LogOutLogo className={styles.logoutlogoicon} />
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
                <NotificationLogo className={styles.notificationlogoicon} />
              </NavLink>
            </div>

            {/* Profile picture */}
            <div className={styles.profPicLogOut}>
              <img src="/assest/patient/pp.png" alt="Profile" />
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
                <img
                  className={styles.navPP}
                  src="/assest/patient/pp.png"
                  alt="Profile"
                />
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
            <div className={styles.cardsContentHeader}></div>
            <div>
              <div className={styles.cardsContentBody}>
                <div className={styles.cardsContentBodyA}>
                  {loading && <p>Loading notifications...</p>}
                  {error && <p style={{ color: "red" }}>{error}</p>}

                  {!loading && !error && filteredNotifications.length === 0 && (
                    <p>No notifications.</p>
                  )}

                  {!loading &&
                    !error &&
                    filteredNotifications.map((n, index) => (
                      <NotificationCard
                        key={n.public_id}
                        notification={n}
                        stage={getStage(n.public_id)}
                        index={index}
                        onClear={handleClear(n.public_id)}
                        onOverlayEnd={handleOverlayEnd(n.public_id)}
                        onCollapseEnd={handleCollapseEnd(n.public_id)}
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

export default Notification;