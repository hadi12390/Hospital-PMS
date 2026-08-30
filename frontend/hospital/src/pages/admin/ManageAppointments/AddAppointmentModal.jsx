import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./EditAppointmentModal.module.css";
import gridStyles from "./AddAppointmentModal.module.css";
import tableStyles from "./DoctorsTable.module.css";
import anim from "./modalAnimations.module.css";

import ArrowDown from "./svg/arrowdown.svg?react";
import CancleM from "./svg/cancleM.svg?react";
import Plus from "./svg/plus.svg?react";

const CLOSE_ANIMATION_MS = 180;
const hostName = window.location.hostname;
const API_BASE = `http://${hostName}:8000`;

// ---- helpers -------------------------------------------------------------

function isRealPatientId(publicId) {
  // Guest bookings come back with a placeholder string instead of a UUID.
  return Boolean(publicId) && publicId !== "User Is guest.";
}

// Converts "09:00 AM" -> "09:00:00", "14:00 PM" -> "14:00:00" (tolerates the
// backend's inconsistent AM/PM labeling on 24h-style hours).
function timeLabelToClock(label) {
  const [time, meridiemRaw] = label.split(" ");
  let [h, m] = time.split(":").map(Number);
  const meridiem = (meridiemRaw || "").toUpperCase();
  if (h < 12 && meridiem === "PM") h += 12;
  if (h === 12 && meridiem === "AM") h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function buildScheduledTime(dateStr, timeLabel) {
  return `${dateStr}T${timeLabelToClock(timeLabel)}`;
}

async function fetchJson(url, opts) {
  console.log("[fetchJson] →", url, opts || "");
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[fetchJson] ✗", res.status, res.statusText, body);
    throw new Error(`${res.status} ${res.statusText} - ${body}`);
  }
  const json = await res.json();
  console.log("[fetchJson] ✓", url, json);
  return json;
}

// ---- dropdown --------------------------------------------------------------

