import styles from "./Dashboard.module.css";
import ADDstyles from "./AddAppointmentModal.module.css";

import DropDown from "./svg/dropdown.svg?react";
import Calender from "./svg/calendar.svg?react";
import Edit from "./svg/edit.svg?react";



import { useRef, useState } from "react";
import Sidebar from "./sidebarD";


function AddAppointmentModal({ onCancel, onAdd }) {
  const [patient, setPatient] = useState("Mia Quien");
  const [appointmentType, setAppointmentType] = useState("Consultation");
  const [date, setDate] = useState("2026-08-15");
  const [time, setTime] = useState("11:00 AM");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");

  const handleAdd = () => {
    onAdd?.({ patient, appointmentType, date, time, duration, note });
  };

  return (
    <div className={ADDstyles.modal}>
      <div className={ADDstyles.grid}>
        {/* Left column - form fields */}
        <div className={ADDstyles.formCol}>
          <label className={ADDstyles.label}>Patient:</label>
          <div className={ADDstyles.selectWrap}>
            <select
              className={ADDstyles.select}
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            >
              <option>Mia Quien</option>
              <option>James Carter</option>
              <option>Elena Ruiz</option>
            </select>
            <DropDown
              className={ADDstyles.chevron}
            />
          </div>

          <label className={ADDstyles.label}>Appointment Type:</label>
          <div className={ADDstyles.selectWrap}>
            <select
              className={ADDstyles.select}
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Check-up</option>
              <option>Procedure</option>
            </select>
            <DropDown
              className={ADDstyles.chevron}
            />
          </div>

          <label className={ADDstyles.label}>Date:</label>
          <div className={ADDstyles.selectWrap}>
            <input
              type="date"
              className={ADDstyles.dateInput}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DropDown
              className={ADDstyles.chevron}
            />
          </div>

          <label className={ADDstyles.label}>Time:</label>
          <div className={ADDstyles.selectWrap}>
            <select
              className={ADDstyles.select}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>01:00 PM</option>
              <option>02:00 PM</option>
            </select>
            <Calender
              className={ADDstyles.chevron}
            />
          </div>

          <label className={`${ADDstyles.label} ${ADDstyles.durationLabel}`}>
            Duration minutes:
          </label>
          <div className={ADDstyles.selectWrap}>
            <select
              className={ADDstyles.select}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="">Default</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
            <DropDown
              className={ADDstyles.chevron}
            />
          </div>
        </div>

        {/* Right column - note */}
        <div className={ADDstyles.noteCol}>
          <label className={ADDstyles.label}>Note:</label>
          <div className={ADDstyles.noteBox}>
            <textarea
              className={ADDstyles.noteTextarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
            <Edit
              className={ADDstyles.pencilIcon}
            />
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className={ADDstyles.footer}>
        <button className={ADDstyles.cancelBtn} onClick={onCancel}>
          <span>✕</span> Cancel
        </button>
        <button className={ADDstyles.addBtn} onClick={handleAdd}>
          + Add
        </button>
      </div>
    </div>
  );
}

function AddAppointment() {
  const [activeNav, setActiveNav] = useState("appointment");
  const [stopped, setStopped] = useState(false);
  const [showMenu, setShowMenu] = useState(false);


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
            <AddAppointmentModal
                onAdd={(data) => { console.log(`Added : ${data}`); }}
            />
        </main>
      </section>
    </div>
  );
}

export default AddAppointment;