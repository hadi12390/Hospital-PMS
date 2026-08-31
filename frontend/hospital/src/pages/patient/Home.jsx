import styles from "./Home.module.css";
import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";
import DownArrow from "../../assets/patient/down.svg?react";
import Blood from "../../assets/patient/blood.svg?react";
import Heart from "../../assets/patient/heart-pulse.svg?react";
import Yourdoc from "../../assets/patient/doctoer.svg?react";
import TimePast from "../../assets/patient/time-past.svg?react";
import Arrow from "../../assets/patient/arrowoo.svg?react";
import NotificationLogo from "../../assets/patient/notification.svg?react";



import { NavLink } from "react-router-dom";
import { useRef, useState ,useEffect} from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function PatientHome(){
  const [apiData , setApiData] = useState([]);
  const [apiPatientData , setPatientApiData] = useState([]);

  function getCurrentDateTime() {
    const now = new Date();

    const day = now.getDate();
    const month = now.toLocaleString("en-US", { month: "short" });

    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${day} ${month} ${time}`;
  }


  useEffect(() => {
    async function getData() {
      try {
        const hostName = window.location.hostname;

        const response = await fetch(
          `http://${hostName}:8000/patient/dashboard/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        console.log(data);

        setApiData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }

    async function getPatientData() {
      try {
        const hostName = window.location.hostname;

        const response = await fetch(
          `http://${hostName}:8000/patient/profile/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        console.log(data);

        setPatientApiData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }
    getData();
    getPatientData();
  }, []);


   const navigate = useNavigate();

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

    function calculateAge(birthDate) {
      if (!birthDate) return null;

      const birth = new Date(birthDate);
      const today = new Date();

      let age = today.getFullYear() - birth.getFullYear();

      const monthDifference = today.getMonth() - birth.getMonth();
      const dayDifference = today.getDate() - birth.getDate();

      // Birthday hasn't happened yet this year
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && dayDifference < 0)
      ) {
        age--;
      }

      return age;
    }

    function formatDate(dateString) {
      if (!dateString) return "Unknown";

      const [year, month, day] = dateString.split("T")[0].split("-");

      return `${day} / ${month} / ${year}`;
    }

    function daysUntil(dateString) {
      if (!dateString) return "Unknown";

      const targetDate = new Date(dateString);
      const today = new Date();

      // Remove the time so we compare only dates
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      const difference = targetDate - today;

      const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "1 day";
      if (days > 1) return `${days}`;

      return "Passed";
    }

  return (
    <div className={`${styles.PatientDashboard}`}>

      <aside className={styles.sideBar}>

        {/* Logo */}
        <div className={styles.sidebarLogo}>
            <img
                src="/assest/patient/logo.svg"
                alt="Logo"
            />
        </div>


        <div className={styles.contSide}>

            {/* ================= MAIN MENU ================= */}
            <div className={styles.optionsContainer}>

                {/* Home */}
                <NavLink
                    to="/patient/home"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.homeLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <HomeLogo className={styles.homelogoicon} />
                </NavLink>


                {/* Appointments */}
                <NavLink
                    to="/patient/appointment"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.appLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <AppLogo className={styles.applogoicon} />
                </NavLink>


                {/* Doctors */}
                <NavLink
                    to="/patient/doctor"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.docLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <DocLogo className={styles.doclogoicon} />
                </NavLink>


                {/* Reports */}
                <NavLink
                    to="/patient/reports"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.pillLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <PillLogo className={styles.pilllogoicon} />
                </NavLink>


                {/* Payments */}
                <NavLink
                    to="/patient/payment"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.docuLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <DocuLogo className={styles.doculogoicon} />
                </NavLink>

            </div>


            {/* ================= SECOND MENU ================= */}
            <div
                className={`${styles.optionsContainer} ${styles.optionsContainerNN}`}
            >

                {/* Help */}
                <NavLink
                    to="/patient/flag"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.helpLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <HelpLogo className={styles.helplogoicon} />
                </NavLink>


                {/* Settings */}
                <NavLink
                    to="/patient/settings"
                    className={({ isActive }) =>
                        `${styles.options} ${styles.settLogoButton} ${
                            isActive ? styles.active : ""
                        }`
                    }
                >
                    <SettLogo className={styles.settlogoicon} />
                </NavLink>

            </div>


            {/* ================= LOGOUT SECTION ================= */}
            <div className={styles.logoutsec}>

                <div className={`${styles.optionsContainer} ${styles.optionsContainerLL}`}>

                    {/* Logout */}
                    <button
                        type="button"
                        className={`${styles.options} ${styles.logoutLogoButton}`}
                    >
                        <LogOutLogo
                            className={styles.logoutlogoicon}
                        />
                    </button>


                    {/* Notifications */}
                    <NavLink
                        to="/patient/notifications"
                        className={({ isActive }) =>
                            `${styles.options} ${styles.notificationLogoButton} ${
                                isActive ? styles.active : ""
                            }`
                        }
                    >
                        <NotificationLogo
                            className={styles.notificationlogoicon}
                        />
                    </NavLink>

                </div>


                {/* Profile picture */}
                <div className={styles.profPicLogOut}>
                    <img
                        src="/assest/patient/pp.png"
                        alt="Profile"
                    />
                </div>

            </div>

        </div>

    </aside>


      <section className={styles.dashboardContent}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={`${styles.navContent} ${styles.glass}`}>
          <div className={styles.buttonAddAppoi}>
            <button
              className={styles.mappbut}
              onClick={() => navigate("/patient/make&appointment")}
            >
              <div className={styles.addDivApp}>+</div>
              Make an New Appointment
            </button>
          </div>
  
          <div className={styles.profileSec}>
            <div className={styles.profilePic}>
            <img className={styles.navPP} src="/assest/patient/pp.png" alt="Profile" />

            </div>
              <div className={styles.nameNav}>
                <p>Mia Quian</p>
              </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.cards}>
          <div className={styles.containerCards}>
        <div className={styles.rowOneWrap}>

            {/* BOX ONE */}
            <div className={styles.bOXONE}>
              <div className={styles.bOsecone}>
                <div className={styles.bOrowOne}>
                  <div className={`${styles.bOmainprof} ${styles.glass}`}><img src="/assest/patient/pp.png" alt="" /></div>
                  <div className={`${styles.bOinfo} ${styles.glass}`}>
                    <h1>{apiPatientData.first_name || "Unknown"}</h1>
                    <div className={`${styles.bOinfoin} ${styles.glass}`}>
                      <p>Age: {calculateAge(apiPatientData.birth_date) || "Unknown"}</p>
                      <p>Gender: {apiPatientData.gender || "Unknown"}</p>
                      <p>Patient ID: {apiPatientData.personal_id || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className={`${styles.bOmedinfo} ${styles.glass}`}>
                  <div className={styles.bOmedinfoONE}>
                    <div className={styles.medinfos}>
                      <Blood/>
                      <p>Blood Type: {apiPatientData.blood_type}</p>
                    </div>

                    <div className={styles.medinfos}>
                      <Yourdoc/>
                      <p>Status: Stable</p>
                    </div>

                    <div className={styles.medinfos}>
                      <TimePast/>
                      <p>Last Doctor: <br /> {apiData.last_doctor || "No Doctor"}</p>
                    </div>

                  </div>
                  <div>

                    <div className={styles.medinfos}><TimePast/>Last Visit:</div>
                      <div className={`${styles.lastseco} ${styles.glass}`}>
                        <div className={styles.infosin}>Visits
                          <div className={`${styles.bOnums} ${styles.glass}`}>{apiData.visitse}</div>
                        </div>
                        
                      </div> 
                    </div>
                </div>

              </div>

              <div className={`${styles.bOsectwo} ${styles.glass}`}>
                <h1>Today</h1>
                <div className={styles.bOflex}><div className={`${styles.bOsectwoA} ${styles.glass}`}> <p>Appointment</p> </div> <div className={`${styles.bOsectwoA} ${styles.glass}`}> <p>10:00AM</p></div></div>
                <div className={styles.bOflex}><div className={`${styles.bOsectwoA} ${styles.glass}`}> <p>Dr.Jessica</p> </div> <div className={`${styles.bOsectwoA} ${styles.glass}`}> <p>Room 204</p></div></div>
                <div className={styles.bOflex}>
                <button
                  className={`${styles.bObutton} ${styles.glass}`}
                  onClick={() => navigate("/patient/appointment")}
                  >
                      <p>More Info</p>
                      <Arrow />
                  </button>
          </div>
              </div>
            </div>

            {/* BOX TWO */}
            <div className={styles.bOXTWO}>
              <h1>Days Until Appointment</h1>
              <div className={`${styles.circays} ${styles.glass}`}><div className={styles.innieDiv}>{daysUntil(apiData.next_appointment?.scheduled_time)}</div></div>
              <p className={styles.dateofcir}>Last Update: {getCurrentDateTime()}</p>
            </div>
                    </div>
                    
              
                    <div className={styles.bTrowOneWrap}>

                        {/* BOX ONE */}
            <div className={styles.bOXTHREE}>
              <h1 className={styles.bOXTHh1}>Current Medications</h1>

              <div className={styles.bTHseconeDiv}>

                {/* Row 1 */}
                <div className={`${styles.bTHsecone} staggerList`}>
                  <div className={`${styles.madicalBox} ${styles.glass}`}>
                    <h1>Amoxicillin</h1>
                    <div className={styles.madicalBoxDet}>
                      <p>500mg · 3x daily</p>
                      <p>Next dose: 8:00 PM</p>
                    </div>
                  </div>

                  <div className={`${styles.madicalBox} ${styles.glass}`}>
                    <h1>Ibuprofen</h1>
                    <div className={styles.madicalBoxDet}>
                      <p>200mg · 2x daily</p>
                      <p>Next dose: 10:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className={`${styles.bTHsecone} staggerList`}>
                  <div className={`${styles.madicalBox} ${styles.glass}`}>
                    <h1>Vitamin D</h1>
                    <div className={styles.madicalBoxDet}>
                      <p>1000 IU · Daily</p>
                      <p>Next dose: Tomorrow</p>
                    </div>
                  </div>

                  <div className={`${styles.madicalBox} ${styles.glass}`}>
                    <h1>Paracetamol</h1>
                    <div className={styles.madicalBoxDet}>
                      <p>500mg · As needed</p>
                      <p>Next dose: —</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            {/* BOX FOUR */}
            <div className={styles.bOXFOUR}>
  <h1 className={styles.heronoti}>Notifications</h1>

            {apiData.latest_unread_notifications?.length > 0 ? (
              apiData.latest_unread_notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`${styles.notification} ${styles.glass}`}
                >
                  <div className={styles.notiname}>
                    <h1>{notification.title}</h1>
                  </div>

                  <p className={styles.discnoti}>
                    {notification.message}
                  </p>

                  <p className={styles.dataNoti}>
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.discnoti}>No new notifications</p>
            )}

            <Link
              className={styles.linkbuttnotif}
              to="/patient/notifications"
            >
              <button className={`${styles.buttnotif} ${styles.glass}`}>
                View All Notifications
                <Arrow className={styles.Arrownoti} />
              </button>
            </Link>
          </div>
        </div>
    
      
        </div>
      </main>
    </section>

     

    </div>
  );

}

export default PatientHome;