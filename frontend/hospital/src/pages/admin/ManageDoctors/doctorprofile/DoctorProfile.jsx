import styles from "../../Dashboard.module.css";
import layoutStyles from "../../ManageDoctors.module.css";
import profileStyles from "./DoctorProfile.module.css";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "../../Sidebar";

import doctorImg from "./doctor.png"; // fallback image

import Doctor from "../../../../assets/manager/doctor.svg?react";
import Time from "../../../../assets/manager/time.svg?react";
import Drug from "../../../../assets/manager/drug.svg?react";
import Star from "../../../../assets/manager/star.svg?react";

function DoctorProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("manage-doctors");

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // public_id comes from the table click
  const publicId = location.state?.doctorId;

  useEffect(() => {
    if (!publicId) {
      setError("No doctor selected");
      setLoading(false);
      return;
    }

    const fetchDoctor = async () => {
      setLoading(true);
      setError(null);

      try {
        const hostname = window.location.hostname;
        const response = await fetch(
          `http://${hostname}:8000/manager/manage-doctors/${publicId}/`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.message || "Failed to load doctor");
        }

        setDoctor(data);
      } catch (err) {
        console.error("Doctor profile fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [publicId]);

  // ---------- Helpers ----------
  function formatTime(time) {
    if (!time) return "—";
    // API returns "HH:MM:SS" or "HH:MM"
    const [h, m] = time.split(":");
    const hour = Number(h);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m.padStart(2, "0")} ${period}`;
  }

  function formatSchedule(start, end) {
    if (!start || !end) return "Not set";
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  // ---------- Loading / Error states ----------
  if (loading) {
    return (
      <div className={styles.DoctorDashboard}>
        <div className={styles.back}></div>
        <Sidebar activeId={activeNav} onSelect={setActiveNav} />
        <section className={styles.dashboardContent}>
          <main className={styles.cards}>
            <p style={{ padding: "2rem", color: "#fff" }}>Loading doctor profile…</p>
          </main>
        </section>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className={styles.DoctorDashboard}>
        <div className={styles.back}></div>
        <Sidebar activeId={activeNav} onSelect={setActiveNav} />
        <section className={styles.dashboardContent}>
          <main className={styles.cards}>
            <p style={{ padding: "2rem", color: "#ff6b6b" }}>
              {error || "Doctor not found"}
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{ marginLeft: "2rem" }}
            >
              ← Go back
            </button>
          </main>
        </section>
      </div>
    );
  }

  // ---------- Derived values from API ----------
  const name = doctor.name || "—";
  const email = doctor.email || "—";
  const specialty = doctor.specialty || "—";
  const phone = doctor.phone_number || "—";
  const status = doctor.status === "active" ? "Active" : "Inactive";
  const photo = doctor.profile_picture || doctorImg;
  const scheduleText = formatSchedule(doctor.start_time, doctor.end_time);

  // These fields are not returned by the current serializer.
  // Kept as placeholders so the UI doesn't break.
  const rating = "—";
  const reviews = "—";

  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      <section className={styles.dashboardContent}>
        <nav className={`${styles.nav} ${layoutStyles.navContent}`}>
          <div className={layoutStyles.pageanme}>
            <Doctor />
            Doctor profile
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
          <div className={profileStyles.profileWrapper}>
            {/* Header Card */}
            <div className={`${profileStyles.headerCard} ${profileStyles.glass}`}>
              <div className={profileStyles.photoWrapper}>
                <div className={`${profileStyles.glassDIv} ${profileStyles.glass}`}>
                  <img
                    src={photo}
                    alt={name}
                    className={profileStyles.photo}
                  />
                </div>
              </div>

              <div className={profileStyles.headerInfo}>
                <h1 className={profileStyles.doctorName}>{name}</h1>

                <div className={profileStyles.ratingRow}>
                  <Star className={profileStyles.icon} />
                  <span>
                    {rating} ({reviews} Reviews)
                  </span>
                </div>

                <div className={profileStyles.metaRow}>
                  <div className={profileStyles.metaItem}>
                    <Time className={profileStyles.icon} />
                    <span>{scheduleText}</span>
                  </div>

                  <div className={profileStyles.metaItem}>
                    <Drug className={profileStyles.icon} />
                    <span>{specialty}</span>
                  </div>
                </div>
              </div>

              <div className={`${profileStyles.statusBadge} ${profileStyles.glass}`}>
                <span className={profileStyles.statusDot}></span>
                {status}
              </div>
            </div>

            {/* Two Columns */}
            <div className={profileStyles.columnsRow}>
              {/* Today's Overview */}
              {/* 
                Note: The current DoctorOverviewSerializer does NOT return
                appointment counts or next appointment.
                These remain placeholders until the backend is extended.
              */}
              <div className={`${profileStyles.overviewCard} ${profileStyles.glass}`}>
                <h2 className={profileStyles.cardTitle}>Today's Overview</h2>

                <div className={profileStyles.overviewList}>
                  <div className={profileStyles.overviewRow}>
                    <span>Appointments</span>
                    <span className={profileStyles.numBadge}>—</span>
                  </div>
                  <div className={profileStyles.overviewRow}>
                    <span>Completed</span>
                    <span className={profileStyles.numBadge}>—</span>
                  </div>
                  <div className={profileStyles.overviewRow}>
                    <span>Upcoming</span>
                    <span className={profileStyles.numBadge}>—</span>
                  </div>
                  <div className={profileStyles.overviewRow}>
                    <span>Cancelled</span>
                    <span className={profileStyles.numBadge}>—</span>
                  </div>
                </div>

                <div className={profileStyles.nextAppointment}>
                  <h3 className={profileStyles.nextTitle}>Next Appointment</h3>
                  <p className={profileStyles.nextInfo}>—</p>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/admin/manage&doctors/doctor&profile/appointments",
                      { state: { doctorId: publicId } }
                    )
                  }
                  className={`${profileStyles.viewBtn} ${profileStyles.glass}`}
                >
                  View Appointments →
                </button>
              </div>

              {/* Personal Information */}
              <div className={`${profileStyles.infoCard} ${profileStyles.glass}`}>
                <h2 className={profileStyles.cardTitle}>Personal Information</h2>

                <div className={`${profileStyles.infoInner} ${profileStyles.glass}`}>
                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Full Name:</p>
                    <p className={profileStyles.infoValue}>{name}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Specialty:</p>
                    <p className={profileStyles.infoValue}>{specialty}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Phone:</p>
                    <p className={profileStyles.infoValue}>{phone}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Email:</p>
                    <p className={profileStyles.infoValue}>{email}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Working Hours:</p>
                    <p className={profileStyles.infoValue}>{scheduleText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default DoctorProfile;