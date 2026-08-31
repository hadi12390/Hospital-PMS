import styles from "./Dashboard.module.css";
import { useRef, useState ,useEffect } from "react"
import { adaptAppointment } from "./appointmentAdapter";
import Sidebar from "./sidebarD";


function DoctorDashboard() {
  const [apiData, setApiData] = useState({}); // object, not array — matches usage below
  const [loading, setLoading] = useState(true);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ---- helpers must be defined BEFORE they're called ----
  const DAY_ABBREV = {
    Sunday: "Sun",
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
  };

  const APPT_TYPE_LABEL = {
    follow_up: "Follow Up",
    check_up: "Check Up",
    consultation: "Consultation",
    surgery: "Surgery",
  };

  function toHHMM(isoString) {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }
  function mapWeekAppointments(rawList = []) {
    return rawList.map((raw) => {
      const appt = adaptAppointment(raw);
      const start = new Date(appt.dateTime);
      return {
        id: appt.id,
        day: DAY_ABBREV[
          ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][start.getDay()]
        ],
        patient: `${appt.patient.firstName} ${appt.patient.lastName}`.trim(),
        type: appt.type,
        start: toHHMM(appt.dateTime),
        end: toHHMM(appt.end_time),
      };
    });
  }

  // ---- now safe to call ----
  const appointments = mapWeekAppointments(apiData.week_appointments);
  const currentAppointment = appointments[0] ?? null;

  useEffect(() => {
    async function getData() {
      try {
        const hostName = window.location.hostname;
        const response = await fetch(`http://${hostName}:8000/doctor/dashboard/`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log(data);
        setApiData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    getData();
  }, []);


  const [activeNav, setActiveNav] = useState("appointment");


  function handleSelect(id) {
    console.log("Sidebar clicked:", id); 
    setActiveNav(id);
  }

    // ---------- Date helpers ----------
    function getCurrentDate() {
      const date = new Date();
      return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
    }

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

  function handleDateChange(e) {
    const value = e.target.value;

    if (!value) {
      setCurrentDate("");
      return;
    }

    const [year, month, day] = value.split("-");
    setCurrentDate(`${day} / ${month} / ${year}`);
  }

  // ---------- Time helpers ----------
    const START = 8;
    const END = 16;

    function timeToPercent(time) {
      const [hour, minute] = time.split(":").map(Number);
      const total = hour + minute / 60;

      return ((total - START) / (END - START)) * 100;
    }

    function getClockIcon(time) {
      const hour = Number(time.split(":")[0]);
      return `/assest/doctor/cards/clock/${hour.toString().padStart(2, "0")}.svg`;
    }

    function formatTime(time) {
      let [hour, minute] = time.split(":").map(Number);
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;

      return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
    }

    // ---------- State ----------
    const [currentDate, setCurrentDate] = useState(getCurrentDate());
    const [showMenu, setShowMenu] = useState(false);
    const dateInput = useRef();

    // ---------- Data ----------
    const today = getFormattedDate();

    

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  function formatAppointmentDate(dateStr) {
  if (!dateStr) return "";

    const date = new Date(dateStr);

    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();

    const ordinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${weekday} ${ordinal(day)} ${month}`;
  }

  const [stopped, setStopped] = useState(false);
  function clampToEnd(time) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour + minute / 60;
  return total > END ? `${END}:00` : time;
}

  // ---------- Render ----------
  if (loading) 
  return <div>Loading...</div>
  else
  return (
    <div className={`${styles.DoctorDashboard} ${styles.pageEnter}`}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* Right Side */}
      <section className={styles.dashboardContent}>
        {/* Navbar */}
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

        {/* Main Content */}
        <main className={styles.cards}>
          <div className={styles.heroSec}>
            <div className={styles.fullNameBox}>
              <div className={styles.heroNameP}>
                <p className={styles.heroName}>Hello, Jessica </p>
                <p>👋</p>
              </div>
              <p className={styles.heroPar}>
                There is latest update for the last 7 days. check now
              </p>
            </div>

            <div className={styles.dateRealDay}>
              <img src="/assest/doctor/cards/Vector (1).svg" alt="" />
              <p>
                <span>{today.dayName}</span> , <span>{today.dayNumber}</span>
                th <span>{today.month}</span>
              </p>
            </div>
          </div>

          <div className={styles.containerCards}>
            {/* BOX ONE */}
            <div className={styles.box1}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/doctor/cards/calendar-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Total Appointment</div>
              </div>

              <div className={styles.boxJustiDown}>
                <h1>{apiData.total_appointments}</h1>
                <div>
                    since {apiData.since?.split(" ")[0].replaceAll("-", "/") || "unknown"}
                </div>
              </div>
            </div>

            {/* BOX TWO */}
            <div className={styles.box2}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/doctor/cards/update-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Week Appointment</div>
              </div>

              <div className={`${styles.boxJustiDown}`}>
                <h1>{apiData.week_appointments_count}</h1>
                {/* {styles.precentRed} */}
                <div>
                  <span className={styles.precentGreen}>20%</span> from last
                  week
                </div>
              </div>
            </div>

            {/* BOX THREE */}
            <div className={styles.box3}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/doctor/cards/patient-profile-people-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Last Patient</div>
              </div>

              <div className={styles.boxJustiDown}>
                <h1>{apiData.last_patient || "No patient"}</h1>
                <div>Type: surgery</div>
              </div>
            </div>

            {/* BOX FOUR */}
            <div className={styles.box4}>
              <div className={styles.weekAppointment}>
                {/* Header */}
                <div className={styles.header}>
                  <h1>Week Appointment</h1>

                  <div className={styles.date}>
                    <img
                      src="/assest/doctor/cards/Vector.svg"
                      alt="Calendar"
                      onClick={() => dateInput.current.showPicker()}
                    />

                    <span>{currentDate}</span>

                    <input
                      ref={dateInput}
                      type="date"
                      onChange={handleDateChange}
                      className={styles.hiddenDate}
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div className={styles.schedule}>
                  {/* Days */}
                  {days.map((day) => (
                    <div className={styles.dayRow} key={day}>
                      <div className={styles.day}>{day}</div>

                      <div className={styles.timeline}>
                        {appointments
                          .filter((app) => app.day === day)
                          .map((app) => (
                            <div
                              key={app.id}
                              className={styles.appointment}
                              style={{
                                left: `${timeToPercent(app.start)}%`,
                                width: `${
                                  timeToPercent(clampToEnd(app.end)) - timeToPercent(app.start)
                                }%`,
                              }}
                            >
                              {app.patient} | {app.type}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Header */}
                <div className={styles.timeHeader}>
                  <div></div>

                  {timeSlots.map((time) => (
                    <span key={time}>{time}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* BOX FIVE */}
            <div className={styles.box5}>
              <div>
                <div className={styles.boxJustiUper}>
                  <div>
                    <img
                      src="/assest/doctor/cards/calendar-user-svgrepo-com 1.svg"
                      alt=""
                    />
                  </div>
                  <div>Current Appointment</div>
                </div>

                <div className={styles.boxJustiDown}>
                  <h1>{apiData.current_appointment || "No Appointment"}</h1>
                </div>
              </div>

              <div className={styles.fullMain}>
                <div className={styles.mainSecOne}>
                  <div className={styles.mainBack}>
                    <div>
                      <div className={styles.whiteBack}>
                        <div className={styles.stateBack}>
                          <img
                            src="/assest/doctor/cards/done-ring-round-svgrepo-com 1.svg"
                            alt=""
                          />
                        </div>
                        
                      </div>
                    </div>
                  </div>

                  <div className={styles.mainClock}>
                    {currentAppointment ? (
                      <>
                        <img
                          src={getClockIcon(currentAppointment.start)}
                          alt={currentAppointment.start}
                        />
                        <div>{formatTime(currentAppointment.start)}</div>
                      </>
                    ) : (
                      <div>No appointment</div>
                    )}
                  </div>
                </div>

                <div className={styles.mainSecTwo}>
                  <div className={styles.mainArrowA}>
                    <img
                      src="/assest/doctor/cards/go-svgrepo-com 1.svg"
                      alt="jj"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOX SIX */}
            <div className={styles.box6}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/doctor/cards/arrow-sm-right-svgrepo-com 1.svg"
                    alt=""
                  />
                </div>
                <div>Next Appointment</div>
              </div>

              <div className={styles.boxJustiDownForSix}>
                <h1>{apiData.next_appointment?.patient?.name ?? "No Next"}</h1>
                <div>
                  <p>
                    {apiData.next_appointment?.appointment_type === "follow_up"
                      ? "Follow Up"
                      : apiData.next_appointment?.appointment_type === "check_up"
                      ? "Check Up"
                      : "Consultation"}
                  </p>
                  <p>{formatAppointmentDate(apiData.next_appointment?.date)}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default DoctorDashboard;