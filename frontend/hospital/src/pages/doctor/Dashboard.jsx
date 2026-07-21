import  styles from "./Dashboard.module.css";



function DoctorDashboard(){

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
        <div>
          <div className={styles.fullNameBox}>
            <div className={styles.heroNameP}>
              <p className={styles.heroName}>Hello, Jessica  </p><p>👋</p>
            </div>
            <p>There is latest update for the last 7 days. check now</p>
          </div>

          <div>

          </div>

        </div>
       <div className={styles.containerCards}>
          <div className={styles.box1}>1</div>
          <div className={styles.box2}>2</div>
          <div className={styles.box3}>3</div>
          <div className={styles.box4}>4</div>
          <div className={styles.box5}>5</div>
          <div className={styles.box6}>6</div>
      </div>
      </main>


    </section>

  </div>
);

}

export default DoctorDashboard;