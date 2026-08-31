import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./EditAppointmentModal.module.css";
import { formatDisplayDate } from "./DateHelper/dateUtils";

import ArrowDown from "./svg/arrowdown.svg?react";
import Calendar from "./svg/calendar.svg?react";
import CancleM from "./svg/cancleM.svg?react";
import Approved from "./svg/approved.svg?react";
import EditC from "./svg/editC.svg?react";
import Phone from "./svg/phone.svg?react";
import Blood from "./svg/blood.svg?react";
import PersonM from "./svg/personM.svg?react";

// ---- Patient photo imports (swap to wherever your canonical photos live) ----
import patient1 from "./photos/patient1.png";
import patient2 from "./photos/patient2.png";
import patient3 from "./photos/patient3.png";
import patient4 from "./photos/patient4.png";
import patient5 from "./photos/patient5.png";
import patient6 from "./photos/patient6.png";

const photoMap = { patient1, patient2, patient3, patient4, patient5, patient6 };

const timeOptions = [
  "9:00AM", "9:30AM", "10:00AM", "10:30AM", "11:00AM", "11:30AM",
  "1:00PM", "1:30PM", "2:00PM", "2:30PM", "3:00PM", "3:30PM", "4:00PM",
];

const durationOptions = ["Default", "15 minutes", "30 minutes", "45 minutes", "1 hour"];
const statusOptions = ["Confirmed", "Pending", "Completed", "Cancelled"];

// ---------- time helpers ----------
function formatTime12(dateTime) {
  const timePart = dateTime.split("T")[1];
  if (!timePart) return "";
  let [hour, minute] = timePart.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")}${period}`;
}