function FieldDropdown({ label, value, options, onSelect, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={tableStyles.dropdownWrapper}>
        <button
          type="button"
          className={`${styles.selectBtn} ${styles.glass}`}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
        >
          <span className={selected ? styles.selectValue : styles.selectPlaceholder}>
            {selected ? selected.label : placeholder}
          </span>
          <ArrowDown className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
        </button>

        {open && (
          <div className={`${tableStyles.dropdownMenu} ${styles.glass}`}>
            {options.length === 0 && (
              <div className={tableStyles.dropdownItem}>No options</div>
            )}
            {options.map((option, index) => (
              <button
                key={option.id ?? `option-${index}`}
                type="button"
                className={`${tableStyles.dropdownItem} ${
                  value === option.id ? tableStyles.dropdownItemActive : ""
                }`}
                onClick={() => {
                  console.log(`[FieldDropdown:${label}] selected`, option);
                  onSelect(option.id);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- main modal ------------------------------------------------------------

function AddAppointmentModal({ types, onClose, onAdd }) {
  const [closing, setClosing] = useState(false);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listError, setListError] = useState(null);

  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    type: "",
    date: "",
    time: "",
  });

  // Log every form data change so you can see state evolve in the console.
  useEffect(() => {
    console.log("[formData]", formData);
  }, [formData]);

  // Load patients + doctors once on mount.
  useEffect(() => {
    let cancelled = false;

    async function loadLists() {
      console.log("[loadLists] starting fetch of patients + doctors");
      setLoadingLists(true);
      setListError(null);
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetchJson(`${API_BASE}/manager/manage-patients/`),
          fetchJson(`${API_BASE}/manager/manage-doctors/`),
        ]);

        if (cancelled) {
          console.log("[loadLists] cancelled after fetch, skipping state update");
          return;
        }

        const patientOptions = (patientsRes.patients || [])
          .filter((p) => isRealPatientId(p.patient.public_id))
          .map((p) => ({
            id: p.patient.public_id,
            label: `${p.patient.name} (${p.phone})`,
          }));

        const doctorOptions = (doctorsRes.doctors || []).map((d) => ({
          id: d.doctor.public_id,
          label: d.status === "On Leave" ? `${d.doctor.name} (On Leave)` : d.doctor.name,
        }));

        console.log("[loadLists] patientOptions", patientOptions);
        console.log("[loadLists] doctorOptions", doctorOptions);

        setPatients(patientOptions);
        setDoctors(doctorOptions);
      } catch (err) {
        console.error("[loadLists] error", err);
        if (!cancelled) setListError(err.message);
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    }

    loadLists();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refetch available times whenever the slot-determining fields change.
  useEffect(() => {
    const { doctor, type, date, patient } = formData;
    if (!doctor || !type || !date || !patient) {
      console.log("[loadTimes] skipped — missing one of doctor/type/date/patient", {
        doctor,
        type,
        date,
        patient,
      });
      setAvailableTimes([]);
      return;
    }

    let cancelled = false;

    async function loadTimes() {
      console.log("[loadTimes] fetching available times for", { doctor, type, date, patient });
      setLoadingTimes(true);
      setTimesError(null);
      try {
        const params = new URLSearchParams({ date, doctor, type, patient });
        const res = await fetchJson(
          `${API_BASE}/appointment/available-times/?${params.toString()}`
        );
        if (cancelled) return;
        // Adjust this line if the real response shape differs.
        const slots = res.available_times || res.times || [];
        console.log("[loadTimes] resolved slots", slots);
        setAvailableTimes(slots);
      } catch (err) {
        console.error("[loadTimes] error", err);
        if (!cancelled) setTimesError(err.message);
      } finally {
        if (!cancelled) setLoadingTimes(false);
      }
    }

    loadTimes();
    return () => {
      cancelled = true;
    };
  }, [formData.doctor, formData.type, formData.date, formData.patient]);

  function animateOut(action) {
    if (closing) return;
    console.log("[animateOut] closing modal");
    setClosing(true);
    setTimeout(action, CLOSE_ANIMATION_MS);
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) animateOut(onClose);
  }

  const updateField = useCallback((field, value) => {
    console.log("[updateField]", field, "=", value);
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Changing anything upstream of the time grid invalidates the picked time.
      if (["doctor", "type", "date", "patient"].includes(field)) {
        next.time = "";
      }
      return next;
    });
  }, []);

  const isComplete =
    formData.patient && formData.doctor && formData.type && formData.date && formData.time;

  async function handleAdd() {
    console.log("[handleAdd] clicked. isComplete =", isComplete, "formData =", formData);
    if (!isComplete || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = {
        doctor: formData.doctor,
        patient: formData.patient,
        scheduled_time: buildScheduledTime(formData.date, formData.time),
        reason_for_visit: "",
        notes: "",
        status: "pending",
        appointment_type: formData.type,
      };
      console.log("[handleAdd] POST body", body);

      const created = await fetchJson(`${API_BASE}/appointment/manager/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("[handleAdd] success response", created);
      onAdd(created);
      setSuccess(true);
      setTimeout(() => animateOut(onClose), 500);
    } catch (err) {
      console.error("[handleAdd] failed", err);
      setSubmitError(err.message);
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className={`${styles.overlay} ${closing ? anim.overlayClosing : anim.overlayEnter}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.modal} ${closing ? anim.modalClosing : anim.modalEnter}`}>
        <h2 className={styles.title}>Add Appointment</h2>

        {listError && <p className={styles.error}>Failed to load lists: {listError}</p>}

        <FieldDropdown
          label="Patient:"
          value={formData.patient}
          options={patients}
          placeholder={loadingLists ? "Loading..." : "Select patient"}
          onSelect={(v) => updateField("patient", v)}
          disabled={loadingLists}
        />

        <FieldDropdown
          label="Doctor:"
          value={formData.doctor}
          options={doctors}
          placeholder={loadingLists ? "Loading..." : "Select doctor"}
          onSelect={(v) => updateField("doctor", v)}
          disabled={loadingLists}
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
          {loadingTimes && <p>Loading times...</p>}
          {timesError && <p className={styles.error}>{timesError}</p>}
          {!loadingTimes && !timesError && (
            <div className={gridStyles.timeGrid}>
              {availableTimes.length === 0 ? (
                <p className={styles.selectPlaceholder}>
                  Select patient, doctor, type and date first
                </p>
              ) : (
                availableTimes.map((slot) => (
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
                ))
              )}
            </div>
          )}
        </div>

        {submitError && <p className={styles.error}>Failed to save: {submitError}</p>}

        <div className={styles.actionsRow}>
          <button className={`${styles.cancelBtn} ${styles.glass}`} onClick={() => animateOut(onClose)}>
            <CancleM className={styles.icon} />
            Cancel
          </button>

          <button
            className={`${styles.saveBtn} ${styles.glass}`}
            onClick={handleAdd}
            disabled={!isComplete || submitting}
          >
            {success ? (
              <>✓ Added</>
            ) : (
              <>
                <Plus className={styles.icon} />
                {submitting ? "Adding..." : "Add"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AddAppointmentModal; 