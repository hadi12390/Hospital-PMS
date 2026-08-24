import styles from "./Register.module.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "./svg/logo.svg?react";


function Register() {


  return (
    <div className={styles.loginpage}>
        <div className={styles.headerLogo}>
            <logo></logo>
        </div>

        <main className={styles.mainLog}>
          
        </main>
        

    </div>
    
  );
}

export default Register;