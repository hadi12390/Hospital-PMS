import styles from "./Register.module.css";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "./svg/logo.svg?react";
import CalendarIcon from "./svg/calendar.svg?react";
import DropdownIcon from "./svg/dropdown.svg?react";
import SaveIcon from "./svg/save.svg?react";

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

  const openDatePicker = () => {
    // showPicker() is supported in modern Chromium/Firefox; falls back silently otherwise
    dobRef.current?.showPicker?.();
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://alpha.localhost:8000/dj-rest-auth/registration/",
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
      <div className={styles.headerLogo}>
        <Logo />
      </div>

      <main className={styles.mainLog}>
        <h1 className={styles.heroText}>
          Register your information to access Medix.
        </h1>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label className={styles.label}>Email:</label>
          <div className={`${styles.inputBox} glass`}>
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
          <div className={`${styles.inputBox} glass`}>
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
          <div className={`${styles.inputBox} glass`}>
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
            <div className={`${styles.inputBox} glass`}>
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
            <div className={`${styles.inputBox} glass`}>
              <select
                className={styles.selectInput}
                value={formData.gender}
                onChange={handleChange("gender")}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
              <span className={styles.icon}>
                <DropdownIcon />
              </span>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Personal ID:</label>
            <div className={`${styles.inputBox} glass`}>
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
            <div className={`${styles.inputBox} glass`}>
              <select
                className={styles.selectInput}
                value={formData.blood_type}
                onChange={handleChange("blood_type")}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  )
                )}
              </select>
              <span className={styles.icon}>
                <DropdownIcon />
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className={`${styles.saveButton} glass`}
        >
          {loading ? "Saving..." : "Save"}
          <SaveIcon className={styles.saveIcon} />
        </button>
      </main>
    </div>
  );
}

export default Register;