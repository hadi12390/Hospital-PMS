import styles from "./Dashboard.module.css";
import scheduleStyles from "./Schedule.module.css";
import { useState } from "react";
import Sidebar from "./sidebarD";

import patient1 from "./photos/patient1.png";
import patient3 from "./photos/patient3.png";

// ---------- Fake data (swap for a real fetch when the API is ready) ----------
const scheduleAppointments = [
  {
    id: 1,
    patient: { firstName: "Jessica", lastName: "Quien", photo: patient1 },
    reason: "Breathing issues",
    note: "Morning visit",
    time: "11:30 AM",
    hoursLeft: 11,
    status: "Confirmed",
  },
  {
    id: 2,
    patient: { firstName: "Jessica", lastName: "Quien", photo: patient3 },
    reason: "Breathing issues",
    note: "Morning visit",
    time: "11:30 AM",
    hoursLeft: 11,
    status: "Confirmed",
  },
];

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
          <div className={scheduleStyles.scheduleList}>
            {scheduleAppointments.map((appt, i) => (
              <div
                key={appt.id}
                className={`${scheduleStyles.scheduleCard} ${scheduleStyles.fadeUp}`}
                style={{ "--d": `${i * 80}ms` }}
              >
                <div className={scheduleStyles.cardTop}>
                  <h3 className={scheduleStyles.patientName}>
                    {appt.patient.firstName} {appt.patient.lastName}
                  </h3>

                  <div className={scheduleStyles.timeInfo}>
                    <span className={scheduleStyles.hoursLeft}>
                      {appt.hoursLeft} hours left
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
        </main>
      </section>
    </div>
  );
}

export default DoctorSchedule;