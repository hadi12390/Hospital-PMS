import styles from "./Settings.module.css";

import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";
import Search from "../../assets/patient/search.svg?react";
import Edit from "../../assets/patient/edit.svg?react";
import Save from "../../assets/patient/save.svg?react";
import NotificationLogo from "../../assets/patient/notification.svg?react";


import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";

/* ==========================================================================
   Inline eye / eye-off icons — swap for your own asset imports if you have them
   ========================================================================== */

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.6 6.6C4.2 8.1 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.4 4.6-1.06M17.5 17.6C20.1 15.9 22 12 22 12s-1.2-2.4-3.4-4.3"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ==========================================================================
   Read-only info pill (Email / DOB / Gender)
   ========================================================================== */

function InfoPill({ label, value }) {
  return (
    <div className={styles.infoPill}>
      <span>
        {label}: {value}
      </span>
    </div>
  );
}

/* ==========================================================================
   Editable name pill (has pencil icon)
   ========================================================================== */

function EditableNamePill({ name, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopEditing = () => setIsEditing(false);

  return (
    <div className={styles.infoPill}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className={styles.nameInput}
          value={name}
          onChange={(e) => onChange(e.target.value)}
          onBlur={stopEditing}
          onKeyDown={(e) => e.key === "Enter" && stopEditing()}
        />
      ) : (
        <span>Name: {name}</span>
      )}

      <button type="button" className={styles.pillIconButton} onClick={startEditing}>
        <Edit className={styles.pillIcon} />
      </button>
    </div>
  );
}

/* ==========================================================================
   Password field with show/hide toggle
   ========================================================================== */

function PasswordField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.infoPill}>
      <input
        type={visible ? "text" : "password"}
        className={styles.passwordInput}
        placeholder={`${label}:`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <button
        type="button"
        className={styles.pillIconButton}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOffIcon className={styles.pillIcon} />
        ) : (
          <EyeIcon className={styles.pillIcon} />
        )}
      </button>
    </div>
  );
}

/* ==========================================================================
   Setting — page
   ========================================================================== */

