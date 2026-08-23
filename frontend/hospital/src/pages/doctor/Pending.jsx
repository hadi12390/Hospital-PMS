import styles from "./Dashboard.module.css";
import pendingStyles from "./Pendings.module.css";
import { useState } from "react";
import Sidebar from "./sidebarD";

import No from "./svg/no.svg?react";
import Yes from "./svg/yes.svg?react";

// ---------- Fake data (swap for a real fetch when the API is ready) ----------
const initialPendingAppointments = [
  {
    id: 1,
    patientName: "Adam Nasser",
    type: "consultation",
    requestedTime: "12:06 AM",
    date: "2026-08-08",
    reason: "Feeling under the weather",
  },
  {
    id: 2,
    patientName: "Adam Nasser",
    type: "consultation",
    requestedTime: "12:06 AM",
    date: "2026-08-08",
    reason: "Feeling under the weather",
  },
  {
    id: 3,
    patientName: "Adam Nasser",
    type: "consultation",
    requestedTime: "12:06 AM",
    date: "2026-08-08",
    reason: "Feeling under the weather",
  },
  {
    id: 4,
    patientName: "Adam Nasser",
    type: "consultation",
    requestedTime: "12:06 AM",
    date: "2026-08-08",
    reason: "Feeling under the weather",
  },
  {
    id: 5,
    patientName: "Adam Nasser",
    type: "consultation",
    requestedTime: "12:06 AM",
    date: "2026-08-08",
    reason: "Feeling under the weather",
  },
];

function DoctorPendings() {
  const [activeNav, setActiveNav] = useState("appointment");
  const [showMenu, setShowMenu] = useState(false);
  const [stopped, setStopped] = useState(false);

  const [pendingAppointments, setPendingAppointments] = useState(initialPendingAppointments);
  const [removingId, setRemovingId] = useState(null);

  function removeWithAnimation(id, after) {
    setRemovingId(id);
    setTimeout(() => {
      setPendingAppointments((prev) => prev.filter((a) => a.id !== id));
      setRemovingId(null);
      after?.(id);
    }, 320); // matches the exit animation duration in CSS
  }

  function handleConfirm(id) {
    removeWithAnimation(id, (confirmedId) => {
      // hook up your API call to confirm the appointment here
      console.log("Confirmed appointment", confirmedId);
    });
  }

  function handleCancel(id) {
    removeWithAnimation(id, (cancelledId) => {
      // hook up your API call to cancel the appointment here
      console.log("Cancelled appointment", cancelledId);
    });
  }

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
                {pendingAppointments.length}
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
          <div className={pendingStyles.pendingList}>
            {pendingAppointments.length === 0 && (
              <p className={pendingStyles.emptyState}>No pending appointments</p>
            )}

            {pendingAppointments.map((appt, i) => (
              <div
                key={appt.id}
                className={`${pendingStyles.pendingCard} ${pendingStyles.fadeUp} ${
                  removingId === appt.id ? pendingStyles.cardRemoving : ""
                }`}
                style={{ "--d": `${i * 60}ms` }}
              >
                <div className={pendingStyles.cardTop}>
                  <h3 className={pendingStyles.cardTitle}>
                    Appointment by {appt.patientName}
                  </h3>
                  <span className={pendingStyles.cardDate}>{appt.date}</span>
                </div>

                <p className={pendingStyles.cardSubtitle}>
                  {appt.patientName} requested an {appt.type} with you at {appt.requestedTime}
                </p>

                <div className={pendingStyles.cardBottom}>
                  <p className={pendingStyles.reasonText}>
                    Reason for visit: {appt.reason}
                  </p>

                  <div className={pendingStyles.actionsRow}>
                    <button
                      type="button"
                      className={`${pendingStyles.cancelBtn} ${styles.glass}`}
                      onClick={() => handleCancel(appt.id)}
                    >
                      <No className={pendingStyles.icon} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      className={`${pendingStyles.confirmBtn} ${styles.glass}`}
                      onClick={() => handleConfirm(appt.id)}
                    >
                      <Yes className={pendingStyles.icon} />
                      Confirm
                    </button>
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

export default DoctorPendings;