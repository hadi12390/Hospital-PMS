import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./EditAppointmentModal.module.css"; // shared modal shell/field styles
import gridStyles from "./AddAppointmentModal.module.css"; // time-slot grid only
import tableStyles from "./DoctorsTable.module.css";
import anim from "./modalAnimations.module.css";

import ArrowDown from "./svg/arrowdown.svg?react";
import Calendar from "./svg/calendar.svg?react";
import CancleM from "./svg/cancleM.svg?react";
import Plus from "./svg/plus.svg?react";

const CLOSE_ANIMATION_MS = 180;

// Matches the mockup's labels. Note 12:00/13:00/14:00 are paired with
// AM/PM oddly in the screenshot (13:00 PM etc) — swap in whatever your
// real available-slots source returns once it's wired up.
const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 AM", "13:00 PM", "14:00 PM",
];

function FieldDropdown({ label, value, options, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={tableStyles.dropdownWrapper}>
        <button
          type="button"
          className={`${styles.selectBtn} ${styles.glass}`}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={value ? styles.selectValue : styles.selectPlaceholder}>
            {value || placeholder}
          </span>
          <ArrowDown
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          />
        </button>

        {open && (
          <div className={`${tableStyles.dropdownMenu} ${styles.glass}`}>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`${tableStyles.dropdownItem} ${
                  value === option ? tableStyles.dropdownItemActive : ""
                }`}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
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

function AddAppointmentModal({ patients, doctors, types, onClose, onAdd }) {
  const [closing, setClosing] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    type: "",
    date: "",
    time: "",
  });

  function animateOut(action) {
    if (closing) return;
    setClosing(true);
    setTimeout(action, CLOSE_ANIMATION_MS);
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) animateOut(onClose);
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const isComplete =
    formData.patient && formData.doctor && formData.type && formData.date && formData.time;

  function handleAdd() {
    if (!isComplete) return;
    animateOut(() => onAdd(formData));
  }

  return createPortal(
    <div
      className={`${styles.overlay} ${
        closing ? anim.overlayClosing : anim.overlayEnter
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.modal} ${
          closing ? anim.modalClosing : anim.modalEnter
        }`}
      >
        <h2 className={styles.title}>Add Appointment</h2>

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
              type="date"
              className={`${styles.dateInput} ${styles.glass}`}
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Available Time:</label>
          <div className={gridStyles.timeGrid}>
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`${gridStyles.timeSlot} ${styles.glass} ${
                  formData.time === slot ? gridStyles.timeSlotActive : ""
                }`}
                onClick={() => updateField("time", slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            className={`${styles.cancelBtn} ${styles.glass}`}
            onClick={() => animateOut(onClose)}
          >
            <CancleM className={styles.icon} />
            Cancel
          </button>

          <button
            className={`${styles.saveBtn} ${styles.glass}`}
            onClick={handleAdd}
            disabled={!isComplete}
          >
            <Plus className={styles.icon} />
            Add
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AddAppointmentModal;