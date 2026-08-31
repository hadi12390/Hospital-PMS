import styles from "./Dashboard.module.css";
import ADDstyles from "./AddAppointmentModal.module.css";

import DropDown from "./svg/dropdown.svg?react";
import Calender from "./svg/calendar.svg?react";
import Edit from "./svg/edit.svg?react";

import { useEffect, useState } from "react";
import Sidebar from "./sidebarD";
import { ENDPOINTS } from "./config.js";
import { getCsrfToken } from "./csrf";




// Convert "2026-08-15" + "11:00 AM" -> ISO string "2026-08-15T11:00:00"
function buildScheduledTime(date, time) {
  if (!date || !time) return null;

  const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) return null;

  let [, hours, minutes, meridiem] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (meridiem.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === "AM" && hours === 12) hours = 0;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${date}T${hh}:${mm}:00`;
}

function AddAppointmentModal({ onCancel, onAdd }) {

  const APPOINTMENT_TYPE_MAP = {
    "Consultation": "consultation",
    "Follow-up": "follow_up",
    "Check-up": "check_up",
  };

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [appointmentType, setAppointmentType] = useState("Consultation");
  const [date, setDate] = useState("2026-08-15");
  const [time, setTime] = useState("11:00 AM");
  const [duration, setDuration] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [note, setNote] = useState("");

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPatients() {
      try {
        setLoadingPatients(true);
        const res = await fetch(ENDPOINTS.patients, {
          method: "GET",
          credentials: "include", // sends the auth cookie
        });

        if (!res.ok) throw new Error(`Failed to load patients (${res.status})`);

        const data = await res.json();
        if (!cancelled) {
          setPatients(data);
          if (data.length > 0) setPatientId(data[0].public_id);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }

    fetchPatients();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async () => {
    if (!patientId) {
      setError("Please select a patient.");
      return;
    }

    const scheduledTime = buildScheduledTime(date, time);

    const payload = {
      patient: patientId,
      scheduled_time: scheduledTime,
      reason_for_visit: reasonForVisit,
      notes: note,
      appointment_type: APPOINTMENT_TYPE_MAP[appointmentType] || appointmentType.toLowerCase(),
      duration_minutes: duration ? parseInt(duration, 10) : null,
    };

    try {
      setSubmitting(true);
      setError(null);

        // ...inside handleAdd:
        const res = await fetch(ENDPOINTS.createAppointment, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
          body: JSON.stringify(payload),
        });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail || `Failed to create appointment (${res.status})`);
      }

      const created = await res.json();
      onAdd?.(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={loadingPatients}
            >
              {loadingPatients && <option>Loading patients...</option>}
              {!loadingPatients && patients.length === 0 && (
                <option value="">No patients found</option>
              )}
              {patients.map((p) => (
                <option key={p.public_id} value={p.public_id}>
                  {p.name}
                </option>
              ))}
            </select>
            <DropDown className={ADDstyles.chevron} />
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
            </select>
            <DropDown className={ADDstyles.chevron} />
          </div>

          <label className={ADDstyles.label}>Date:</label>
          <div className={ADDstyles.selectWrap}>
            <input
              type="date"
              className={ADDstyles.dateInput}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DropDown className={ADDstyles.chevron} />
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
            <Calender className={ADDstyles.chevron} />
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
            <DropDown className={ADDstyles.chevron} />
          </div>
        </div>

        {/* Right column - note */}
        <div className={ADDstyles.noteCol}>
          <label className={ADDstyles.label}>Reason for visit:</label>
          <div className={ADDstyles.noteBoxA}>
            <textarea
              className={ADDstyles.noteTextareaA}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="the reason for visit..."
            />
          </div>
          <label className={ADDstyles.label}>Note:</label>
          <div className={ADDstyles.noteBox}>
            <textarea
              className={ADDstyles.noteTextarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
            <Edit className={ADDstyles.pencilIcon} />
          </div>
        </div>
      </div>

      {error && <div className={ADDstyles.error}>{error}</div>}

      {/* Footer buttons */}
      <div className={ADDstyles.footer}>
        <button className={ADDstyles.cancelBtn} onClick={onCancel}>
          <span>✕</span> Cancel
        </button>
        <button
          className={ADDstyles.addBtn}
          onClick={handleAdd}
          disabled={submitting || loadingPatients}
        >
          + {submitting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}

function AddAppointment() {
  const [activeNav, setActiveNav] = useState("appointment");
  const [stopped, setStopped] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      <section className={styles.dashboardContent}>
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            <button
              onMouseEnter={() => setStopped(true)}
              className={styles.pinding}
            >
              <img
                className={`${styles.icon} ${stopped ? styles.stopped : ""}`}
                width="10%"
                src="/assest/doctor/sidebar/notification-svgrepo-com.svg"
                alt=""
              />
              <div
                className={`${styles.pindingNum} ${stopped ? styles.stoppedN : ""}`}
              >
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
                      <img width="40%" src="/assest/doctor/cards/log-out.svg" alt="a" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className={styles.cards}>
          <AddAppointmentModal
            onAdd={(data) => {
              console.log("Added:", data);
            }}
          />
        </main>
      </section>
    </div>
  );
}

export default AddAppointment;