function parseTime12To24(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)(AM|PM)/i);
  if (!match) return "00:00";
  let [, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10);
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minuteStr}`;
}

/* ==========================================================================
   Inline editable row — pencil toggles between display text and
   an input (free text) or a dropdown (options).
   ========================================================================== */

function DetailRow({ label, value, options, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && !options) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, options]);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    if (options) setOpen(true);
  }

  function commit(val) {
    onCommit(val);
    setEditing(false);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") commit(draft);
    if (e.key === "Escape") setEditing(false);
  }

  if (editing && options) {
    return (
      <div className={styles.detailLineEditing}>
        <span className={styles.detailLabel}>{label}:</span>
        <div className={styles.inlineDropdownWrapper}>
          <button
            type="button"
            className={`${styles.inlineSelectBtn} ${styles.glass}`}
            onClick={() => setOpen((p) => !p)}
          >
            {draft || "Select"}
            <ArrowDown className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
          </button>

          {open && (
            <div className={`${styles.inlineDropdownMenu} ${styles.dropdownOpening}`}>
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`${styles.inlineDropdownItem} ${draft === opt ? styles.inlineDropdownItemActive : ""}`}
                  onClick={() => commit(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className={styles.detailLineEditing}>
        <span className={styles.detailLabel}>{label}:</span>
        <input
          ref={inputRef}
          className={styles.inlineInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div className={styles.detailLine}>
      {label}: {value}
      <button
        type="button"
        className={styles.pencilBtn}
        onClick={startEdit}
        aria-label={`Edit ${label}`}
      >
        <EditC className={styles.pencilIcon} />
      </button>
    </div>
  );
}

/* ==========================================================================
   Date row — special-cased to open the native date picker
   ========================================================================== */

function DateRow({ value, onCommit }) {
  const dateInputRef = useRef(null);

  function openPicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }

  return (
    <p className={styles.detailLine}>
      Date: {formatDisplayDate(value)}
      <button
        type="button"
        className={styles.pencilBtn}
        onClick={openPicker}
        aria-label="Edit date"
      >
        <EditC className={styles.pencilIcon} />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        className={styles.hiddenDateInput}
        value={value}
        onChange={(e) => onCommit(e.target.value)}
      />
    </p>
  );
}

/* ==========================================================================
   EditAppointmentModal
   ========================================================================== */
function EditAppointmentModal({ appointment, onClose, onSave }) {

  function toIsoWithOffset(dateStr, timeStr) {
  // dateStr: "2026-08-30", timeStr: "12:00" (24hr)
  const local = new Date(`${dateStr}T${timeStr}:00`);

  const offsetMinutes = -local.getTimezoneOffset(); 
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");

  return `${dateStr}T${timeStr}:00${sign}${hours}:${minutes}`;
}


  function durationToMinutes(str) {
    if (!str) return null;

    const s = str.trim().toLowerCase();

    if (s === "default") return null; 

    const match = s.match(/(\d+)\s*(minute|hour)/);
    if (!match) return null;

    const [, num, unit] = match;
    const value = parseInt(num, 10);

    return unit === "hour" ? value * 60 : value;
  }

  function toApiValue(str) {
    if (!str) return str;
    return str.trim().toLowerCase().replace(/\s+/g, "_");
  }

  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }
  const [formData, setFormData] = useState({
    type: appointment.type,
    reason: appointment.reason,
    duration: appointment.duration,
    date: appointment.dateTime.split("T")[0],
    time: formatTime12(appointment.dateTime),
    status: appointment.status,
    note: appointment.note,
  });
  const [isClosing, setIsClosing] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsEntering(false));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!appointment) return null;

  const { patient } = appointment;

  function closeWithAnimation(after) {
    setIsClosing(true);
    setTimeout(() => after?.(), 200);
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeWithAnimation(onClose);
  }

  function handleCancel() {
    closeWithAnimation(onClose);
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    console.log("APPOINTMENT OBJECT:", appointment);

    setSaveError(null);

    // Only appointment-level fields are sent — patient data is never
    // read from formData because it was never put there in the first place.
    const payload = {
      appointment_type: toApiValue(formData.type),
      reason_for_visit: formData.reason,
      duration_minutes: durationToMinutes(formData.duration),
      status: toApiValue(formData.status),
      notes: formData.note,   
      scheduled_time: toIsoWithOffset(formData.date, parseTime12To24(formData.time)),
    };

    setIsSaving(true);
      console.log("PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));

    
    try {

      const hostName = window.location.hostname;
      const res = await fetch(
        `http://${hostName}:8000/appointment/doctor/${appointment.id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let message = `Save failed (${res.status})`;

        try {
          const errorJson = JSON.parse(text);
          const conflictMsg = errorJson?.non_field_errors?.find((m) =>
            m.toLowerCase().includes("time slot conflicts")
          );

          if (conflictMsg) {
            message = "The selected time does not match your schedule.";
          } else {
            const firstFieldError = Object.values(errorJson || {})[0];
            message = Array.isArray(firstFieldError) ? firstFieldError[0] : text;
          }
        } catch {
          message = text || message;
        }

        throw new Error(message);
      }

      const updatedFromServer = await res.json().catch(() => null);

      const updated = {
        ...appointment,
        type: formData.type,
        reason: formData.reason,
        duration: formData.duration,
        status: formData.status,
        note: formData.note,
        dateTime: payload.date_time,
        ...(updatedFromServer || {}), // let server response win if it returns the full object
      };

      closeWithAnimation(() => onSave(updated));
      
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Something went wrong while saving.");
      setIsSaving(false);
    }
  }

  const overlayState = isClosing ? styles.overlayClosing : isEntering ? styles.overlayEntering : styles.overlayOpen;
  const modalState = isClosing ? styles.modalClosing : isEntering ? styles.modalEntering : styles.modalOpen;


  return createPortal(
    <div className={`${styles.overlay} ${overlayState}`} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${modalState}`}>
        <h2 className={styles.title}>Appointments details</h2>

        {/* ---- Patient photo + info (read-only) ---- */}
        <div className={styles.topRow}>
          <div className={`${styles.photoBox} ${styles.glass}`}>
            {patient.photo ? (
              <img
                className={styles.photo}
                src={patient.photo}
                alt={`${patient.firstName} ${patient.lastName}`}
              />
            ) : (
              <div className={styles.photoFallback}>
                {patient.firstName?.[0]}
                {patient.lastName?.[0]}
              </div>
            )}
          </div>

          <div className={`${styles.infoCard} ${styles.glass}`}>
            <p className={styles.nameLine}>
              First Name: <strong>{patient.firstName}</strong>
            </p>
            <p className={styles.nameLine}>
              Last Name: <strong>{patient.lastName}</strong>
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Calendar className={styles.icon} />
                <span>{formatDisplayDate(patient.dateOfBirth)}</span>
              </div>
              <div className={styles.infoItem}>
                <Blood className={styles.icon} />
                <span>{patient.bloodType}</span>
              </div>

              <div className={styles.infoItem}>
                <Phone className={styles.icon} />
                <span>{patient.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <PersonM className={styles.icon} />
                <span className={styles.strongText}>{patient.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Editable appointment details + notes ---- */}
        <div className={`${styles.detailsCard} ${styles.glass}`}>
          <div className={styles.detailsCol}>
            <DetailRow
              label="Time"
              value={formData.time}
              options={timeOptions}
              onCommit={(v) => updateField("time", v)}
            />
            
            <DetailRow
              label="Duration"
              value={formData.duration}
              options={durationOptions}
              onCommit={(v) => updateField("duration", v)}
            />
            <DetailRow
              label="Type"
              value={formData.type}
              options={["Consultation", "Follow Up", "Check Up", "Surgery"]}
              onCommit={(v) => updateField("type", v)}
            />
            <DetailRow
              label="Status"
              value={formData.status}
              options={statusOptions}
              onCommit={(v) => updateField("status", v)}
            />
            <DetailRow
              label="Reason for visit"
              value={formData.reason}
              onCommit={(v) => updateField("reason", v)}
            />
            <DateRow
              value={formData.date}
              onCommit={(v) => updateField("date", v)}
            />
            <p className={styles.detailLine}>
              Created at: {formatDisplayDate(appointment.createdAt.split("T")[0])}
            </p>
            
          </div>

          <div className={styles.notesCol}>
            <p className={styles.notesLabel}>Notes:</p>
            <textarea
              className={`${styles.notesBox} ${styles.glass}`}
              placeholder="There is no Note..."
              value={formData.note}
              onChange={(e) => updateField("note", e.target.value)}
            />
          </div>
        </div>
        
        {saveError && (
          <div className={`${styles.cancelBtnA} ${styles.glass}`}>
            {saveError}
          </div>
        )}

        <div className={styles.actionsRow}>
          <button className={`${styles.cancelBtn} ${styles.glass}`} onClick={handleCancel} disabled={isSaving}>
            <CancleM className={styles.icon} />
            Cancel
          </button>

          <button className={`${styles.saveBtn} ${styles.glass}`} onClick={handleSave} disabled={isSaving}>
            <Approved className={styles.icon} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default EditAppointmentModal;