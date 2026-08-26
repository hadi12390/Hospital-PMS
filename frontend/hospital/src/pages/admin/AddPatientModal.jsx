import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./AddPatientModal.module.css";

import Save from "../../assets/manager/approvedM.svg?react";
import SaveM from "../../assets/manager/saveM.svg?react";
import Calender from "../../assets/manager/calenderM.svg?react";
import ArrowDown from "../../assets/manager/arrowdown.svg?react";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  userName: "",
  phone: "",
  birth_date: "",
  gender: "",
  personalId: "",
  bloodType: "",
};

const hostName = window.location.hostname;
const API_URL = `http://${hostName}:8000/add-patient/`;

function AddPatientModal({ onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [closing, setClosing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const dobInputRef = useRef();

  // Keep the raw ISO date (YYYY-MM-DD) separately for the API,
  // and only format DD/MM/YYYY for display.
  const [dobIso, setDobIso] = useState("");

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDobChange(e) {
    const value = e.target.value; // YYYY-MM-DD
    if (!value) {
      setForm((prev) => ({ ...prev, birth_date: "" }));
      setDobIso("");
      return;
    }
    setDobIso(value);
    const [year, month, day] = value.split("-");
    setForm((prev) => ({ ...prev, birth_date: `${day}/${month}/${year}` }));
  }

  function openDatePicker() {
    if (dobInputRef.current?.showPicker) {
      dobInputRef.current.showPicker();
    } else {
      dobInputRef.current?.focus();
    }
  }

  function handleClose() {
    setClosing(true);
    setTimeout(() => onClose(), 200);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Map camelCase form state -> snake_case fields the API expects
    const payload = {
      personal_id: form.personalId,
      first_name: form.firstName,
      last_name: form.lastName,
      birth_date: dobIso, // send YYYY-MM-DD, not DD/MM/YYYY
      gender: form.gender,
      phone_number: form.phone,
      blood_type: form.bloodType,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.detail || JSON.stringify(errData) || `Request failed (${res.status})`
        );
      }

      const savedPatient = await res.json();
      onSave(savedPatient); // pass back what the server actually created
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to add patient.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const modalContent = (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayOut : ""}`}
      onClick={handleClose}
    >
      <form
        className={`${styles.modal} ${closing ? styles.modalOut : ""}`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Add Patient</h2>


        <div className={styles.row}>
          <div className={styles.field}>
            <label>First Name:</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Mia"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Last Name:</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Quien"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@clinic.com"
          />
        </div>

        <div className={styles.field}>
          <label>User Name (optional):</label>
          <input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="@MiaQuien"
          />
        </div>

        <div className={styles.field}>
          <label>Phone Number:</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+962 79 120 0976"
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Date of Birth:</label>
            <div className={styles.dateWrap} onClick={openDatePicker}>
              <span
                className={form.birth_date ? styles.dateValue : styles.datePlaceholder}
              >
                {form.birth_date || "DD / MM / YYYY"}
              </span>
              <Calender className={styles.calIcon} />
              <input
                ref={dobInputRef}
                type="date"
                className={styles.hiddenDate}
                onChange={handleDobChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Gender:</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Personal ID:</label>
            <input
              name="personalId"
              value={form.personalId}
              onChange={handleChange}
              placeholder="123421"
            />
          </div>

          <div className={styles.field}>
            <label>Blood Type:</label>
            <select
              name="bloodType"
              value={form.bloodType}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}


        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={submitting}
          >
            <Save className={styles.btnIcon} />
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={submitting}>
            <SaveM className={styles.btnIcon} />
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default AddPatientModal;