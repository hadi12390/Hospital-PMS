import styles from "./Dashboard.module.css";
import scheduleStyles from "./Schedule.module.css";
import { useState, useEffect } from "react";
import Sidebar from "./sidebarD";

import patient1 from "./photos/patient1.png";

const defaultAvatar = patient1;

// ---------- API <-> UI mapping helpers ----------

function splitName(fullName) {
  const parts = (fullName || "").trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  firstName.charAt(0).toUpperCase()
  return { firstName, lastName };
}

// "confirmed" -> "Confirmed"
function formatStatus(rawStatus) {
  if (!rawStatus) return "Pending";
  return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
}

// ISO date -> "9:00 AM"
function formatTime(isoDate) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  let hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

// "3 hours left" / "1 hour left" / "1 hour ago" / "Now"
function formatHoursLeft(isoDate) {
  if (!isoDate) return "—";

  const diffMs = new Date(isoDate).getTime() - Date.now();
  const hours = Math.round(diffMs / (1000 * 60 * 60));

  if (hours === 0) return "Now";

  const absHours = Math.abs(hours);
  const unit = absHours === 1 ? "hour" : "hours";

  return hours > 0 ? `${absHours} ${unit} left` : `${absHours} ${unit} ago`;
}

// Maps one row of GET /doctor/today-schedule/ into the shape the card UI uses
function mapScheduleAppointment(appt) {
  const { firstName, lastName } = splitName(appt.patient?.name);

  return {
    id: appt.appointment_public_id,
    patient: {
      firstName,
      lastName,
      name: appt.patient?.name || `${firstName} ${lastName}`.trim(),
      photo: appt.patient?.profile_picture || defaultAvatar,
    },
    reason: appt.resone_for_visit || "—",
    note: appt.notes || "",
    time: formatTime(appt.date),
    hoursLeftLabel: formatHoursLeft(appt.date),
    status: formatStatus(appt.status),
  };
}

function statusColor(status) {
  switch (status) {
    case "Confirmed":
      return scheduleStyles.dotConfirmed;
    case "Pending":
      return scheduleStyles.dotPending;
    case "Completed":
      return scheduleStyles.dotCompleted;
    case "Cancelled":
      return scheduleStyles.dotCancelled;
    default:
      return "";
  }
}

function DoctorSchedule() {
  const [activeNav, setActiveNav] = useState("appointment");
  const [showMenu, setShowMenu] = useState(false);
  const [stopped, setStopped] = useState(false);

  const [scheduleAppointments, setScheduleAppointments] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);

  // Function to fetch data from API
  useEffect(() => {
    const controller = new AbortController();

    async function getData() {
      setLoadingSchedule(true);
      setScheduleError(null);
      try {
        // Send request to API
        const hostName = window.location.hostname;
        const response = await fetch(`http://${hostName}:8000/doctor/today-schedule/`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        // Convert response to JSON
        const data = await response.json();

        // Save mapped data
        setScheduleAppointments(data.map(mapScheduleAppointment));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setScheduleError(error.message || "Failed to load today's schedule.");
        }
      } finally {
        setLoadingSchedule(false);
      }
    }

    getData();
    return () => controller.abort();
  }, []);

  // ---------- Render ----------
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
            <button
              onMouseEnter={() => setStopped(true)}
              className={styles.pinding}>
              <img
               className={`${styles.icon} ${stopped ? styles.stopped : ""}`}
               width="10%" src="/assest/doctor/sidebar/notification-svgrepo-com.svg" alt="" />
               <div
               className={`${styles.pindingNum} ${stopped ? styles.stoppedN : ""}`}>
                12
               </div>
               Pending Appointments
               <img width="5%" src="/assest/doctor/cards/go-svgrepo-com 1.svg" alt="" />
            </button>
            <div className={styles.co}>
              <div className={styles.buttonAddAppoi}>
                <button>
                  <img src="/assest/doctor/cards/Add.svg" alt="Add" />
                  Appointment
                </button>
              </div>

              <img src="/assest/doctor/cards/LIne3.svg" alt="" />

              <div className={styles.profileSec}>
                <div className={styles.profilePic}>J</div>

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
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.cards}>
          <div className={styles.heroname}>Today Schedule </div>

          {loadingSchedule && (
            <p className={scheduleStyles.detailValue}>Loading schedule...</p>
          )}

          {!loadingSchedule && scheduleError && (
            <p className={scheduleStyles.detailValue}>
              Couldn't load today's schedule: {scheduleError}
            </p>
          )}

          {!loadingSchedule && !scheduleError && scheduleAppointments.length === 0 && (
            <p className={scheduleStyles.detailValue}>No appointments scheduled for today.</p>
          )}

          {!loadingSchedule && !scheduleError && scheduleAppointments.length > 0 && (
            <div className={scheduleStyles.scheduleList}>
              {scheduleAppointments.map((appt, i) => (
                <div
                  key={appt.id}
                  className={`${scheduleStyles.scheduleCard} ${scheduleStyles.fadeUp}`}
                  style={{ "--d": `${i * 80}ms` }}
                >
                  <div className={scheduleStyles.cardTop}>
                    <h3 className={scheduleStyles.patientName}>
                      {appt.patient?.name
                        ? `${appt.patient.name.charAt(0).toUpperCase()}${appt.patient.name.slice(1)}`
                        : "Unknown"}
                    </h3>

                    <div className={scheduleStyles.timeInfo}>
                      <span className={scheduleStyles.hoursLeft}>
                        {appt.hoursLeftLabel}
                      </span>
                      <span className={scheduleStyles.timeValue}>{appt.time}</span>
                    </div>
                  </div>

                  <div className={scheduleStyles.cardBody}>
                    <img
                      className={`${scheduleStyles.patientPhoto} ${styles.glass}`}
                      src={appt.patient.photo}
                      alt={`${appt.patient.firstName} ${appt.patient.lastName}`}
                    />

                    <div className={scheduleStyles.details}>
                      <div className={scheduleStyles.detailGroup}>
                        <p className={scheduleStyles.detailLabel}>Reason for visit:</p>
                        <p className={scheduleStyles.detailValue}>{appt.reason}</p>
                      </div>

                      <div className={scheduleStyles.detailGroup}>
                        <p className={scheduleStyles.detailLabel}>Notes:</p>
                        <p className={scheduleStyles.detailValue}>
                          {appt.note || "There is no note"}
                        </p>
                      </div>
                    </div>

                    <div className={scheduleStyles.statusWrap}>
                      <span className={`${scheduleStyles.statusBadge} ${styles.glass}`}>
                        <span className={`${scheduleStyles.statusDot} ${statusColor(appt.status)}`} />
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default DoctorSchedule;