import styles from "./Reports.module.css";
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
import Pill from "../../assets/patient/drugs.svg?react";
import Star from "../../assets/patient/star.svg?react";
import Locwhite from "../../assets/patient/locwhite.svg?react";
import Plusvec from "../../assets/patient/plusvec.svg?react";
import StatusB from "../../assets/patient/statusB.svg?react";
import DownloadIcon from "../../assets/patient/download.svg?react";
import NotificationLogo from "../../assets/patient/notification.svg?react";




import { useRef, useState } from 'react';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import AppointmentButton from "./AppointmentButton";

function Reports(){
  const navigate = useNavigate();
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
        <div className={`${styles.navContentSearch} ${styles.glass}`}>
          <div className={styles.searchIcon}>
            <Search size={18} />
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for Doctor"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
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
        <h1 className={styles.heroNameOB}>Latest Report</h1>
        <div className={`${styles.lastReportCard}`}>
            <div className={styles.heroSecLR}>
                    <h3>Complete Blood Count</h3><p>11 day ago</p>
            </div>
                <div className={styles.containLR}>
                    <div className={`${styles.secOneLR}`}>          
                        <div className={`${styles.glass} ${styles.docNameLR}`}> <DocLogo/> Dr. Jassica</div>
                            <div className={`${styles.glass} ${styles.cardOneLR}`}>
                                <div className={`${styles.glass} ${styles.cardOneLRDate}`}>Date</div>
                                    <h3>
                                        Monday
                                        <br />
                                        31 July
                                    </h3>
                                <p className={styles.cardOneLRTime}>10:00 AM</p>
                            </div>
                    </div>

                    <div className={`${styles.glass} ${styles.secTwoLRR}`}>
                        <div className={`${styles.glass} ${styles.secStatus}`}>
                            <StatusB/>status
                        </div>
                        <div className={styles.stutusT}>
                            Normal
                        </div>
                    </div>

                    <div className={`${styles.glass} ${styles.secTwoLR}`}>
                        <div className={`${styles.glass} ${styles.secStatusD}`}>
                            Download
                        </div>
                        <div className={styles.stutusT}>
                            <button><DownloadIcon/></button>
                        </div>
                    </div>
                </div>
        </div>
        <h1 className={styles.heroNameOB}>Recent Reports</h1>
        <div className={`${styles.lastReportCard}`}>
            <div className={styles.heroSecLR}>
                    <h3>Complete Blood Count</h3><p>11 day ago</p>
            </div>
        <div className={styles.containLR}>
            <div className={`${styles.secOneLR}`}>          
                <div className={`${styles.glass} ${styles.docNameLR}`}> <DocLogo/> Dr. Jassica</div>
                    <div className={`${styles.glass} ${styles.cardOneLR}`}>
                        <div className={`${styles.glass} ${styles.cardOneLRDate}`}>Date</div>
                            <h3>
                                Monday
                                <br />
                                31 July
                            </h3>
                        <p className={styles.cardOneLRTime}>10:00 AM</p>
                    </div>
            </div>

            <div className={`${styles.glass} ${styles.secTwoLRR}`}>
                <div className={`${styles.glass} ${styles.secStatus}`}>
                    <StatusB/>status
                </div>
                <div className={styles.stutusT}>
                    Normal
                </div>
            </div>

            <div className={`${styles.glass} ${styles.secTwoLR}`}>
                <div className={`${styles.glass} ${styles.secStatusD}`}>
                    Download
                </div>
                <div className={styles.stutusT}>
                    <button><DownloadIcon/></button>
                </div>
            </div>
        </div>
        </div>
      </main>
    </section>
    </div>
  );

}

export default Reports;