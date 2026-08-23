import styles from "./RestPasswordDone.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function RestPasswordDone() {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();


  return (
    <div className={styles.loginpage}>
        <div className={styles.backgroundImg}>
            <img className={styles.rightDNA} src="./assest/login/dna-svgrepo-com 1.svg" alt="" />
            <img className={styles.rightTopDNA} src="./assest/login/dna-svgrepo-com 2.svg" alt="" />
            <img className={styles.leftDNA} src="./assest/login/dna-svgrepo-com 4.svg" alt="" />
            <img className={styles.bigBottom} src="./assest/login/dna-svgrepo-com 3.svg" alt="" />
        </div>

        <main className={styles.mainLog}>
          <img className={styles.heroLogo} src="./assest/logo.svg" alt="Medix" />
          <h1 className={styles.heroText}>Check Your Email!</h1>
            <div className={styles.loginSec}>
              <h1 className={styles.secText}>We've sent a password reset link to your email address. <br /> If you don't see it within a few minutes, check your spam or junk folder.</h1>
            </div>
            
            <button onClick={()=> {navigate("/login")}} className={styles.backToLoginButton}>BACK TO LOGIN</button>

        </main>

    </div>
  );
}

export default RestPasswordDone;