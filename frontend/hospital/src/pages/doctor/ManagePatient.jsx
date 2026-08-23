import styles from "./Dashboard.module.css";
import patientStyles from "./Patients.module.css";
import { useState } from "react";
import Sidebar from "./sidebarD";
import PatientProfileModal from "./PatientProfileModal";

import Calendar from "../../assets/doctor/patients/calendar.svg?react";
import Phone from "../../assets/doctor/patients/phone.svg?react";
import PersonCircle from "../../assets/doctor/patients/person.svg?react";

import patient1 from "../../assets/doctor/patients/patient1.png";
import patient2 from "../../assets/doctor/patients/patient2.png";
import patient3 from "../../assets/doctor/patients/patient3.png";
import patient4 from "../../assets/doctor/patients/patient4.png";
import patient5 from "../../assets/doctor/patients/patient5.png";
import patient6 from "../../assets/doctor/patients/patient6.png";

function DoctorManagePatient() {
  const [activeNav, setActiveNav] = useState("appointment");
  const [showMenu, setShowMenu] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patients = [
    { id: 1, firstName: "Patient", lastName: "One", dob: "2 / 05 / 2002", phone: "+962 79 120 0976", bloodType: "A+", gender: "Female", photo: patient1 },
    { id: 2, firstName: "Patient", lastName: "Two", dob: "2 / 05 / 1991", phone: "+962 79 120 0976", bloodType: "O+", gender: "Male", photo: patient2 },
    { id: 3, firstName: "Patient", lastName: "Three", dob: "22 / 09 / 2006", phone: "+962 79 120 0976", bloodType: "B+", gender: "Female", photo: patient3 },
    { id: 4, firstName: "Patient", lastName: "Four", dob: "2 / 05 / 2002", phone: "+962 79 120 0976", bloodType: "AB+", gender: "Male", photo: patient4 },
    { id: 5, firstName: "Patient", lastName: "Five", dob: "2 / 05 / 2002", phone: "+962 79 120 0976", bloodType: "A-", gender: "Female", photo: patient5 },
    { id: 6, firstName: "Patient", lastName: "Six", dob: "2 / 04 / 1988", phone: "+962 79 120 0976", bloodType: "O-", gender: "Male", photo: patient6 },
  ];

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

            <div className={patientStyles.patientGrid}>
              {patients.map((patient, i) => (
                <div
                  key={patient.id}
                  className={`${patientStyles.patientCard} ${patientStyles.fadeUp}`}
                  style={{ "--d": `${80 + i * 60}ms` }}
                >
                  <div className={`${patientStyles.imgdev} ${styles.glass}`}>
                    <img
                      className={patientStyles.patientPhoto}
                      src={patient.photo}
                      alt={`${patient.firstName} ${patient.lastName}`}
                    />
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