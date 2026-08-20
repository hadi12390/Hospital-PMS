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
  dob: "",
  gender: "",
  personalId: "",
  bloodType: "",
};

function AddPatientModal({ onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [closing, setClosing] = useState(false);
  const dobInputRef = useRef();

  // Lock page scroll while the modal is open
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
      setForm((prev) => ({ ...prev, dob: "" }));
      return;
    }
    const [year, month, day] = value.split("-");
    setForm((prev) => ({ ...prev, dob: `${day}/${month}/${year}` }));
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

  function handleSubmit(e) {
    e.preventDefault();

    const newPatient = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      userName: form.userName,
      phone: form.phone,
      dob: form.dob,
      gender: form.gender,
      personalId: form.personalId,
      bloodType: form.bloodType,
    };

    onSave(newPatient);
    handleClose();
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
            required
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
                className={form.dob ? styles.dateValue : styles.datePlaceholder}
              >
                {form.dob || "DD / MM / YYYY"}
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
              <option value="Female">Female</option>
              <option value="Male">Male</option>
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

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleClose}
          >
            <Save className={styles.btnIcon} />
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn}>
            <SaveM className={styles.btnIcon} />
            Save
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default AddPatientModal;