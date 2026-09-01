import styles from "./n.module.css";
import { useState } from "react";
import Logo from "../../assets/patient/logo.svg?react";
import { useNavigate } from "react-router-dom";


function RegisterC() {
  const navigate = useNavigate();
  const handleBtn = () => {
    navigate("/login");
  }

  return (
    <div className={styles.loginpage}>
        <div className={styles.backgroundImg}>
            <img className={styles.rightDNA} src="./assest/login/dna-svgrepo-com 1.svg" alt="" />
            <img className={styles.rightTopDNA} src="./assest/login/dna-svgrepo-com 2.svg" alt="" />
            <img className={styles.leftDNA} src="./assest/login/dna-svgrepo-com 4.svg" alt="" />
            <img className={styles.bigBottom} src="./assest/login/dna-svgrepo-com 3.svg" alt="" />
        </div>

        <main className={styles.mainLog}>
          <Logo
            className={styles.heroLogo}
          />
            <p className={styles.heroTextA}>Check your email</p>
            <div className={styles.secTextA}>We’ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.</div>

            <button onClick={handleBtn} className={styles.signUpButton}>Return to log in</button>

        </main>

    </div>
  );
}


export default RegisterC;