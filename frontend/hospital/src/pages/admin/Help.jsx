import styles from "./Dashboard.module.css";
import { useRef, useState, useEffect } from "react";
import Sidebar from './Sidebar';

const ISSUE_CATEGORIES = [
  "Appointment",
  "Payment",
  "Patient",
  "Technical Issue",
  "Other",
];

/* ==========================================================================
   AutoGrowTextarea
   ========================================================================== */

function AutoGrowTextarea({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={styles.helpInput}
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
    <div className={styles.helpStep}>
      <div className={styles.helpSection}>
        <h2 className={styles.helpLabel}>Issue Category</h2>

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

        <h2 className={styles.helpLabel}>Subject</h2>
        <AutoGrowTextarea
          value={subject}
          onChange={onSubjectChange}
          placeholder="example: Patient record not syncing..."
        />

        <h2 className={styles.helpLabel}>Describe Your Issue</h2>
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
            <img src="/assest/doctor/cards/check.svg" alt="" className={styles.confirmIcon} />
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
    <div className={styles.helpStep}>
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
            <img src="/assest/doctor/cards/check-white.svg" alt="" className={styles.confirmationCheckIcon} />
          </div>
        </div>
      </div>

      <div className={styles.backHomeButtonWrap}>
        <button type="button" className={styles.backHomeButton} onClick={onBackHome}>
          Back to Dashboard
          <span className={styles.backHomeIconCircle}>
            <img src="/assest/doctor/cards/home.svg" alt="" className={styles.backHomeIcon} />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Help — page
   ========================================================================== */

function Help() {
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("help");

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
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
    setStep(1);
    setSelectedCategory("");
    setSubject("");
    setDescription("");
    setSubmittedAt(null);
    setActiveNav("dashboard");
    // navigate("/doctor/home") — swap in your router call here
  };

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

export default Help;