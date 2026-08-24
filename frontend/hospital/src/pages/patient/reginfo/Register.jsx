import styles from "./Register.module.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  // decide whether the menu should drop up or down based on available space
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const triggerRect = rootRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 220;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // only flip up if there's not enough room below AND more room above
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
  const dobRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone_number: "",
    date_of_birth: "",
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
    // showPicker() is supported in modern Chromium/Firefox; falls back silently otherwise
    dobRef.current?.showPicker?.();
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const hostname = window.location.hostname;
      const response = await fetch(
        `http://${hostname}:8000/dj-rest-auth/registration/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login");
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

        <div className={styles.field}>
          <label className={styles.label}>Email:</label>
          <div className={`${styles.inputBox} ${styles.glass}`}>
            <input
              type="email"
              placeholder="example@clinic.com"
              value={formData.email}
              onChange={handleChange("email")}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>User Name (optional):</label>
          <div className={`${styles.inputBox} ${styles.glass}`}>
            <input
              type="text"
              placeholder="@MiaQuien"
              value={formData.username}
              onChange={handleChange("username")}
            />
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
                value={formData.date_of_birth}
                onChange={handleChange("date_of_birth")}
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