function Setting() {
  const [searchValue, setSearchValue] = useState("");

  // personal info
  const [name, setName] = useState("Mia Quian");
  const [email] = useState("miaquian@gmail.com");
  const [dob] = useState("8 / 11 / 2006");
  const [gender] = useState("Female");
  const [avatarUrl, setAvatarUrl] = useState("/assest/patient/pp.png");
  const avatarInputRef = useRef(null);

  // password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleSaveChanges = () => {
    // wire to your API — name, avatarUrl, etc.
    console.log("Saving personal info", { name, avatarUrl });
  };

  const handleChangePassword = () => {
    // wire to your API
    console.log("Changing password", { currentPassword, newPassword, confirmPassword });
  };

  return (
    <div className={styles.PatientDashboard}>
      <aside className={styles.sideBar}>
      
              {/* Logo */}
              <div className={styles.sidebarLogo}>
                  <img
                      src="/assest/patient/logo.svg"
                      alt="Logo"
                  />
              </div>
      
      
              <div className={styles.contSide}>
      
                  {/* ================= MAIN MENU ================= */}
                  <div className={styles.optionsContainer}>
      
                      {/* Home */}
                      <NavLink
                          to="/patient/home"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.homeLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <HomeLogo className={styles.homelogoicon} />
                      </NavLink>
      
      
                      {/* Appointments */}
                      <NavLink
                          to="/patient/appointment"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.appLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <AppLogo className={styles.applogoicon} />
                      </NavLink>
      
      
                      {/* Doctors */}
                      <NavLink
                          to="/patient/doctor"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.docLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <DocLogo className={styles.doclogoicon} />
                      </NavLink>
      
      
                      {/* Reports */}
                      <NavLink
                          to="/patient/reports"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.pillLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <PillLogo className={styles.pilllogoicon} />
                      </NavLink>
      
      
                      {/* Payments */}
                      <NavLink
                          to="/patient/payment"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.docuLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <DocuLogo className={styles.doculogoicon} />
                      </NavLink>
      
                  </div>
      
      
                  {/* ================= SECOND MENU ================= */}
                  <div
                      className={`${styles.optionsContainer} ${styles.optionsContainerNN}`}
                  >
      
                      {/* Help */}
                      <NavLink
                          to="/patient/flag"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.helpLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <HelpLogo className={styles.helplogoicon} />
                      </NavLink>
      
      
                      {/* Settings */}
                      <NavLink
                          to="/patient/settings"
                          className={({ isActive }) =>
                              `${styles.options} ${styles.settLogoButton} ${
                                  isActive ? styles.active : ""
                              }`
                          }
                      >
                          <SettLogo className={styles.settlogoicon} />
                      </NavLink>
      
                  </div>
      
      
                  {/* ================= LOGOUT SECTION ================= */}
                  <div className={styles.logoutsec}>
      
                      <div className={`${styles.optionsContainer} ${styles.optionsContainerLL}`}>
      
                          {/* Logout */}
                          <button
                              type="button"
                              className={`${styles.options} ${styles.logoutLogoButton}`}
                          >
                              <LogOutLogo
                                  className={styles.logoutlogoicon}
                              />
                          </button>
      
      
                          {/* Notifications */}
                          <NavLink
                              to="/patient/notifications"
                              className={({ isActive }) =>
                                  `${styles.options} ${styles.notificationLogoButton} ${
                                      isActive ? styles.active : ""
                                  }`
                              }
                          >
                              <NotificationLogo
                                  className={styles.notificationlogoicon}
                              />
                          </NavLink>
      
                      </div>
      
      
                      {/* Profile picture */}
                      <div className={styles.profPicLogOut}>
                          <img
                              src="/assest/patient/pp.png"
                              alt="Profile"
                          />
                      </div>
      
                  </div>
      
              </div>
      
          </aside>

      <section className={styles.dashboardContent}>
        {/* Navbar */}
        <nav className={styles.nav}>
          <div className={`${styles.navContentSearch} ${styles.glass}`}>
            <div className={styles.searchIcon}>
              <Search size={18} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search in Settings"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className={`${styles.navContent} ${styles.glass}`}>
            <div className={styles.buttonAddAppoi}>
              <button>
                <div className={styles.addDivApp}>+</div>
                Make an New Appointment
              </button>
            </div>

            <div className={styles.profileSec}>
              <div className={styles.profilePic}>
                <img className={styles.navPP} src="/assest/patient/pp.png" alt="Profile" />
              </div>
              <div className={styles.nameNav}>
                <p>Mia Quian</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.cards}>
          <div className={styles.settingsPage}>
            {/* ---- Personal Information ---- */}
            <section className={styles.settingsSection}>
              <h2 className={styles.settingsTitle}>Personal Information</h2>

              <div className={styles.avatarWrap}>
                <button type="button" className={styles.avatarButton} onClick={handleAvatarClick}>
                  <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
                  <span className={styles.avatarOverlay}>
                    <Edit className={styles.avatarEditIcon} />
                  </span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className={styles.infoStack}>
                <EditableNamePill name={name} onChange={setName} />
                <InfoPill label="Email" value={email} />
                <InfoPill label="Date of Birth" value={dob} />
                <InfoPill label="Gender" value={gender} />
              </div>

              <button type="button" className={styles.primaryActionButton} onClick={handleSaveChanges}>
                Save Changes
                <span className={styles.actionIconCircle}>
                  <Save className={styles.actionIcon} />
                </span>
              </button>
            </section>

            {/* ---- Change Password ---- */}
            <section className={styles.settingsSection}>
              <h2 className={styles.settingsTitle}>Change Password</h2>

              <div className={styles.infoStack}>
                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />
                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <PasswordField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              <button type="button" className={styles.primaryActionButton} onClick={handleChangePassword}>
                Change Password
                <span className={styles.actionIconCircle}>
                  <Save className={styles.actionIcon} />
                </span>
              </button>
            </section>
          </div>
        </main>
      </section>
    </div>
  );
}

export default Setting;