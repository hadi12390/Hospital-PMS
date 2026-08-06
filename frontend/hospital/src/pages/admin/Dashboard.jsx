import styles from "./Dashboard.module.css";
import { useRef, useState ,useMemo } from "react"
import RevenueOverview from './RevenueOverview/RevenueOverview';


function AdminDashboard() {
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
  const END = 18;

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

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const appointments = [
    {
      id: 1,
      day: "Mon",
      patient: "MIA",
      type: "Surgery",
      start: "15:00",
      end: "18:00",
    },
    {
      id: 2,
      day: "Tue",
      patient: "John",
      type: "Checkup",
      start: "11:00",
      end: "12:00",
    },
    {
      id: 3,
      day: "Thu",
      patient: "Sara",
      type: "Consultation",
      start: "14:00",
      end: "16:00",
    },
    {
      id: 4,
      day: "Fri",
      patient: "GAZI",
      type: "Surgery",
      start: "12:00",
      end: "18:00",
    },
  ];

  const currentAppointment = appointments[0];

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
    "17:00",
    "18:00",
  ];

  // ---------- Render ----------

  const mockData = [
    { day: 'Day 1', value: 4000 },
    { day: 'Day 2', value: 5800 },
    { day: 'Day 3', value: 3500 },
    { day: 'Day 4', value: 8000 },
    { day: 'Day 5', value: 1500 },
    { day: 'Day 6', value: 10500 },
    { day: 'Day 7', value: 5000 },
    { day: 'Day 8', value: 7000 },
    { day: 'Day 9', value: 9500 },
    { day: 'Day 10',value: 8000 },
  ];

  //----------- aaa --------------
  const [selectedDate, setSelectedDate] = useState(null);

  const [pickedDate, setPickedDate] = useState("");

  function handleDateChange(e) {
    const value = e.target.value; // "YYYY-MM-DD"
    if (!value) {
      setPickedDate("");
      return;
    }
    const [year, month, day] = value.split("-");
    setPickedDate(`${day} / ${month} / ${year}`);
    if (onDateChange) onDateChange(value);
  }



  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <aside className={styles.sideBar}>
        <img src="/assest/doctor/sidebar/logo.svg" alt="Logo" />

        <p className={styles.optName}>MENU</p>

        <div className={styles.optionsContainer}>
          <button className={styles.options}>
            <img
              src="/assest/doctor/sidebar/col-right-svgrepo-com 1.svg"
              alt=""
            />
            <span>DashBoard</span>
          </button>

          <button className={styles.options}>
            <img src="/assest/doctor/sidebar/person.svg" alt="" />
            <span>Manage Doctors</span>
          </button>

          <button className={styles.options}>
            <img src="/assest/doctor/sidebar/dwajdoies.svg" alt="" />
            <span>Manage Patient</span>
          </button>

          <button className={styles.options}>
            <img src="/assest/doctor/sidebar/SVGRepo_iconCarriear.svg" alt="" />
            <span>Appointments</span>
          </button>

        </div>

        <p className={styles.optName}>OTHER MENU</p>

        <div className={styles.optionsContainer}>
          <button className={`${styles.options} ${styles.otherMenu}`}>
            <img
              src="/assest/doctor/sidebar/SVGRepo_iconCarrier (1).svg"
              alt=""
            />
            <span>Help & Center</span>
          </button>

          <button className ={`${styles.options} ${styles.otherMenu}`}>
            <img src="/assest/doctor/sidebar/SVGRepo_iconCarrier.svg" alt="" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

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
          <div className={styles.heroSec}>
            <div className={styles.fullNameBox}>
              <div className={styles.heroNameP}>
                <p className={styles.heroName}>Hello, MVMOD </p>
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
                  <img src="/assest/admin/calnder.svg" alt="iiw" />
                </div>
                  <div>Appointments This Day</div>
                </div>

                <div className={`${styles.boxJustiDown} ${styles.boxJustiDownBoxOne}`}>
                  <div className={styles.mainNumBoxOne}>54</div>
                  {/* Appointments START */}

                  <div className={styles.appBoxOne}>
                    <div className={styles.tableNamesBoxOne}>
                      <div className={styles.tableElement}>Dr.Hadi</div>
                      <div className={styles.tableElement}>Dr.Jessica</div>
                      <div className={styles.tableElement}>Dr.Hadi</div>
                    </div>
                    <div className={styles.tablePaNamesBoxOne}>
                      <div className={styles.tableElement}>Mia</div>
                      <div className={styles.tableElement}>Robert</div>
                      <div className={styles.tableElement}>Joe</div>
                    </div>
                    <div className={styles.tablePaCostBoxOne}>
                      <div className={styles.tableElement}>$120</div>
                      <div className={styles.tableElement}>$290</div>
                      <div className={styles.tableElement}>$350</div>
                    </div> 
                  </div>

                {/* Appointments END */}


                <div className={styles.arrowBoxOne}> 
                  <img alt="jj" src="/assest/doctor/cards/go-svgrepo-com 1.svg"></img>
                </div>
              </div>
            </div>

            {/* BOX TWO */}
            <div className={styles.box2}>
              <div className={styles.boxJustiUper}>
                <div>
                  <img
                    src="/assest/admin/update-svgrepo-com 1.svg"
                    alt="a"
                  />
                </div>
                <div>Today Patient</div>
              </div>


              <div className={`${styles.boxJustiDown} ${styles.boxJustiDownBoxTwo}`}>
                  <div className={styles.mainNumBoxTwo}>35</div>
                  {/* Appointments START */}

                  <div className={styles.appBoxTwo}>
                    <div className={styles.tableNamesBoxTwo}>
                      <div className={styles.tableElementTwo}>Noah</div>
                      <div className={styles.tableElementTwo}>Herry</div>
                      <div className={styles.tableElementTwo}>Alex</div>
                    </div>
                    <img 
                      height="90%"
                      src="/assest/admin/Line 7.svg"
                      alt="" />
                    <div className={styles.tablePaNamesBoxTwo}>
                      <div className={styles.tableElementTwo}>Mia</div>
                      <div className={styles.tableElementTwo}>Robert</div>
                      <div className={styles.tableElementTwo}>Joe</div>
                    </div>
                    <img 
                      height="90%"
                      src="/assest/admin/Line 7.svg"
                      alt="" />
                    <div className={styles.tablePaCostBoxTwo}>
                      <div className={styles.tableElementTwo}>Steve</div>
                      <div className={styles.tableElementTwo}>Micheal</div>
                      <div className={styles.tableElementTwo}>Mariah</div>
                    </div> 
                    <div className={styles.arrowBoxOne}> 
                     <img alt="jj" src="/assest/doctor/cards/go-svgrepo-com 1.svg"></img>
                    </div>
                  </div>

                {/* Appointments END */}
              </div>
            </div>

            {/* BOX THREE */}
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

              <div className={`${styles.boxJustiDown} ${styles.boxJustiDownBoxTwo}`}>
                  <div className={styles.mainNumBoxTwo}>24</div>
                  {/* Appointments START */}

                  <div className={styles.appBoxTwo}>
                    <div className={styles.tableNamesBoxTwo}>
                      <div className={styles.tableElementTwo}>Dr.Noah</div>
                      <div className={styles.tableElementTwo}>Dr.Herry</div>
                      <div className={styles.tableElementTwo}>Dr.Alex</div>
                    </div>
                    <img 
                      height="90%"
                      src="/assest/admin/Line 7.svg"
                      alt="" />
                    <div className={styles.tablePaNamesBoxTwo}>
                      <div className={styles.tableElementTwo}>Dr.Mia</div>
                      <div className={styles.tableElementTwo}>Dr.Robert</div>
                      <div className={styles.tableElementTwo}>Dr.Joe</div>
                    </div>
                    <img 
                      height="90%"
                      src="/assest/admin/Line 7.svg"
                      alt="" />
                    <div className={styles.tablePaCostBoxTwo}>
                      <div className={styles.tableElementTwo}>Dr.Steve</div>
                      <div className={styles.tableElementTwo}>Dr.Micheal</div>
                      <div className={styles.tableElementTwo}>Dr.Mariah</div>
                    </div> 
                    <div className={styles.arrowBoxOne}> 
                     <img alt="jj" src="/assest/doctor/cards/go-svgrepo-com 1.svg"></img>
                    </div>
                  </div>

                {/* Appointments END */}
              </div>
            </div>

            {/* BOX FOUR */}
            <div style={{ width: '100%' }} className={styles.box4}>
              <RevenueOverview   onDateChange={setSelectedDate} data={mockData} />
            </div>

            {/* BOX FIVE */}
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
                <div className={styles.notiCard}>
                  <div className={styles.notiTime}><p>2 min ago</p></div>
                  <div className={styles.notiDisc}>New Patient Registered
                      <p>By: Mia Morgan</p>
                  </div>
                </div>

                <div className={styles.notiCard}>
                  <div className={styles.notiTime}><p>Today , 2:32  PM</p></div>
                  <div className={styles.notiDisc}>Appointment Booked
                      <p>By: Dr.Hadi</p>
                  </div>
                </div>

                <div className={styles.notiCard}>
                  <div className={styles.notiTime}><p>Today , 12:02  AM</p></div>
                  <div className={styles.notiDisc}>Appointment Cancelled
                      <p>By: Dr.MVMOD</p>
                  </div>
                </div>

                <div className={styles.notiCard}>
                  <div className={styles.notiTime}><p>Today , 8:12  AM</p></div>
                  <div className={styles.notiDisc}>Appointment Completed
                      <p>By: Jeren Gazi</p>
                  </div>
                </div>
                <div class={styles.arrowBoxSix}>
                  <img src="/assest/doctor/cards/go-svgrepo-com 1.svg" alt="" />
                </div>

              </div>
              
            </div>

            {/* BOX SIX */}
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
                <div className={styles.staPi}>
                  <img src="/assest/admin/approved-aproved-confirm-2-svgrepo-com 1.svg" alt="" />
                  <div className={styles.staPiIn}>
                    <span>55</span>
                  </div>
                </div>
                <div className={styles.staPi}>
                  <img src="/assest/admin/minus-circle-svgrepo-com (1) 1.svg" alt="" />
                  <div className={styles.staPiIn}>
                    <span>6</span>
                  </div>
                </div>
                <div className={styles.staPi}>
                  <img src="/assest/admin/cancle-circle-svgrepo-com 1.svg" alt="" />
                  <div className={styles.staPiIn}>
                    <span>23</span>
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

export default AdminDashboard;
