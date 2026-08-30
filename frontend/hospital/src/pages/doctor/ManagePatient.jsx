import styles from "./Dashboard.module.css";
import patientStyles from "./Patients.module.css";
import { useState, useEffect } from "react";
import Sidebar from "./sidebarD";
import PatientProfileModal from "./PatientProfileModal";

import Calendar from "../../assets/doctor/patients/calendar.svg?react";
import Phone from "../../assets/doctor/patients/phone.svg?react";
import PersonCircle from "../../assets/doctor/patients/person.svg?react";

import defaultAvatar from "../../assets/doctor/patients/patient1.png";


const API_BASE = `http://${window.location.hostname}:8000`;

function formatDob(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day} / ${month} / ${year}`;
}

function formatPhone(raw) {
  if (!raw) return "—";
  const cc = raw.slice(0, 4);   // "+962"
  const rest = raw.slice(4);    // "791215103"
  return `${cc} ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

function DoctorManagePatient() {
  const [activeNav, setActiveNav] = useState("appointment");
  const [showMenu, setShowMenu] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPatients() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/doctor/patients/`, {
         method: "GET",
         credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        console.log(data)

        const mapped = data.map((p, i) => {
          const { firstName, lastName } = splitName(p.name);
          return {
            id: p.public_id && p.public_id !== "User is guest." ? p.public_id : i,
            firstName,
            lastName,
            dob: formatDob(p.birth_date),
            phone: formatPhone(p.phone_number),
            photo: p.profile_picture ,
          };
        });

        setPatients(mapped);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load patients.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
    return () => controller.abort();
  }, []);

  function handleSeeProfile(patient) {
    setSelectedPatient(patient);
  }

  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      <section className={styles.dashboardContent}>
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            <button
              onMouseEnter={() => setStopped(true)}
              className={styles.pinding}>
              <img
               className={`${styles.icon} ${stopped ? styles.stopped : ""}`}
               width="10%" src="/assest/doctor/sidebar/notification-svgrepo-com.svg" alt="" />
               <div
               className={`${styles.pindingNum} ${stopped ? styles.stoppedN : ""}`}>
                12
               </div>
               Pending Appointments
               <img width="5%" src="/assest/doctor/cards/go-svgrepo-com 1.svg" alt="" />
            </button>
            <div className={styles.co}>
              <div className={styles.buttonAddAppoi}>
                <button>
                  <img src="/assest/doctor/cards/Add.svg" alt="Add" />
                  Appointment
                </button>
              </div>

              <img src="/assest/doctor/cards/LIne3.svg" alt="" />

              <div className={styles.profileSec}>
                <div className={styles.profilePic}>J</div>

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
          </div>
        </nav>

        <main className={styles.cards}>
          <div className={patientStyles.patientsPage}>

            <div className={`${patientStyles.heroName} ${patientStyles.fadeUp}`} style={{ "--d": "0ms" }}>
              <h1>My Patients</h1>
            </div>

            {loading && (
              <p className={patientStyles.patientMeta}>Loading patients…</p>
            )}

            {error && !loading && (
              <p className={patientStyles.patientMeta}>
                Couldn't load patients: {error}
              </p>
            )}

            {!loading && !error && patients.length === 0 && (
              <p className={patientStyles.patientMeta}>No patients found.</p>
            )}

            {!loading && !error && patients.length > 0 && (
              <div className={patientStyles.patientGrid}>
                {patients.map((patient, i) => (
                  <div
                    key={patient.id}
                    className={`${patientStyles.patientCard} ${patientStyles.fadeUp}`}
                    style={{ "--d": `${80 + i * 60}ms` }}
                  >
                    <div className={`${patientStyles.imgdev} ${styles.glass}`}>
                      {patient.photo ? (
                        <img
                          className={patientStyles.patientPhoto}
                          src={patient.photo}
                          alt={`${patient.firstName} ${patient.lastName}`}
                        />
                      ) : (
                        <h1 className={`${patientStyles.letter} ${patientStyles.patientPhotoA}`}>
                          {patient.firstName?.charAt(0).toUpperCase()}
                        </h1>
                      )}
                      
                    </div>

                    <div className={patientStyles.patientInfo}>
                      <h3 className={patientStyles.patientName}>
                        {patient.firstName} {patient.lastName}
                      </h3>

                      <p className={patientStyles.patientMeta}>
                        <Calendar className={patientStyles.metaIcon} />
                        {patient.dob}
                      </p>
                      <p className={patientStyles.patientMeta}>
                        <Phone className={patientStyles.metaIcon} />
                        {patient.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`${styles.glass} ${patientStyles.seeProfileBtn}`}
                      onClick={() => handleSeeProfile(patient)}
                    >
                      <div className={patientStyles.contbtn}><PersonCircle className={patientStyles.seeProfileIcon} /></div>
                      See Profile
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </section>

      {selectedPatient && (
        <PatientProfileModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

export default DoctorManagePatient;