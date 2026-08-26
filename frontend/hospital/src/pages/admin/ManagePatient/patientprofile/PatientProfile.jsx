import styles from "../../Dashboard.module.css";
import layoutStyles from "../../ManageDoctors.module.css";

import profileStyles from "./DoctorProfile.module.css";

import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";


import Sidebar from '../../Sidebar';

import doctorImg from "./doctor.png";

import Doctor from "../../../../assets/manager/patientLogo.svg?react";
import Time from "../../../../assets/manager/time.svg?react";
import Drug from "../../../../assets/manager/drug.svg?react";
import Star from "../../../../assets/manager/star.svg?react";
import Person from "../../../../assets/manager/person.svg?react";

import ArrowLeft from "../../../../assets/manager/arrowleft.svg?react";

function calculateAge(birthDateStr) {
  if (!birthDateStr) return null;
  const [year, month, day] = birthDateStr.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function DoctorProfile() {
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const { patientId } = useParams();
  console.log("patientId from URL:", JSON.stringify(patientId));
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Appointment summary comes from a *different* endpoint (the list view),
  // since the single-patient detail endpoint doesn't include it.
  const [appointmentSummary, setAppointmentSummary] = useState(null);
  const [appointmentSummaryLoading, setAppointmentSummaryLoading] = useState(true);
  const [appointmentSummaryError, setAppointmentSummaryError] = useState("");

  useEffect(() => {
    if (!patientId) return;

    async function fetchPatient() {
      setLoading(true);
      setError("");

      try {
        const hostname = window.location.hostname;
        const res = await fetch(
          `http://${hostname}:8000/manager/manage-patients/${patientId}/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.detail || `Failed to load patient (${res.status})`
          );
        }

        const data = await res.json();
        setPatient(data);
      } catch (err) {
        setError(err.message || "Failed to load patient");
      } finally {
        setLoading(false);
      }
    }

    fetchPatient();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;

    async function fetchAppointmentSummary() {
      setAppointmentSummaryLoading(true);
      setAppointmentSummaryError("");

      try {
        const hostname = window.location.hostname;
        // NOTE: confirm this is the right URL for the list endpoint —
        // I'm assuming it's the same base path with no trailing id.
        const res = await fetch(
          `http://${hostname}:8000/manager/manage-patients/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.detail || `Failed to load appointment summary (${res.status})`
          );
        }

        const data = await res.json();

        const match = data.patients?.find(
          (p) => p.patient?.public_id === patientId
        );
        console.log("match found:", match);

        if (!match) {
          throw new Error("Patient not found in appointment summary list");
        }

        setAppointmentSummary({
          counts: match.appointment_counts,
          lastAppointment: match.last_appointment,
          nextAppointment: match.next_appointment,
        });
      } catch (err) {
        setAppointmentSummaryError(err.message || "Failed to load appointment summary");
      } finally {
        setAppointmentSummaryLoading(false);
      }
    }

    fetchAppointmentSummary();
  }, [patientId]);

  if (loading) {
    return (
      <div className={styles.DoctorDashboard}>
        <div className={styles.back}></div>
        <Sidebar activeId={activeNav} onSelect={setActiveNav} />
        <section className={styles.dashboardContent}>
          <main className={styles.cards}>
            <p>Loading patient...</p>
          </main>
        </section>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className={styles.DoctorDashboard}>
        <div className={styles.back}></div>
        <Sidebar activeId={activeNav} onSelect={setActiveNav} />
        <section className={styles.dashboardContent}>
          <main className={styles.cards}>
            <p>{error || "Patient not found."}</p>
          </main>
        </section>
      </div>
    );
  }

  const fullName = `${patient.first_name} ${patient.last_name}`;
  const age = calculateAge(patient.birth_date);
  const genderDisplay =
    patient.gender === "male"
      ? "Male"
      : patient.gender === "female"
      ? "Female"
      : patient.gender || "—";

  const totalVisits = appointmentSummary?.counts?.total ?? "—";
  const lastVisitDate = appointmentSummary?.lastAppointment?.appointment_date
    ? formatDisplayDate(appointmentSummary.lastAppointment.appointment_date)
    : "—";
  const nextAppointmentDate = appointmentSummary?.nextAppointment?.appointment_date
    ? formatDisplayDate(appointmentSummary.nextAppointment.appointment_date)
    : "—";

  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      <section className={styles.dashboardContent}>
        <nav className={`${styles.nav} ${layoutStyles.navContent}`}>
          <div className={layoutStyles.pageanme}>
            <Doctor />
            {fullName} profile
          </div>
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

        {/* Main Content */}
        <main className={styles.cards}>
          <div className={profileStyles.profileWrapper}>
            {/* Header Card */}
            <div className={`${profileStyles.headerCard} ${profileStyles.glass}`}>
              <div className={profileStyles.photoWrapper}>
                <div className={`${profileStyles.glassDIv} ${profileStyles.glass}`}>
                  {patient.profile_picture === null ?
                    <h1 className={profileStyles.picFont}>{fullName.charAt(0).toUpperCase()}</h1>
                  :
                    <img
                      src={patient.profile_picture}
                      alt={fullName}
                      className={profileStyles.photo}
                    />
                  }
                </div>
              </div>

              <div className={profileStyles.headerInfo}>
                <h1 className={profileStyles.doctorName}>{fullName}</h1>
                <div className={`${profileStyles.metaRow} ${profileStyles.glass}`}>
                  <p>Age: {age ?? "—"}</p>
                  <p>Gender: {genderDisplay}</p>
                  <p>Patient ID: {patient.personal_id || "—"}</p>
                </div>
              </div>
            </div>

            {/* Two Columns */}
            <div className={profileStyles.columnsRow}>
              {/* Today's Overview */}
              <div className={`${profileStyles.overviewCard} ${profileStyles.glass}`}>
                <h2 className={profileStyles.cardTitle}>Quick Info</h2>

                <div className={profileStyles.overviewList}>
                  <div className={profileStyles.overviewRow}>
                    <span>Total visits</span>
                    <span className={profileStyles.numBadge}>
                      {appointmentSummaryLoading ? "…" : totalVisits}
                    </span>
                  </div>

                  <div className={profileStyles.overviewRow}>
                    <span>Last visit</span>
                    <span className={profileStyles.numBadge}>
                      {appointmentSummaryLoading ? "…" : lastVisitDate}
                    </span>
                  </div>

                  <div className={profileStyles.overviewRow}>
                    <span>Next Appointment</span>
                    <span className={profileStyles.numBadge}>
                      {appointmentSummaryLoading ? "…" : nextAppointmentDate}
                    </span>
                  </div>
                </div>

                {appointmentSummaryError && (
                  <p className={profileStyles.errorText}>{appointmentSummaryError}</p>
                )}

                <button
                    className={`${profileStyles.viewBtn} ${profileStyles.glass}`}>
                    Book Appointments <ArrowLeft/>
                </button>
              </div>

              {/* Personal Information */}
              <div className={`${profileStyles.infoCard} ${profileStyles.glass}`}>
                <h2 className={profileStyles.cardTitle}>Personal Information</h2>

                <div className={`${profileStyles.infoInner} ${profileStyles.glass}`}>
                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Full Name:</p>
                    <p className={profileStyles.infoValue}>{fullName}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Date of Birth:</p>
                    <p className={profileStyles.infoValue}>
                      {formatDisplayDate(patient.birth_date)}
                    </p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Phone:</p>
                    <p className={profileStyles.infoValue}>{patient.phone_number}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Blood Type:</p>
                    <p className={profileStyles.infoValue}>{patient.blood_type || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={profileStyles.recent}>
            <h1>Recent Appointments</h1>
            {/*
              TODO: still placeholder rows — no appointment-history endpoint
              has been wired up yet. The summary fetch above only gives
              last/next appointment, not a full history list.
            */}
            <div className={`${profileStyles.rowo} ${layoutStyles.glass}`}>
              <div className={profileStyles.rowoe}>Aug 14</div>
              <div className={profileStyles.rowoe}>Dr.Jessica</div>
              <div className={profileStyles.rowoe}>Consultation</div>
              <div className={profileStyles.rowoe}>Confirmed</div>
            </div>
            <div className={`${profileStyles.rowo} ${layoutStyles.glass}`}>
              <div className={profileStyles.rowoe}>Aug 14</div>
              <div className={profileStyles.rowoe}>Dr.Jessica</div>
              <div className={profileStyles.rowoe}>Consultation</div>
              <div className={profileStyles.rowoe}>Confirmed</div>
            </div>
            <button
            onClick={() => navigate("/admin/manage&patients/patient&profile/appointments")}
            className={layoutStyles.glass}>View All Appointment<ArrowLeft/></button>
          </div>

        </main>
      </section>
    </div>
  );
}

export default DoctorProfile;