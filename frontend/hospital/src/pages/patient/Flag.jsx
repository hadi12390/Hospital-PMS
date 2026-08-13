import styles from "./Flag.module.css";
import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";
import Search from "../../assets/patient/search.svg?react";
import Confarim from "../../assets/patient/selected.svg?react";
import ApprovedG from "../../assets/patient/approvedd.svg?react";
import HomeB from "../../assets/patient/homeb.svg?react";

import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const ISSUE_CATEGORIES = [
  "Appointment",
  "Payment",
  "Doctor",
  "Medical Report",
  "Technical Issue",
  "Other",
];

/* ==========================================================================
   AutoGrowTextarea — grows smoothly as content wraps or Shift+Enter is pressed
   ========================================================================== */

function AutoGrowTextarea({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset first so it can shrink back down too
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={styles.flagInput}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
    />
  );
}

/* ==========================================================================
   Step 1 — Issue form
   ========================================================================== */

function IssueForm({ selectedCategory, onSelectCategory, subject, onSubjectChange, description, onDescriptionChange, onConfirm }) {
  return (
    <div className={styles.flagStep}>
      <div className={styles.secOO}>
        <h2 className={styles.flagLabel}>Issue Category</h2>

        <div className={styles.categoryRow}>
          {ISSUE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.categoryPill} ${
                selectedCategory === cat ? styles.categoryPillSelected : styles.categoryPillUnselected
              }`}
              onClick={() => onSelectCategory(cat)}
            >
              <span className={`${styles.categoryPillBg} ${styles.categoryPillBgUnselected}`} />
              <span className={`${styles.categoryPillBg} ${styles.categoryPillBgSelected}`} />
              <span className={styles.categoryPillLabel}>{cat}</span>
            </button>
          ))}
        </div>

        <h2 className={styles.flagLabel}>Subject</h2>
        <AutoGrowTextarea
          value={subject}
          onChange={onSubjectChange}
          placeholder="example: Appointment was cancelled..."
        />

        <h2 className={styles.flagLabel}>Describe Your Issue</h2>
        <AutoGrowTextarea
          value={description}
          onChange={onDescriptionChange}
          placeholder="Describe Here..."
        />
      </div>

      <div className={styles.confirmButtonWrap}>
        <button
          type="button"
          className={styles.confirmButton}
          disabled={!selectedCategory}
          onClick={onConfirm}
        >
          Confirmed
          <span className={styles.confirmIconCircle}>
            <Confarim className={styles.confirmIcon} />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 2 — Confirmation
   ========================================================================== */

function ReportSentConfirmation({ category, submittedDay, submittedTime, onBackHome }) {
  return (
    <div className={styles.flagStep}>
      <div className={styles.confirmationCard}>
        <h2 className={styles.confirmationTitle}>Your report have been sent</h2>

        <div className={styles.confirmationBody}>
          <div className={styles.confirmationInfo}>
            <p className={styles.confirmationCategory}>{category}</p>
            <div className={styles.confirmationDateTime}>
              <p>{submittedDay}</p>
              <p>{submittedTime}</p>
            </div>
          </div>

          <div className={styles.confirmationCheckCircle}>
            <ApprovedG className={styles.confirmationCheckIcon} />
          </div>
        </div>
      </div>

      <div className={styles.backHomeButtonWrap}>
        <button type="button" className={styles.backHomeButton} onClick={onBackHome}>
          Back to Home
          <span className={styles.backHomeIconCircle}>
            <HomeB className={styles.backHomeIcon} />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Flag — page
   ========================================================================== */

function Flag() {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Appointment");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submittedAt, setSubmittedAt] = useState(null);

  const handleConfirm = () => {
    if (!selectedCategory) return;

    const now = new Date();
    setSubmittedAt({
      day: now.toLocaleDateString(undefined, { weekday: "long" }),
      time: now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    });

    setStep(2);
  };

  const handleBackHome = () => {
    navigate("/patient/home");
  };

  return (
    <div className={styles.PatientDashboard}>
      <aside className={styles.sideBar}>
        <img src="/assest/patient/logo.svg" alt="Logo" />

        <div className={styles.contSide}>
          <div className={styles.optionsContainer}>
            <NavLink
              to="/patient/home"
              className={({ isActive }) =>
                `${styles.options} ${styles.homeLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <HomeLogo className={styles.homelogoicon} />
            </NavLink>

            <NavLink
              to="/patient/appointment"
              className={({ isActive }) =>
                `${styles.options} ${styles.appLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <AppLogo className={styles.applogoicon} />
            </NavLink>

            <NavLink
              to="/patient/doctor"
              className={({ isActive }) =>
                `${styles.options} ${styles.docLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <DocLogo className={styles.doclogoicon} />
            </NavLink>

            <NavLink
              to="/patient/reports"
              className={({ isActive }) =>
                `${styles.options} ${styles.pillLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <PillLogo className={styles.pilllogoicon} />
            </NavLink>

            <NavLink
              to="/patient/payment"
              className={({ isActive }) =>
                `${styles.options} ${styles.docuLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <DocuLogo className={styles.doculogoicon} />
            </NavLink>
          </div>

          <div className={`${styles.optionsContainer} ${styles.optionsContainerNN}`}>
            <NavLink
              to="/patient/flag"
              className={({ isActive }) =>
                `${styles.options} ${styles.helpLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <HelpLogo className={styles.helplogoicon} />
            </NavLink>

            <NavLink
              to="/patient/settings"
              className={({ isActive }) =>
                `${styles.options} ${styles.settLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <SettLogo className={styles.settlogoicon} />
            </NavLink>
          </div>

          <div className={styles.logoutsec}>
            <div className={styles.optionsContainer}>
              <button className={`${styles.options} ${styles.logoutLogoButton}`}>
                <LogOutLogo className={styles.logoutlogoicon} />
              </button>

              <NavLink
                to="/patient/account"
                className={({ isActive }) =>
                  `${styles.options} ${styles.settLogoButton} ${isActive ? styles.active : ""}`
                }
              >
                <SettLogo className={styles.Asettlogoicon} />
              </NavLink>
            </div>

            <div className={styles.profPicLogOut}>
              <img src="/assest/patient/pp.png" alt="Profile" />
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
              placeholder="Search for Doctor"
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
          <div key={step} className={styles.stepFade}>
            {step === 1 ? (
              <IssueForm
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                subject={subject}
                onSubjectChange={setSubject}
                description={description}
                onDescriptionChange={setDescription}
                onConfirm={handleConfirm}
              />
            ) : (
              <ReportSentConfirmation
                category={selectedCategory}
                submittedDay={submittedAt?.day}
                submittedTime={submittedAt?.time}
                onBackHome={handleBackHome}
              />
            )}
          </div>
        </main>
      </section>
    </div>
  );
}

export default Flag;