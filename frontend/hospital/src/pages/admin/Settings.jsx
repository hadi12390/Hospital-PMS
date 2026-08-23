import styles from "./Dashboard.module.css";
import setting from "./Settings.module.css";

import { useRef, useState } from "react"
import Sidebar from './Sidebar';

import Edit from "./../../assets/manager/edit.svg?react";
import Save from "./../../assets/manager/save.svg?react";
import Eye from "./../../assets/manager/eye-open.svg?react";
import EyeOff from "./../../assets/manager/eye-close.svg?react";

function Settings() {
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("settings");

  // ---------- Profile fields ----------
  const [profile, setProfile] = useState({
    username: "MVMOD",
    firstName: "MVMOD",
    email: "MVMOD@gmail.com",
  });

  const [editingField, setEditingField] = useState(null); // "username" | "firstName" | "email" | null
  const [draft, setDraft] = useState("");
  const inputRefs = useRef({});

  function startEdit(field) {
    setDraft(profile[field]);
    setEditingField(field);
    requestAnimationFrame(() => inputRefs.current[field]?.focus());
  }

  function commitEdit(field) {
    setProfile((prev) => ({ ...prev, [field]: draft.trim() || prev[field] }));
    setEditingField(null);
  }

  function handleFieldKeyDown(e, field) {
    if (e.key === "Enter") commitEdit(field);
    if (e.key === "Escape") setEditingField(null);
  }

  function handleSave() {
    console.log("Saving profile:", profile);
  }

  // ---------- Password fields ----------
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");

  function updatePassword(field, value) {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError("");
  }

  function toggleVisible(field) {
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function handlePasswordSave() {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setPasswordError("Please fill in all fields.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    // hook up your API call here
    console.log("Changing password:", passwords);

    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordError("");
  }

  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* Right Side */}
      <section className={styles.dashboardContent}>
        {/* Navbar */}
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
                    <img
                      width="40%"
                      src="/assest/doctor/cards/log-out.svg"
                      alt="a"
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.cards}>
          <div className={setting.settingsPage}>

            {/* ============== PERSONAL INFO ============== */}
            <div className={`${setting.heroName} ${setting.fadeUp}`} style={{ "--d": "0ms" }}>
              <h1>Personal Information</h1>
            </div>

            <div className={`${setting.SetSecOne} ${setting.fadeUp}`} style={{ "--d": "80ms" }}>
              <div className={setting.avatarWrap}>
                <div className={`${styles.glass} ${setting.devOne}`}>
                  <div className={setting.devTwo}>
                    {profile.firstName.charAt(0)}
                  </div>
                </div>
                <button className={setting.devThree} aria-label="Change photo">
                  <Edit />
                </button>
              </div>

              {/* ---- Editable fields ---- */}
              <div className={setting.fieldsCol}>

                <div className={`${setting.fieldRow} ${setting.fadeUp}`} style={{ "--d": "140ms" }}>
                  <span className={setting.fieldLabel}>username:</span>
                  {editingField === "username" ? (
                    <input
                      ref={(el) => (inputRefs.current.username = el)}
                      className={setting.fieldInput}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitEdit("username")}
                      onKeyDown={(e) => handleFieldKeyDown(e, "username")}
                    />
                  ) : (
                    <span className={setting.fieldValue}>{profile.username}</span>
                  )}
                  <button
                    type="button"
                    className={setting.fieldEditBtn}
                    onClick={() =>
                      editingField === "username" ? commitEdit("username") : startEdit("username")
                    }
                    aria-label="Edit username"
                  >
                    <Edit />
                  </button>
                </div>

                <div className={`${setting.fieldRow} ${setting.fadeUp}`} style={{ "--d": "180ms" }}>
                  <span className={setting.fieldLabel}>First Name:</span>
                  {editingField === "firstName" ? (
                    <input
                      ref={(el) => (inputRefs.current.firstName = el)}
                      className={setting.fieldInput}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitEdit("firstName")}
                      onKeyDown={(e) => handleFieldKeyDown(e, "firstName")}
                    />
                  ) : (
                    <span className={setting.fieldValue}>{profile.firstName}</span>
                  )}
                  <button
                    type="button"
                    className={setting.fieldEditBtn}
                    onClick={() =>
                      editingField === "firstName" ? commitEdit("firstName") : startEdit("firstName")
                    }
                    aria-label="Edit first name"
                  >
                    <Edit />
                  </button>
                </div>

                <div className={`${setting.fieldRow} ${setting.fadeUp}`} style={{ "--d": "220ms" }}>
                  <span className={setting.fieldLabel}>Email:</span>
                  {editingField === "email" ? (
                    <input
                      ref={(el) => (inputRefs.current.email = el)}
                      className={setting.fieldInput}
                      type="email"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitEdit("email")}
                      onKeyDown={(e) => handleFieldKeyDown(e, "email")}
                    />
                  ) : (
                    <span className={setting.fieldValue}>{profile.email}</span>
                  )}
                  <button
                    type="button"
                    className={setting.fieldEditBtn}
                    onClick={() =>
                      editingField === "email" ? commitEdit("email") : startEdit("email")
                    }
                    aria-label="Edit email"
                  >
                    <Edit />
                  </button>
                </div>

              </div>

              <button
                type="button"
                className={`${setting.saveButton} ${setting.fadeUp}`}
                style={{ "--d": "260ms" }}
                onClick={handleSave}
              >
                Save Changes
                <Save className={setting.saveIcon} />
              </button>

            </div>

            {/* ============== CHANGE PASSWORD ============== */}
            <div className={`${setting.heroName} ${setting.fadeUp}`} style={{ "--d": "320ms" }}>
              <h1>Change Password</h1>
            </div>

            <div className={`${setting.SetSecOne} ${setting.fadeUp}`} style={{ "--d": "360ms" }}>
              <div className={setting.fieldsCol}>

                <div className={`${setting.fieldRow} ${setting.fadeUp}`} style={{ "--d": "400ms" }}>
                  <span className={setting.fieldLabel}>Password:</span>
                  <input
                    type={visible.current ? "text" : "password"}
                    className={setting.fieldInput}
                    placeholder="Current password"
                    value={passwords.current}
                    onChange={(e) => updatePassword("current", e.target.value)}
                  />
                  <button
                    type="button"
                    className={setting.fieldEditBtn}
                    onClick={() => toggleVisible("current")}
                    aria-label={visible.current ? "Hide password" : "Show password"}
                  >
                    {visible.current ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <div className={`${setting.fieldRow} ${setting.fadeUp}`} style={{ "--d": "440ms" }}>
                  <span className={setting.fieldLabel}>New Password:</span>
                  <input
                    type={visible.next ? "text" : "password"}
                    className={setting.fieldInput}
                    placeholder="New password"
                    value={passwords.next}
                    onChange={(e) => updatePassword("next", e.target.value)}
                  />
                  <button
                    type="button"
                    className={setting.fieldEditBtn}
                    onClick={() => toggleVisible("next")}
                    aria-label={visible.next ? "Hide password" : "Show password"}
                  >
                    {visible.next ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <div className={`${setting.fieldRow} ${setting.fadeUp}`} style={{ "--d": "480ms" }}>
                  <span className={setting.fieldLabel}>Confirm Password:</span>
                  <input
                    type={visible.confirm ? "text" : "password"}
                    className={setting.fieldInput}
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={(e) => updatePassword("confirm", e.target.value)}
                  />
                  <button
                    type="button"
                    className={setting.fieldEditBtn}
                    onClick={() => toggleVisible("confirm")}
                    aria-label={visible.confirm ? "Hide password" : "Show password"}
                  >
                    {visible.confirm ? <EyeOff /> : <Eye />}
                  </button>
                </div>

              </div>

              {passwordError && (
                <p className={setting.fieldError}>{passwordError}</p>
              )}

              <button
                type="button"
                className={`${setting.saveButton} ${setting.fadeUp}`}
                style={{ "--d": "520ms" }}
                onClick={handlePasswordSave}
              >
                Save
                <Save className={setting.saveIcon} />
              </button>

            </div>

          </div>
        </main>
      </section>
    </div>
  );
}

export default Settings;