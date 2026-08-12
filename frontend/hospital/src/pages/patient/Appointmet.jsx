import styles from "./Appointment.module.css";
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
import Search from "../../assets/patient/search.svg?react";
import Location from "../../assets/patient/location.svg?react";
import Status from "../../assets/patient/status.svg?react";
import Approved from "../../assets/patient/approved.svg?react";
import ExpArrow from "../../assets/patient/expArrwo.svg?react";


import { useRef, useState } from 'react';
import { NavLink } from "react-router-dom";

function PatientAppointment(){
  const [searchValue, setSearchValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  const toggleCard = () => {
  const next = !expanded;
  setExpanded(next);

  if (next) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start", // or "center"
        });
      }, 350);
    }
  };
  return (
    <div className={styles.PatientDashboard}>

      <aside className={styles.sideBar}>
        <img src="/assest/patient/logo.svg" alt="Logo" />

        <div className={styles.contSide}>
          <div className={styles.optionsContainer}>
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

            <NavLink
              to="/patient/report"
              className={({ isActive }) =>
                `${styles.options} ${styles.docuLogoButton} ${
                  isActive ? styles.active : ""
                }`
              }
            >
              <DocuLogo className={styles.doculogoicon} />
            </NavLink>
          </div>

          <div className={styles.optionsContainer}>
            <NavLink
              to="/patient/help"
              className={({ isActive }) =>
                `${styles.options} ${styles.helpLogoButton} ${
                  isActive ? styles.active : ""
                }`
              }
            >
              <HelpLogo className={styles.helplogoicon} />
            </NavLink>

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

          <div className={styles.logoutsec}>
            <div className={styles.optionsContainer}>
              <button className={`${styles.options} ${styles.logoutLogoButton}`}>
                <LogOutLogo className={styles.logoutlogoicon} />
              </button>

              <NavLink
                to="/patient/account"
                className={({ isActive }) =>
                  `${styles.options} ${styles.settLogoButton} ${
                    isActive ? styles.active : ""
                  }`
                }
              >
                <SettLogo className={styles.Asettlogoicon} />
              </NavLink>
            </div>

            <div className={styles.profPicLogOut}>
              <img src="/assest/patient/pp.png" alt="Profile" />
            </div>
          </div>
        </div>
      </aside>


      <section className={styles.dashboardContent}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={`${styles.navContentSearch} ${styles.glass}`}>
          <div className={styles.searchIcon}>
            <Search size={18} />
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for Appointment"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className={`${styles.navContent} ${styles.glass}`}>
          <div className={styles.buttonAddAppoi}>
            <button>
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
        <div className={styles.nextAppointment}>
          <div className={styles.upperNextAppointment}>
            <div className={styles.heroNextApp}>Next Appointment</div>
            <div className={styles.timingNextApp}>1 day remaining</div>
          </div>

          <div className={styles.downNextAppointment}>
            <div className={styles.naCardOne}>
              <div className={styles.uppernacardone}>
                <div className={`${styles.surtype} ${styles.glass}`}>Cardiologist</div>

                <div className={`${styles.docName} ${styles.glass}`}>
                  <DocLogo/>
                  Dr. Jassica
                </div>
              </div>

              <div className={`${styles.docPho} ${styles.glass}`}>
                <img src="/assest/patient/doctor.png" alt="Profile" />
              </div>
            </div>

            <div className={`${styles.naCardTwo} ${styles.glass}`}>
              <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                <AppLogo className={styles.logonaCardTwo}/>
                <span>Date</span>
              </div>
              <div>

                <div className={styles.namaintext}>Monday <br />
                    12 August</div>
                <div className={styles.clocknatwo}>10:00 AM</div>
              </div>

            </div>

            <div className={`${styles.naCardTwo} ${styles.glass}`}>
              <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                <Location className={styles.logonaCardTwo}/>
                <span>Location</span>
              </div>
              <div>
                <div className={styles.namaintext}>
                    Building A <br />
                    Room</div>
                <div className={styles.clocknatwo}>204</div>
              </div>
            </div>

            <div className={`${styles.naCardFour} ${styles.glass}`}>
              <div>
                <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                  <Status className={styles.logonaCardTwo}/>
                  <span>Status</span>
                </div>

                <div className={styles.statusA}>
                  Confirmed
                </div>
              </div>

              <div className={styles.iconstatusA}><Approved className={styles.iconmnn}></Approved></div>
            </div>
          </div>
        </div>

        <div className={styles.heroSecName}>Upcoming Appointments</div>
        <div className={styles.expAllCards}>
          <div className={`${styles.expcard} ${expanded ? styles.expexpanded : ""}`}>
          <div className={styles.expheader}>
            <h3>15 Jul | Dr. Sarah</h3><h3>Dermatology</h3><h3>2:00 PM</h3>
          </div>

          <div ref={cardRef} className={styles.expcontent}>
            <div className={styles.expinner}>
              <div className={styles.expcardsin}>
                <div className={styles.naCardOne}>
                <div className={styles.uppernacardone}>
                  <div className={`${styles.surtype} ${styles.glass}`}>Cardiologist</div>

                  <div className={`${styles.docName} ${styles.glass}`}>
                    <DocLogo/>
                    Dr. Jassica
                  </div>
                </div>

                <div className={`${styles.docPho} ${styles.glass}`}>
                  <img src="/assest/patient/doctor.png" alt="Profile" />
                </div>
                </div>

                <div className={`${styles.naCardTwo} ${styles.glass}`}>
                  <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                    <AppLogo className={styles.logonaCardTwo}/>
                    <span>Date</span>
                  </div>
                  <div>

                    <div className={styles.namaintext}>Monday <br />
                        12 August</div>
                    <div className={styles.clocknatwo}>10:00 AM</div>
                  </div>

                </div>

                <div className={`${styles.naCardTwo} ${styles.glass}`}>
                  <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                    <Location className={styles.logonaCardTwo}/>
                    <span>Location</span>
                  </div>
                  <div>
                    <div className={styles.namaintext}>
                        Building A <br />
                        Room</div>
                    <div className={styles.clocknatwo}>204</div>
                  </div>
                </div>

                <div className={`${styles.naCardFour} ${styles.glass}`}>
                <div>
                  <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                    <Status className={styles.logonaCardTwo}/>
                    <span>Status</span>
                  </div>

                  <div className={styles.statusA}>
                    Confirmed
                  </div>
                </div>

                <div className={styles.iconstatusA}><Approved className={styles.iconmnn}></Approved></div>
              </div>
            </div>
          </div>
        </div>
          <div className={styles.downerEXP}>
            <div className={styles.expStatusLogo}>
              <div className={styles.expStatusLogomain}>
                <Approved className={styles.approved}/>
              </div>
              Confirmed
            </div>
            <button
              className={`${styles.toggleBtn} ${
                expanded ? styles.open : ""
              }`}
              onClick={toggleCard}
            >
              <ExpArrow className={styles.arrow} />
            </button>
          </div>
          </div>
          <div className={`${styles.expcard} ${expanded ? styles.expexpanded : ""}`}>
            <div className={styles.expheader}>
              <h3>15 Jul | Dr. Sarah</h3><h3>Dermatology</h3><h3>2:00 PM</h3>
            </div>

            <div ref={cardRef} className={styles.expcontent}>
              <div className={styles.expinner}>
                <div className={styles.expcardsin}>
                  <div className={styles.naCardOne}>
                  <div className={styles.uppernacardone}>
                    <div className={`${styles.surtype} ${styles.glass}`}>Cardiologist</div>

                    <div className={`${styles.docName} ${styles.glass}`}>
                      <DocLogo/>
                      Dr. Jassica
                    </div>
                  </div>

                  <div className={`${styles.docPho} ${styles.glass}`}>
                    <img src="/assest/patient/doctor.png" alt="Profile" />
                  </div>
                  </div>

                  <div className={`${styles.naCardTwo} ${styles.glass}`}>
                    <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                      <AppLogo className={styles.logonaCardTwo}/>
                      <span>Date</span>
                    </div>
                    <div>

                      <div className={styles.namaintext}>Monday <br />
                          12 August</div>
                      <div className={styles.clocknatwo}>10:00 AM</div>
                    </div>

                  </div>

                  <div className={`${styles.naCardTwo} ${styles.glass}`}>
                    <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                      <Location className={styles.logonaCardTwo}/>
                      <span>Location</span>
                    </div>
                    <div>
                      <div className={styles.namaintext}>
                          Building A <br />
                          Room</div>
                      <div className={styles.clocknatwo}>204</div>
                    </div>
                  </div>

                  <div className={`${styles.naCardFour} ${styles.glass}`}>
                  <div>
                    <div className={`${styles.upperNaTwo} ${styles.glass}`}>
                      <Status className={styles.logonaCardTwo}/>
                      <span>Status</span>
                    </div>

                    <div className={styles.statusA}>
                      Confirmed
                    </div>
                  </div>

                  <div className={styles.iconstatusA}><Approved className={styles.iconmnn}></Approved></div>
                </div>
              </div>
            </div>
          </div>
            <div className={styles.downerEXP}>
              <div className={styles.expStatusLogo}>
                <div className={styles.expStatusLogomain}>
                  <Approved className={styles.approved}/>
                </div>
                Confirmed
              </div>
              <button
                className={`${styles.toggleBtn} ${
                  expanded ? styles.open : ""
                }`}
                onClick={toggleCard}
              >
                <ExpArrow className={styles.arrow} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.heroSecName}>History</div>
          <div className={styles.wid100}>
            <div className={`${styles.expcardH}`}>
            <div className={styles.expheader}>
              <h3>15 Jul | Dr. Sarah</h3>
              <div>
              <div className={styles.expStatusLogo}>
                <div className={styles.expStatusLogomain}>
                  <Approved className={styles.approved}/>
                </div>
                Confirmed
              </div>
            </div>
            </div>
          </div>
          <div className={`${styles.expcardH}`}>
            <div className={styles.expheader}>
              <h3>15 Jul | Dr. Sarah</h3>
              <div>
              <div className={styles.expStatusLogo}>
                <div className={styles.expStatusLogomain}>
                  <Approved className={styles.approved}/>
                </div>
                Confirmed
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

export default PatientAppointment;