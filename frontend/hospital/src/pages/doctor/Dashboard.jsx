import  styles from "./Dashboard.module.css";
import { useRef, useState } from "react";



function DoctorDashboard(){

  function getCurrentDate() {
    const date = new Date();

    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  }

  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const dateInput = useRef();

  function handleDateChange(e) {
    
    const value = e.target.value; 
      if (!value) {
              setCurrentDate(""); 
              return;
          }
    const [year, month, day] = value.split("-");

    setCurrentDate(`${day} / ${month} / ${year}`);
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
        "Saturday"
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
        "December"
    ];

    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const month = months[date.getMonth()];

    function getSuffix(day) {
        if (day > 3 && day < 21) return "th";

        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    return {
        dayName,
        dayNumber,
        suffix: getSuffix(dayNumber),
        month
        };
    }

  const today = getFormattedDate();

  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];
  const appointments = [
  {
    id: 1,
    day: "Mon",
    patient: "MIA",
    type: "Surgery",
    start: "09:00",
    end: "10:30",
    color: "#378ADD",
  },
  {
    id: 2,
    day: "Tue",
    patient: "John",
    type: "Checkup",
    start: "11:00",
    end: "12:00",
    color: "#2ECC71",
  },
  {
    id: 3,
    day: "Thu",
    patient: "Sara",
    type: "Consultation",
    start: "14:00",
    end: "16:00",
    color: "#F39C12",
  },];

  const START = 8;
  const END = 18;

  function timeToPercent(time) {
      const [hour, minute] = time.split(":").map(Number);

      const total = hour + minute / 60;

      return ((total - START) / (END - START)) * 100;
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
          <img src="/assest/doctor/sidebar/col-right-svgrepo-com 1.svg" alt="" />
          <span>Appointment</span>
        </button>

        <button className={styles.options}>
          <img src="/assest/doctor/sidebar/person.svg" alt="" />
          <span>My Patient</span>
        </button>

        <button className={styles.options}>
          <img src="/assest/doctor/sidebar/dwajdoies.svg" alt="" />
          <span>Patient Info</span>
        </button>

        <button className={styles.options}>
          <img src="/assest/doctor/sidebar/SVGRepo_iconCarriear.svg" alt="" />
          <span>Checkup</span>
        </button>

        <button className={styles.options}>
          <img src="/assest/doctor/sidebar/TAQWI.svg" alt="" />
          <span>My Schedule</span>
        </button>

      </div>


      <p className={styles.optName}>OTHER MENU</p>

      <div className={styles.optionsContainer}>

        <button className={`${styles.options} ${styles.otherMenu}`}>
          <img src="/assest/doctor/sidebar/SVGRepo_iconCarrier (1).svg" alt="" />
          <span>Help & Center</span>
        </button>

        <button className={`${styles.options} ${styles.otherMenu}`}>
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
              Appointment
            </button>
          </div>


          <img src="/assest/doctor/cards/LIne3.svg" alt="" />


          <div className={styles.profileSec}>
            <div className={styles.profilePic}>
              J
            </div>

            <button className={styles.profBut}>
              <img src="/assest/doctor/cards/dropDown.svg" alt="Dropdown" />
            </button>

          </div>

        </div>

      </nav>


      {/* Main Content */}
      <main className={styles.cards}>
        <div className={styles.heroSec}>
          <div className={styles.fullNameBox}>
            <div className={styles.heroNameP}>
              <p className={styles.heroName}>Hello, Jessica  </p><p>👋</p>
          </div>
            <p className={styles.heroPar}>There is latest update for the last 7 days. check now</p>
          </div>

          <div className={styles.dateRealDay}>
              <img src="/assest/doctor/cards/Vector (1).svg" alt="" />
              <p><span>{today.dayName}</span> , <span>{today.dayNumber}</span>th <span>{today.month}</span></p>
          </div>

        </div>
       <div className={styles.containerCards}>

        {/* BOX ONE */}

          <div className={styles.box1}>

            <div className={styles.boxJustiUper}>
              <div><img src="/assest/doctor/cards/calendar-svgrepo-com 1.svg" alt="" /></div>
              <div>Total Appointment</div>
            </div>

            <div className={styles.boxJustiDown}>
              <h1>514</h1>
              <div>since 12/4/2019</div>
            </div>

          </div>
        {/* BOX TWO */}

          <div className={styles.box2}>
            <div className={styles.boxJustiUper}>
              <div><img src="/assest/doctor/cards/update-svgrepo-com 1.svg" alt="" /></div>
              <div>Week Appointment</div>
            </div>

            <div className={`${styles.boxJustiDown}`} >
              <h1>12</h1>
              {/* {styles.precentRed} */}
              <div><span className={styles.precentGreen}>20%</span> from last week</div>
            </div>
            
          </div>
        {/* BOX THREE */}
          <div className={styles.box3}>
            <div className={styles.boxJustiUper}>
              <div><img src="/assest/doctor/cards/patient-profile-people-svgrepo-com 1.svg" alt="" /></div>
              <div>Last Patient</div>
            </div>

            <div className={styles.boxJustiDown}>
              <h1>Mia Quian</h1>
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
                {days.map(day => (
                    <div className={styles.dayRow} key={day}>

                        <div className={styles.day}>
                            {day}
                        </div>

                        <div className={styles.timeline}>

                            {appointments
                                .filter(app => app.day === day)
                                .map(app => (
                                    <div
                                        key={app.id}
                                        className={styles.appointment}
                                        style={{
                                            left: `${timeToPercent(app.start)}%`,
                                            width: `${timeToPercent(app.end) - timeToPercent(app.start)}%`,
                                            backgroundColor: app.color,
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

                    {[
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
                    ].map(time => (
                        <span key={time}>{time}</span>
                    ))}
                </div>

          </div>
          </div>

        {/* BOX FIVE */}

          <div className={styles.box5}>
            <div>
              <div className={styles.boxJustiUper}>
                <div><img src="/assest/doctor/cards/calendar-user-svgrepo-com 1.svg" alt="" /></div>
                <div>Current Appointment</div>
              </div>

              <div className={styles.boxJustiDown}>
                <h1>Sara Morgan</h1>
              </div>

            </div>
            <div className={styles.fullMain}>
              <div className={styles.mainSecOne}>
                <div className={styles.mainBack} >
                  <div>
                  <div className={styles.whiteBack}>
                      <div className={styles.stateBack}>
                        <img src="/assest/doctor/cards/done-ring-round-svgrepo-com 1.svg" alt="" />
                      </div>
                        confirmed
                  </div>
              
                  </div>
                  
                  
                </div>
                <div className={styles.mainClock}>
                          <img src="/assest/doctor/cards/SVGRepo_iconCarrier.svg" alt="jj" />
                    <div>
                          8:00 AM
                    </div>
                  </div>
                </div>
                
              <div className={styles.mainSecTwo}>
                

                <div  className={styles.mainArrowA}>
                  <img src="/assest/doctor/cards/go-svgrepo-com 1.svg" alt="jj" />
                </div>
              </div>
            </div>
          </div>

        {/* BOX SIX */}

          <div className={styles.box6}>
            <div className={styles.boxJustiUper}>
              <div><img src="/assest/doctor/cards/arrow-sm-right-svgrepo-com 1.svg" alt="" /></div>
              <div>Next Appointment</div>
            </div>

            <div className={styles.boxJustiDownForSix}>
              <h1>Jeirn gazi</h1>
              <div><p>Dentist</p><p>Wednesday 16th July </p></div>
            </div>
            
          </div>
      </div>
      </main>


    </section>

  </div>
);

}

export default DoctorDashboard;