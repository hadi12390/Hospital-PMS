import styles from "../../Dashboard.module.css";
import layoutStyles from "../../ManageDoctors.module.css";

import profileStyles from "./DoctorProfile.module.css";

import { useRef, useState} from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from '../../Sidebar';

import doctorImg from "./doctor.png";

import Doctor from "../../../../assets/manager/doctor.svg?react";
import Time from "../../../../assets/manager/time.svg?react";
import Drug from "../../../../assets/manager/drug.svg?react";
import Star from "../../../../assets/manager/star.svg?react";
import Person from "../../../../assets/manager/person.svg?react";

function DoctorProfile() {
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const doctor = {
    name: "Dr. Jassica Smith",
    fullName: "Jassica Smeth Al-batawnah",
    specialty: "Dentistry",
    specialtyLabel: "Pediatrician",
    rating: 4.9,
    reviews: 364,
    status: "Active",
    phone: "+962 79 120 0976",
    email: "jessicasmeth@clinic.com",
    photo: {doctorImg},
    overview: {
      appointments: 8,
      completed: 5,
      upcoming: 3,
      cancelled: 0,
    },
    nextAppointment: {
      time: "10:30 AM",
      patient: "MIA Quien",
    },
  };
  const navigate = useNavigate();


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
                    <img
                    src={doctorImg}
                    alt={doctor.name}
                    className={profileStyles.photo}
                    />
                </div>
              </div>

              <div className={profileStyles.headerInfo}>
                <h1 className={profileStyles.doctorName}>{doctor.name}</h1>

                <div className={profileStyles.ratingRow}>
                  <Star className={profileStyles.icon} />
                  <span>
                    {doctor.rating} ({doctor.reviews} Reviews)
                  </span>
                </div>

                <div className={profileStyles.metaRow}>
                  <div className={profileStyles.metaItem}>
                    <Time className={profileStyles.icon} />
                    <span>Available Now</span>
                  </div>

                  <div className={profileStyles.metaItem}>
                    <Drug className={profileStyles.icon} />
                    <span>{doctor.specialtyLabel}</span>
                  </div>
                </div>
              </div>

              <div className={`${profileStyles.statusBadge} ${profileStyles.glass}`}>
                <span className={profileStyles.statusDot}></span>
                {doctor.status}
              </div>
            </div>

            {/* Two Columns */}
            <div className={profileStyles.columnsRow}>
              {/* Today's Overview */}
              <div className={`${profileStyles.overviewCard} ${profileStyles.glass}`}>
                <h2 className={profileStyles.cardTitle}>Today's Overview</h2>

                <div className={profileStyles.overviewList}>
                  <div className={profileStyles.overviewRow}>
                    <span>Appointments</span>
                    <span className={profileStyles.numBadge}>
                      {doctor.overview.appointments}
                    </span>
                  </div>

                  <div className={profileStyles.overviewRow}>
                    <span>Completed</span>
                    <span className={profileStyles.numBadge}>
                      {doctor.overview.completed}
                    </span>
                  </div>

                  <div className={profileStyles.overviewRow}>
                    <span>Upcoming</span>
                    <span className={profileStyles.numBadge}>
                      {doctor.overview.upcoming}
                    </span>
                  </div>

                  <div className={profileStyles.overviewRow}>
                    <span>Cancelled</span>
                    <span className={profileStyles.numBadge}>
                      {doctor.overview.cancelled}
                    </span>
                  </div>
                </div>

                <div className={profileStyles.nextAppointment}>
                  <h3 className={profileStyles.nextTitle}>Next Appointment</h3>
                  <p className={profileStyles.nextInfo}>
                    {doctor.nextAppointment.time} - {doctor.nextAppointment.patient}
                  </p>
                </div>

                <button 
                    onClick={() => navigate("/admin/manage&doctors/doctor&profile/appointments")}
                    className={`${profileStyles.viewBtn} ${profileStyles.glass}`}>
                  View Appointments →
                </button>
              </div>

              {/* Personal Information */}
              <div className={`${profileStyles.infoCard} ${profileStyles.glass}`}>
                <h2 className={profileStyles.cardTitle}>Personal Information</h2>

                <div className={`${profileStyles.infoInner} ${profileStyles.glass}`}>
                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Full Name:</p>
                    <p className={profileStyles.infoValue}>{doctor.fullName}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Specialty:</p>
                    <p className={profileStyles.infoValue}>{doctor.specialty}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Phone:</p>
                    <p className={profileStyles.infoValue}>{doctor.phone}</p>
                  </div>

                  <div className={profileStyles.infoBlock}>
                    <p className={profileStyles.infoLabel}>Email:</p>
                    <p className={profileStyles.infoValue}>{doctor.email}</p>
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