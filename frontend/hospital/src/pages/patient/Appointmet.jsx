import styles from "./Appointment.module.css";
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
import NotificationLogo from "../../assets/patient/notification.svg?react";

import { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const hostName = window.location.hostname;
const API_URL = `http://${hostName}:8000/appointment/`;

/* ---------------------------------------------------------
   Helpers: date/time formatting + splitting appointments
--------------------------------------------------------- */

function formatDayDate(iso) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "long" });
  return { weekday, dayMonth: `${day} ${month}` };
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortHeader(iso) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "short" });
  return `${day} ${month}`;
}

function timeRemainingLabel(iso) {
  const now = new Date();
  const target = new Date(iso);
  const diffMs = target - now;

  if (diffMs <= 0) return "Starting now";

  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min remaining`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} remaining`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} remaining`;
}

function statusLabel(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Splits a raw appointment list into:
 * - next: the single soonest appointment from now onward
 * - upcoming: the rest of the future appointments
 * - history: past appointments, most recent first
 */
function splitAppointments(appointments) {
  const now = new Date();

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time)
  );

  const history = [];
  const upcoming = [];

  for (const appt of sorted) {
    if (new Date(appt.scheduled_time) < now) {
      history.push(appt);
    } else {
      upcoming.push(appt);
    }
  }

  const next = upcoming.length > 0 ? upcoming[0] : null;
  const restOfUpcoming = upcoming.slice(1);

  return { next, upcoming: restOfUpcoming, history: history.reverse() };
}

/* ---------------------------------------------------------
   UpcomingCard — each card owns its own expand/collapse state
--------------------------------------------------------- */

function UpcomingCard({ appt }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

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

  const { weekday, dayMonth } = formatDayDate(appt.scheduled_time);
  const doctorName = appt.doctor?.name || "Unknown";
  const reason = appt.reason_for_visit?.trim() || "No reason given";

  return (
    <div className={`${styles.expcard} ${expanded ? styles.expexpanded : ""}`}>
      <div className={styles.expheader}>
        <h3>
          {formatShortHeader(appt.scheduled_time)} | Dr. {doctorName}
        </h3>
        <h3>{reason}</h3>
        <h3>{formatTime(appt.scheduled_time)}</h3>
      </div>

      <div ref={cardRef} className={styles.expcontent}>
        <div className={styles.expinner}>
          <div className={styles.expcardsin}>
            <div className={styles.naCardOne}>
              <div className={styles.uppernacardone}>
                <div className={`${styles.surtype} ${styles.glass}`}>
                  {appt.appointment_type?.replace("_", " ") || "Consultation"}
                </div>

                <div className={`${styles.docName} ${styles.glass}`}>
                  <DocLogo />
                  Dr. {doctorName}
                </div>
              </div>

              <div className={`${styles.docPho} ${styles.glass}`}>
                <img
                  src={appt.doctor?.profile_picture || "/assest/patient/doctor.png"}
                  alt="Profile"
                />
              </div>
            </div>

            <div className={`${styles.naCardTwo} ${styles.glass}`}>
              <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                <AppLogo className={styles.logonaCardTwo} />
                <span>Date</span>
              </div>
              <div>
                <div className={styles.namaintext}>
                  {weekday} <br />
                  {dayMonth}
                </div>
                <div className={styles.clocknatwo}>
                  {formatTime(appt.scheduled_time)}
                </div>
              </div>
            </div>

            <div className={`${styles.naCardTwo} ${styles.glass}`}>
              <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                <Location className={styles.logonaCardTwo} />
                <span>Duration</span>
              </div>
              <div>
                <div className={styles.namaintext}>
                  {appt.duration_minutes} <br />
                  minutes
                </div>
              </div>
            </div>

            <div className={`${styles.naCardFour} ${styles.glass}`}>
              <div>
                <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                  <Status className={styles.logonaCardTwo} />
                  <span>Status</span>
                </div>

                <div className={styles.statusA}>{statusLabel(appt.status)}</div>
              </div>

              <div className={styles.iconstatusA}>
                <Approved className={styles.iconmnn} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.downerEXP}>
        <div className={styles.expStatusLogo}>
          <div className={styles.expStatusLogomain}>
            <Approved className={styles.approved} />
          </div>
          {statusLabel(appt.status)}
        </div>
        <button
          type="button"
          className={`${styles.toggleBtn} ${expanded ? styles.open : ""}`}
          onClick={toggleCard}
        >
          <ExpArrow className={styles.arrow} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */

function PatientAppointment() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      try {
        setLoading(true);
        const res = await fetch(API_URL,
              {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setAppointments(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAppointments();
    return () => {
      cancelled = true;
    };
  }, []);

  const { next, upcoming, history } = splitAppointments(appointments);

  const filteredUpcoming = searchValue.trim()
    ? upcoming.filter((a) =>
        [a.doctor?.name, a.reason_for_visit, a.appointment_type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : upcoming;

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
              placeholder="Search for Appointment"
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
          {loading && <div className={styles.heroSecName}>Loading appointments...</div>}
          {error && (
            <div className={styles.heroSecName} style={{ color: "red" }}>
              Failed to load appointments: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ===================== NEXT APPOINTMENT ===================== */}
              {next ? (
                <div className={styles.nextAppointment}>
                  <div className={styles.upperNextAppointment}>
                    <div className={styles.heroNextApp}>Next Appointment</div>
                    <div className={styles.timingNextApp}>
                      {timeRemainingLabel(next.scheduled_time)}
                    </div>
                  </div>

                  <div className={`${styles.downNextAppointment} staggerList`}>
                    <div className={styles.naCardOne}>
                      <div className={styles.uppernacardone}>
                        <div className={`${styles.surtype} ${styles.glass}`}>
                          {next.appointment_type?.replace("_", " ") || "Consultation"}
                        </div>

                        <div className={`${styles.docName} ${styles.glass}`}>
                          <DocLogo />
                          Dr. {next.doctor?.name || "Unknown"}
                        </div>
                      </div>

                      <div className={`${styles.docPho} ${styles.glass}`}>
                        <img
                          src={next.doctor?.profile_picture || "/assest/patient/doctor.png"}
                          alt="Profile"
                        />
                      </div>
                    </div>

                    <div className={`${styles.naCardTwo} ${styles.glass}`}>
                      <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                        <AppLogo className={styles.logonaCardTwo} />
                        <span>Date</span>
                      </div>
                      <div>
                        <div className={styles.namaintext}>
                          {formatDayDate(next.scheduled_time).weekday} <br />
                          {formatDayDate(next.scheduled_time).dayMonth}
                        </div>
                        <div className={styles.clocknatwo}>
                          {formatTime(next.scheduled_time)}
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.naCardTwo} ${styles.glass}`}>
                      <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                        <Location className={styles.logonaCardTwo} />
                        <span>Duration</span>
                      </div>
                      <div>
                        <div className={styles.namaintext}>
                          {next.duration_minutes} <br />
                          minutes
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.naCardFour} ${styles.glass}`}>
                      <div>
                        <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                          <Status className={styles.logonaCardTwo} />
                          <span>Status</span>
                        </div>

                        <div className={styles.statusA}>{statusLabel(next.status)}</div>
                      </div>

                      <div className={styles.iconstatusA}>
                        <Approved className={styles.iconmnn} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.heroSecName}>No upcoming appointments</div>
              )}

              {/* ===================== UPCOMING ===================== */}
              <div className={styles.heroSecName}>
                Upcoming Appointments {filteredUpcoming.length > 0 && `(${filteredUpcoming.length})`}
              </div>
              <div className={`${styles.expAllCards} staggerList`}>
                {filteredUpcoming.length > 0 ? (
                  filteredUpcoming.map((appt) => (
                    <UpcomingCard key={appt.public_id} appt={appt} />
                  ))
                ) : (
                  <div className={styles.heroSecName}>Nothing else scheduled</div>
                )}
              </div>

              {/* ===================== HISTORY ===================== */}
              <div className={styles.heroSecName}>History</div>
              <div className={styles.wid100}>
                {history.length > 0 ? (
                  history.map((appt) => (
                    <div className={styles.expcardH} key={appt.public_id}>
                      <div className={styles.expheader}>
                        <h3>
                          {formatShortHeader(appt.scheduled_time)} | Dr.{" "}
                          {appt.doctor?.name || "Unknown"}
                        </h3>
                        <div>
                          <div className={styles.expStatusLogo}>
                            <div className={styles.expStatusLogomain}>
                              <Approved className={styles.approved} />
                            </div>
                            {statusLabel(appt.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.heroSecName}>No past appointments</div>
                )}
              </div>
            </>
          )}
        </main>
      </section>
    </div>
  );
}

export default PatientAppointment;