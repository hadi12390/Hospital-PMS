import { useState, useEffect ,useRef } from "react";
// ...rest of imports unchanged
import { createPortal } from "react-dom";
import styles from "./EditAppointmentModal.module.css";
import tableStyles from "./DoctorsTable.module.css";

import ArrowDown from "./svg/arrowdown.svg?react";
import Calendar from "./svg/calendar.svg?react";
import CancleM from "./svg/cancleM.svg?react";
import Approved from "./svg/approved.svg?react";

const timeOptions = [
  "9:00AM", "9:30AM", "10:00AM", "10:30AM", "11:00AM", "11:30AM",
  "1:00PM", "1:30PM", "2:00PM", "2:30PM", "3:00PM", "3:30PM", "4:00PM",
];

function FieldDropdown({ label, value, options, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function requestClose() {
    setClosing(true);
    // matches --dropdown-exit-duration in CSS
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 120);
  }

  function toggle() {
    if (open) requestClose();
    else setOpen(true);
  }
  
  const dateInputRef = useRef(null);

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      // Chrome, Edge, and recent Firefox/Safari support this
      input.showPicker();
    } else {
      // fallback for older browsers
      input.focus();
      input.click();
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={tableStyles.dropdownWrapper}>
        <button
          type="button"
          className={`${styles.selectBtn} ${styles.glass}`}
          onClick={toggle}
        >
          <span className={value ? styles.selectValue : styles.selectPlaceholder}>
            {value || placeholder}
          </span>
          <ArrowDown
            className={`${styles.chevron} ${open && !closing ? styles.chevronOpen : ""}`}
          />
        </button>

        {open && (
          <div
            className={`${tableStyles.dropdownMenu} ${styles.glass} ${
              closing ? styles.dropdownClosing : styles.dropdownOpening
            }`}
          >
            {options.map((option, i) => (
              <button
                key={option}
                type="button"
                style={{ "--i": i }}
                className={`${tableStyles.dropdownItem} ${styles.dropdownItemAnim} ${
                  value === option ? tableStyles.dropdownItemActive : ""
                }`}
                onClick={() => {
                  onSelect(option);
                  requestClose();
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditAppointmentModal({ appointment, patients, doctors, types, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patient: appointment.patient,
    doctor: appointment.doctor,
    type: appointment.type,
    date: appointment.date,
    time: appointment.time,
    note: appointment.note || "",
  });

  const [isClosing, setIsClosing] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // triggers the enter transition on mount (next frame)
    const id = requestAnimationFrame(() => setIsEntering(false));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!appointment) return null;

  function closeWithAnimation(after) {
    setIsClosing(true);
    setTimeout(() => {
      after?.();
    }, 200); // matches --modal-exit-duration in CSS
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

  function handleSave() {
    closeWithAnimation(() => onSave({ ...appointment, ...formData }));
  }
  const dateInputRef = useRef(null);

function openDatePicker() {
  const input = dateInputRef.current;
  if (!input) return;

  if (typeof input.showPicker === "function") {
    // Chrome, Edge, and recent Firefox/Safari support this
    input.showPicker();
  } else {
    // fallback for older browsers
    input.focus();
    input.click();
  }
}

  const overlayState = isClosing ? styles.overlayClosing : isEntering ? styles.overlayEntering : styles.overlayOpen;
  const modalState = isClosing ? styles.modalClosing : isEntering ? styles.modalEntering : styles.modalOpen;

  return createPortal(
    <div className={`${styles.overlay} ${overlayState}`} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${modalState}`}>
        <h2 className={styles.title}>Edit Appointment</h2>

        <FieldDropdown
          label="Patient:"
          value={formData.patient}
          options={patients}
          placeholder="Select patient"
          onSelect={(v) => updateField("patient", v)}
        />

        <FieldDropdown
          label="Doctor:"
          value={formData.doctor}
          options={doctors}
          placeholder="Select doctor"
          onSelect={(v) => updateField("doctor", v)}
        />

        <FieldDropdown
          label="Appointment Type:"
          value={formData.type}
          options={types}
          placeholder="Select type"
          onSelect={(v) => updateField("type", v)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Date:</label>
          <div className={styles.dateWrapper}>
            <input
              ref={dateInputRef}
              type="date"
              className={`${styles.dateInput} ${styles.glass}`}
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
            <button
              type="button"
              className={styles.dateIconBtn}
              onClick={openDatePicker}
              aria-label="Open date picker"
            >
            </button>
          </div>
        </div>

        <FieldDropdown
          label="Time:"
          value={formData.time}
          options={timeOptions}
          placeholder="Select time"
          onSelect={(v) => updateField("time", v)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Note:</label>
          <input
            type="text"
            className={`${styles.noteInput} ${styles.glass}`}
            placeholder="Add a note..."
            value={formData.note}
            onChange={(e) => updateField("note", e.target.value)}
          />
        </div>

        <div className={styles.actionsRow}>
          <button className={`${styles.cancelBtn} ${styles.glass}`} onClick={handleCancel}>
            <CancleM className={styles.icon} />
            Cancel
          </button>

          <button className={`${styles.saveBtn} ${styles.glass}`} onClick={handleSave}>
            <Approved className={styles.icon} />
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default EditAppointmentModal;