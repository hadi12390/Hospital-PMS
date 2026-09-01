import styles from "./Register.module.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import Logo from "./svg/logo.svg?react";
import CalendarIcon from "./svg/calendar.svg?react";
import DropdownIcon from "./svg/dropdown.svg?react";
import SaveIcon from "./svg/save.svg?react";

// ---- inline glass dropdown (native <select> can't be blurred, so this replaces it) ----
function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const triggerRect = rootRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 220;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    setOpenUp(spaceBelow < menuHeight && spaceAbove > spaceBelow);
  }, [open]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setOpen(false);
  };

  return (
    <div className={styles.dropdownRoot} ref={rootRef}>
      <button
        type="button"
        className={`${styles.inputBox} ${styles.glass} ${styles.dropdownTrigger}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className={styles.triggerLabel}>{value}</span>
        <span className={`${styles.icon} ${open ? styles.iconOpen : ""}`}>
          <DropdownIcon />
        </span>
      </button>

      {open && (
        <ul
          ref={menuRef}
          className={`${styles.dropdownMenu} ${styles.glass} ${
            openUp ? styles.dropdownMenuUp : ""
          }`}
          role="listbox"
        >
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={`${styles.dropdownOption} ${
                opt === value ? styles.dropdownOptionActive : ""
              }`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const { completePatientRegistration } = useAuth();
  const dobRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    birth_date: "",
    gender: "Female",
    personal_id: "",
    blood_type: "A+",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field) => (val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const openDatePicker = () => {
    dobRef.current?.showPicker?.();
  };

  // helper: reads a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const handleRegister = async () => {
  setError("");
  setLoading(true);

  try {
    const hostname = window.location.hostname;

    const payload = {
      ...formData,
      gender: formData.gender.toLowerCase(),
    };

    const csrfToken = getCookie("csrftoken");

    const response = await fetch(`http://${hostname}:8000/add-patient/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Server validation error:", data);
      throw new Error(data.detail || data.message || JSON.stringify(data));
    }
    completePatientRegistration();
    navigate("/patient&register/confirmed");
  } catch (err) {
    console.error("Registration error:", err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.registerPage}>
      <main className={styles.mainLog}>
        <div className={styles.headerLogo}>
          <Logo />
        </div>
        <h1 className={styles.heroText}>
          Register your information to access Medix.
        </h1>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name:</label>
            <div className={`${styles.inputBox} ${styles.glass}`}>
              <input
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange("first_name")}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Last Name:</label>
            <div className={`${styles.inputBox} ${styles.glass}`}>
              <input
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange("last_name")}
              />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone Number:</label>
          <div className={`${styles.inputBox} ${styles.glass}`}>
            <input
              type="tel"
              placeholder="+962 79 120 0976"
              value={formData.phone_number}
              onChange={handleChange("phone_number")}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Date of Birth:</label>
            <div className={`${styles.inputBox} ${styles.glass}`}>
              <input
                ref={dobRef}
                type="date"
                className={styles.dateInput}
                value={formData.birth_date}
                onChange={handleChange("birth_date")}
              />
              <button
                type="button"
                className={styles.iconBtn}
                onClick={openDatePicker}
              >
                <CalendarIcon />
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Gender:</label>
            <Dropdown
              options={["Female", "Male"]}
              value={formData.gender}
              onChange={handleSelectChange("gender")}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Personal ID:</label>
            <div className={`${styles.inputBox} ${styles.glass}`}>
              <input
                type="text"
                placeholder="123421"
                value={formData.personal_id}
                onChange={handleChange("personal_id")}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Blood Type:</label>
            <Dropdown
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              value={formData.blood_type}
              onChange={handleSelectChange("blood_type")}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className={`${styles.saveButton} ${styles.glass}`}
        >
          {loading ? "Saving..." : "Save"}
          <SaveIcon className={styles.saveIcon} />
        </button>
      </main>
    </div>
  );
}

export default Register;