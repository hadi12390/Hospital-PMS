import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";

import Logo from "./svg/logo.svg?react";
import SaveIcon from "./svg/medix.svg?react";
import Approved from "./svg/approved.svg?react";

function RegisterConfirmed() {
  const navigate = useNavigate();

  return (
    <div className={styles.registerPageM}>
      <main className={styles.mainLogM}>
        <div className={styles.headerLogo}>
          <Logo />
        </div>

        <h1 className={styles.heroTextM}>
          Registration Completed Successfully!
        </h1>

        <h2 className={styles.heroTextMH}>
          Your account has been created successfully. Welcome to Medix!
        </h2>

        <Approved className={styles.approvedIcon} />

        <button
          type="button"
          className={`${styles.saveButtonM} ${styles.glass}`}
          onClick={() => navigate("/login")}
        >
          Use Medix
          <div>
            <SaveIcon className={styles.saveIconM} />
          </div>
        </button>
      </main>
    </div>
  );
}

export default RegisterConfirmed;