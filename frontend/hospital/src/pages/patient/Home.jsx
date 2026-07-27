import styles from "./Home.module.css";
import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";


function PatientHome(){

  return (
    <div className={styles.PatientDashboard}>

      <aside className={styles.sideBar}>
              <img src="/assest/patient/logo.svg" alt="Logo" />
      
      
              <div className={styles.optionsContainer}>
                <button className={`${styles.options} ${styles.homeLogoButton}`}>
                 <HomeLogo className={styles.homelogoicon} />
                </button>
      
                <button className={`${styles.options} ${styles.appLogoButton}`}>
                 <AppLogo className={styles.applogoicon} />
                </button>
      
                <button className={`${styles.options} ${styles.docLogoButton}`}>
                 <DocLogo className={styles.doclogoicon} />
                </button>
      
                <button className={`${styles.options} ${styles.pillLogoButton}`}>
                 <PillLogo className={styles.pilllogoicon} />
                </button>

                <button className={`${styles.options} ${styles.docuLogoButton}`}>
                 <DocuLogo className={styles.doculogoicon} />
                </button>
      
              </div>
      
      
              <div className={styles.optionsContainer}>
                <button className={`${styles.options} ${styles.helpLogoButton}`}>
                 <HelpLogo className={styles.helplogoicon} />
                </button>
      
                <button className={`${styles.options} ${styles.settLogoButton}`}>
                  <SettLogo className={styles.settlogoicon} />
                </button>
              </div>

              <div className={styles.logoutsec}>
                <div className={styles.optionsContainer}>
                  <button className={`${styles.options} ${styles.logoutLogoButton}`}>
                  <LogOutLogo className={styles.logoutlogoicon} />
                  </button>
        
                  <button className={`${styles.options} ${styles.settLogoButton}`}>
                    <SettLogo className={styles.Asettlogoicon} />
                  </button>
                </div>

                <div className={styles.profPicLogOut}>
                  <img src="/assest/patient/profPic.png" alt="as" />
                </div>
              </div> 
            </aside>

     

    </div>
  );

}

export default PatientHome;