import styles from "./Dashboard.module.css";
import formStyles from "./AddUser.module.css";
import { useRef, useState, useEffect } from "react";
import Sidebar from './Sidebar';

import ArrowDown from "../../assets/manager/arrowdown.svg?react";
import PersonM from "../../assets/manager/persons.svg?react";
import Mail from "../../assets/manager/mail.svg?react";

const ROLE_OPTIONS = ["Manager", "Doctor", "Patient"];

/* ==========================================================================
   Step 1 — Add User form
   ========================================================================== */

function IssueForm({
  username, onUsernameChange,
  email, onEmailChange,
  firstName, onFirstNameChange,
  lastName, onLastNameChange,
  password, onPasswordChange,
  confirmPassword, onConfirmPasswordChange,
  role, onRoleChange,
  onConfirm,
}) {
  const [openDropdown, setOpenDropdown] = useState(false);

  function handleSelectRole(value) {
    onRoleChange(value);
    setOpenDropdown(false);
  }

  return (
    <div className={`${formStyles.formCard} ${formStyles.glass}`}>
      <h2 className={formStyles.formTitle}>Add User</h2>

      <div className={formStyles.formFields}>
        <div className={formStyles.fieldRow}>
          <label className={formStyles.fieldLabel}>User:</label>
          <input
            type="text"
            placeholder="@username"
            className={`${formStyles.fieldInput} ${formStyles.glass}`}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </div>

        <div className={formStyles.fieldRow}>
          <label className={formStyles.fieldLabel}>Email:</label>
          <input
            type="email"
            placeholder="username@clinic.com"
            className={`${formStyles.fieldInput} ${formStyles.glass}`}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>

        <div className={formStyles.fieldRow}>
          <label className={formStyles.fieldLabel}>First Name:</label>
          <input
            type="text"
            placeholder="Emma"
            className={`${formStyles.fieldInput} ${formStyles.glass}`}
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
        </div>

        <div className={formStyles.fieldRow}>
          <label className={formStyles.fieldLabel}>Last Name:</label>
          <input
            type="text"
            placeholder="Watson"
            className={`${formStyles.fieldInput} ${formStyles.glass}`}
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
        </div>

        <div className={formStyles.fieldRow}>
          <label className={formStyles.fieldLabel}>Password:</label>
          <input
            type="password"
            placeholder="Password"
            className={`${formStyles.fieldInput} ${formStyles.glass}`}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />
        </div>

        <div className={formStyles.fieldRow}>
          <label className={formStyles.fieldLabel}>Confirm Password:</label>
          <input
            type="password"
            placeholder="Password Confirm"
            className={`${formStyles.fieldInput} ${formStyles.glass}`}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
          />
        </div>

        <div className={formStyles.fieldRow} style={{ position: "relative" }}>
          <label className={formStyles.fieldLabel}>Role:</label>
          <button
            type="button"
            className={`${formStyles.fieldSelect} ${formStyles.glass}`}
            onClick={() => setOpenDropdown((prev) => !prev)}
          >
            {role || "Select role"}
            <ArrowDown className={formStyles.selectIcon} />
          </button>

          {openDropdown && (
            <div
              className={`${formStyles.fieldSelect} ${formStyles.glass}`}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                flexDirection: "column",
                alignItems: "stretch",
                maxWidth: "320px",
                width: "100%",
                zIndex: 100,
              }}
            >
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectRole(option)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#F1EFE8",
                    textAlign: "left",
                    padding: "8px 4px",
                    cursor: "pointer",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={formStyles.formActions}>
        <button className={formStyles.addBtn} onClick={onConfirm}>
          + Add
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 2 — Confirmation
   ========================================================================== */

function ReportSentConfirmation({ username, email, role, onBackHome }) {
  return (
    <div className={`${formStyles.confirmCard} ${formStyles.glass}`}>
      <h2 className={formStyles.confirmTitle}>User have been Added</h2>

      <div className={`${formStyles.userCard} ${formStyles.glass}`}>
        <div className={formStyles.userAvatar}>
          {username ? username.charAt(0).toUpperCase() : "U"}
        </div>

        <div className={formStyles.userInfo}>
          <p className={formStyles.userHandle}>@{username}</p>

          <div className={formStyles.userMeta}>
            <Mail className={formStyles.metaIcon} />
            <span>{email}</span>
          </div>

          <div className={formStyles.userMeta}>
            <PersonM className={formStyles.metaIcon} />
            <span>{role}</span>
          </div>
        </div>
      </div>

      <div className={formStyles.confirmActions}>
        <button className={formStyles.backBtn} onClick={onBackHome}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function AddUser() {
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("help");

  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!username || !email) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://alpha.localhost:8000/accounts/create-user/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password,
          confirm_password: confirmPassword,
          role,
        }),
      });

      const data = await response.json();
      console.log("403 response body:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add user");
      }

      setStep(2);

    } catch (err) {
      console.error("Add user error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  

  const handleBackHome = () => {
    setStep(1);
    setUsername("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setActiveNav("dashboard");
  };

  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      <section className={styles.dashboardContent}>
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            <div className={styles.buttonAddAppoi}>
              <button>
                <img src="/assest/doctor/cards/Add.svg" alt="Add" />
                Doctor
              </button>
            </div>

            <img src="/assest/doctor/cards/LIne3.svg" alt="" />

            <div className={styles.profileSec}>
              <div className={styles.profilePic}>M</div>

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
        </nav>

        <main className={styles.cards}>
          <div key={step} className={styles.stepFade}>
            {step === 1 ? (
              <IssueForm
                username={username} onUsernameChange={setUsername}
                email={email} onEmailChange={setEmail}
                firstName={firstName} onFirstNameChange={setFirstName}
                lastName={lastName} onLastNameChange={setLastName}
                password={password} onPasswordChange={setPassword}
                confirmPassword={confirmPassword} onConfirmPasswordChange={setConfirmPassword}
                role={role} onRoleChange={setRole}
                onConfirm={handleConfirm}
              />
            ) : (
              <ReportSentConfirmation
                username={username}
                email={email}
                role={role}
                onBackHome={handleBackHome}
              />
            )}
          </div>
        </main>
      </section>
    </div>
  );
}

export default AddUser;