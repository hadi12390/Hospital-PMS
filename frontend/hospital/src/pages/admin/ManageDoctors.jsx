import styles from "./Dashboard.module.css";
import layoutStyles from "./ManageDoctors.module.css";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DoctorsTable from "./ManageDoctors/DoctorsTable.jsx";

import Gear from "../../assets/manager/gear.svg?react";

function ManageDoctors() {
  // ---------- State ----------
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("manage-doctors");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Fetch ----------
  const getManageDoctors = async () => {
    setLoading(true);
    setError(null);

    try {
      const hostname = window.location.hostname;
      const response = await fetch(
        `http://${hostname}:8000/manager/manage-doctors/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch doctors data");
      }

      setData(result);
    } catch (err) {
      console.error("Manage doctors fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getManageDoctors();
  }, []);

  // ---------- Derived values ----------
  const totalDoctors = data?.total_doctors ?? 0;
  const activeDoctors = data?.active_doctors ?? 0;
  const onLeaveDoctors = data?.on_leave_doctors ?? 0;
  const capacity = data?.capacity ?? 0;
  const doctors = data?.doctors ?? [];

  // ---------- Render ----------
  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* Right Side */}
      <section className={styles.dashboardContent}>
        {/* Navbar */}
        <nav className={`${styles.nav} ${layoutStyles.navContent}`}>
          <div className={layoutStyles.pageanme}>
            <Gear />
            Manage Doctors
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
          {loading && (
            <div className={styles.loadingBanner}>Loading doctors…</div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Stats Row */}
          <div className={layoutStyles.statsRow}>
            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Total Doctors</p>
              <p className={layoutStyles.statValue}>{totalDoctors}</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Active</p>
              <p className={layoutStyles.statValue}>{activeDoctors}</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>On Leave</p>
              <p className={layoutStyles.statValue}>{onLeaveDoctors}</p>
            </div>

            <div className={layoutStyles.statCard}>
              <p className={layoutStyles.statLabel}>Capacity</p>
              <p className={layoutStyles.statValue}>{capacity}%</p>
            </div>
          </div>

          {/* Doctors Table */}
          <DoctorsTable doctors={doctors} loading={loading} />
        </main>
      </section>
    </div>
  );
}

export default ManageDoctors;