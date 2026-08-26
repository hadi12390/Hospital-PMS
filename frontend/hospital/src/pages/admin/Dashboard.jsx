import styles from "./Dashboard.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RevenueOverview from "./RevenueOverview/RevenueOverview";
import Sidebar from "./Sidebar";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // ---------- Date helpers ----------
  function getFormattedDate() {
    const date = new Date();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const month = months[date.getMonth()];

    function getSuffix(day) {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    return {
      dayName,
      dayNumber,
      suffix: getSuffix(dayNumber),
      month,
    };
  }

  // ---------- State ----------
  const [showMenu, setShowMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [dashboardData, setDashboardData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Fetch helpers ----------
  const getDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const hostname = window.location.hostname;
      const response = await fetch(
        `http://${hostname}:8000/manager/dashboard/`,
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
        throw new Error(data.message || "Failed to fetch dashboard");
      }

      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getPersonalInfo = async () => {
    try {
      const hostname = window.location.hostname;
      const response = await fetch(
        `http://${hostname}:8000/accounts/personal-informations/`,
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
        throw new Error(data.message || "Failed to fetch personal info");
      }

      // Handle both single object and array responses
      const info = Array.isArray(data) ? data[0] : data;
      setUserInfo(info);
    } catch (err) {
      console.error("Personal info fetch error:", err);
    }
  };

  useEffect(() => {
    getDashboard();
    getPersonalInfo();
  }, []);

  // ---------- Helpers ----------
  function formatActivityTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getDisplayName() {
    if (!userInfo) return "Manager";

    const first = userInfo.first_name?.trim() || "";
    const last = userInfo.last_name?.trim() || "";

    if (first || last) {
      return `${first} ${last}`.trim();
    }

    return userInfo.username || "Manager";
  }

  // ---------- Derived data (exact API shape) ----------
  const today = getFormattedDate();

  const appointmentsCount = dashboardData?.today?.appointments_count ?? 0;
  const lastThree = dashboardData?.today?.last_three ?? [];
  const todayPatients = dashboardData?.today?.patients ?? [];
  const patientsCount = dashboardData?.today?.patients_count ?? 0;
  const activeDoctorsCount = dashboardData?.doctors?.active_count ?? 0;
  const recentActivity = dashboardData?.recent_activity ?? [];

  const status = dashboardData?.appointments_by_status ?? {};
  const confirmedCount = status.confirmed_appointments ?? 0;
  const pendingCount = status.pending_appointments ?? 0;
  const cancelledCount = status.cancelled_appointments ?? 0;

  // Fake revenue data
  const mockData = [
    { day: "Day 1", value: 4000 },
    { day: "Day 2", value: 5800 },
    { day: "Day 3", value: 3500 },
    { day: "Day 4", value: 8000 },
    { day: "Day 5", value: 1500 },
    { day: "Day 6", value: 10500 },
    { day: "Day 7", value: 5000 },
    { day: "Day 8", value: 7000 },
    { day: "Day 9", value: 9500 },
    { day: "Day 10", value: 8000 },
  ];



  async function handleLogout() {
    console.log("Logout started");

    try {
      await logout();

      console.log("Frontend user state cleared");

      navigate("/login", { replace: true });

    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // ---------- Render ----------
  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

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
              <div className={styles.profilePic}>
                {userInfo?.first_name?.[0]?.toUpperCase() ||
                  userInfo?.username?.[0]?.toUpperCase() ||
                  "M"}
              </div>

              <button
                className={styles.profBut}
                onClick={() => setShowMenu(!showMenu)}
              >
                <img src="/assest/doctor/cards/dropDown.svg" alt="Dropdown" />
              </button>

              {showMenu && (
                <div className={styles.dropdownMenu}>
                  <button
                    onClick={handleLogout}
                  >
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
            <div className={styles.loadingBanner}>Loading dashboard…</div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Hero */}
          <div className={styles.heroSec}>
            <div className={styles.fullNameBox}>
              <div className={styles.heroNameP}>
                <p className={styles.heroName}>Hello, {getDisplayName()}</p>
                <p>👋</p>
              </div>
              <p className={styles.heroPar}>
                There is latest update for the last 7 days. check now
              </p>
            </div>

            <div className={styles.dateRealDay}>
              <img src="/assest/doctor/cards/Vector (1).svg" alt="" />
              <p>
                <span>{today.dayName}</span> ,{" "}
                <span>{today.dayNumber}</span>
                {today.suffix} <span>{today.month}</span>
              </p>
            </div>
          </div>

          <div className={styles.containerCards}>
            {/* BOX 1 – Appointments This Day */}
            <div className={styles.box1}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img src="/assest/admin/calnder.svg" alt="" />
                </div>
                <div>Appointments This Day</div>
              </div>

              <div
                className={`${styles.boxJustiDown} ${styles.boxJustiDownBoxOne}`}
              >
                <div className={styles.mainNumBoxOne}>{appointmentsCount}</div>

                <div className={styles.appBoxOne}>
                  <div className={styles.tableNamesBoxOne}>
                    {lastThree.map((appt) => (
                      <div
                        key={appt.public_id}
                        className={styles.tableElement}
                      >
                        {appt.doctor_name || "—"}
                      </div>
                    ))}
                  </div>
                  <div className={styles.tablePaNamesBoxOne}>
                    {lastThree.map((appt) => (
                      <div
                        key={appt.public_id}
                        className={styles.tableElement}
                      >
                        {appt.patient_name || "—"}
                      </div>
                    ))}
                  </div>
                  <div className={styles.tablePaCostBoxOne}>
                    {lastThree.map((appt) => (
                      <div
                        key={appt.public_id}
                        className={styles.tableElement}
                      >
                        {formatActivityTime(appt.completed_at)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.arrowBoxOne}>
                  <img
                    alt=""
                    src="/assest/doctor/cards/go-svgrepo-com 1.svg"
                  />
                </div>
              </div>
            </div>

            {/* BOX 2 – Today Patients */}
            <div className={styles.box2}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/admin/update-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Today Patient</div>
              </div>

              <div
                className={`${styles.boxJustiDown} ${styles.boxJustiDownBoxTwo}`}
              >
                <div className={styles.mainNumBoxTwo}>{patientsCount}</div>

                <div className={styles.appBoxTwo}>
                  <div className={styles.tableNamesBoxTwo}>
                    {todayPatients.slice(0, 3).map((name, i) => (
                      <div key={i} className={styles.tableElementTwo}>
                        {name || "—"}
                      </div>
                    ))}
                  </div>
                  <div className={styles.arrowBoxOne}>
                    <img
                      alt=""
                      src="/assest/doctor/cards/go-svgrepo-com 1.svg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOX 3 – Active Doctors */}
            <div className={styles.box3}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/admin/patient-profile-people-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Active Doctors</div>
              </div>

              <div
                className={`${styles.boxJustiDown} ${styles.boxJustiDownBoxTwo}`}
              >
                <div className={styles.mainNumBoxTwo}>{activeDoctorsCount}</div>
                <div className={styles.arrowBoxOne}>
                  <img
                    alt=""
                    src="/assest/doctor/cards/go-svgrepo-com 1.svg"
                  />
                </div>
              </div>
            </div>

            {/* BOX 4 – Revenue (fake data) */}
            <div style={{ width: "100%" }} className={styles.box4}>
              <RevenueOverview data={mockData} />
            </div>

            {/* BOX 5 – Recent Activity */}
            <div className={styles.box5}>
              <div>
                <div className={styles.boxJustiUper}>
                  <div>
                    <img
                      src="/assest/admin/recent-svgrepo-com (1) 1.svg"
                      alt=""
                    />
                  </div>
                  <div>Recent Activity</div>
                </div>
              </div>

              <div className={styles.noti}>
                {recentActivity.length === 0 && !loading && (
                  <div className={styles.notiCard}>
                    <div className={styles.notiDisc}>No recent activity</div>
                  </div>
                )}

                {recentActivity.map((log, i) => (
                  <div key={i} className={styles.notiCard}>
                    <div className={styles.notiTime}>
                      <p>{formatActivityTime(log.created_at)}</p>
                    </div>
                    <div className={styles.notiDisc}>
                      {log.action}
                      <p>By: {log.user || "System"}</p>
                    </div>
                  </div>
                ))}

                <div className={styles.arrowBoxSix}>
                  <img
                    src="/assest/doctor/cards/go-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
              </div>
            </div>

            {/* BOX 6 – Appointments Status */}
            <div className={styles.box6}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/admin/status-pending-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Appointments Status</div>
              </div>

              <div className={styles.boxJustiDownForSix}>
                {/* Confirmed */}
                <div className={styles.staPi}>
                  <img
                    src="/assest/admin/approved-aproved-confirm-2-svgrepo-com 1.svg"
                    alt=""
                  />
                  <div className={styles.staPiIn}>
                    <span>{confirmedCount}</span>
                  </div>
                </div>

                {/* Pending */}
                <div className={styles.staPi}>
                  <img
                    src="/assest/admin/minus-circle-svgrepo-com (1) 1.svg"
                    alt=""
                  />
                  <div className={styles.staPiIn}>
                    <span>{pendingCount}</span>
                  </div>
                </div>

                {/* Cancelled */}
                <div className={styles.staPi}>
                  <img
                    src="/assest/admin/cancle-circle-svgrepo-com 1.svg"
                    alt=""
                  />
                  <div className={styles.staPiIn}>
                    <span>{cancelledCount}</span>
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

export default Dashboard;