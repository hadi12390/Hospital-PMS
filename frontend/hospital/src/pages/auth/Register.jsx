import styles from "./Register.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [match, setMatch] = useState(false);

    const navigate = useNavigate();


    const [passwordOne, setPasswordOne] = useState("");
    const [passwordTwo, setPasswordTwo] = useState("");

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");

    const hundleSignUp = async () => {

      // Check if passwords match
      if (passwordOne !== passwordTwo) {
      setMatch(true);
      return; // Stop the signup request
      }

      setMatch(false);

      const hostName = window.location.hostname;

      try {
      const response = await fetch(
      `http://${hostName}:8000/dj-rest-auth/registration/`,
      {
      method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: userName,
            email: email,
            password1: passwordOne,
            password2: passwordTwo,
          }),
        }
      );

      const result = await response.json();

      // Check for API errors
      if (!response.ok) {
        console.log("Signup error:", result);

        throw new Error(
          "Failed to create account."
        );
      }

      console.log("Account created successfully:", result);
      navigate("/register/successful");


        } catch (error) {
        console.error("Signup error:", error.message);
        }

          console.log(userName)
          console.log(email)
          console.log(passwordOne)
          console.log(passwordTwo)
      };
    
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
          <h1 className={styles.heroText}>Wellcome to our team!</h1>
            <div className={styles.loginSec}>
              <h1 className={styles.secText}>User Name</h1>
            </div>

            <div className={styles.inputBoxRegister}>
                <input onChange={(e) => setUserName(e.target.value)} type="email" placeholder="Name"/>
                <span className={styles.icon}><img src="./assest/login/person-svgrepo-com 1.svg" alt="" /></span>
            </div>

            <div className={styles.loginSec}>
              <h1 className={styles.secText}>Email</h1>
            </div>

             <div className={styles.inputBoxRegister}>
                <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="example@gmail.com"/>
                <span className={styles.icon}><img src="./assest/login/email-9-svgrepo-com 1.svg" alt="" /></span>
            </div>

            <div className={styles.loginSec}>
              <h1 className={match ? styles.secTextError : styles.secText}>Password</h1>
            </div>
            
            <div className={styles.inputBoxRegister}>
                <input onChange={(e) => setPasswordOne(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password"/>

                <span className={styles.icon}>
                  <button className={styles.passViB} onClick={() => setShowPassword(!showPassword)}>
                    <img className={styles.passVi} src={showPassword? "./assest/login/eye-password-see-view-svgrepo-com 1.svg" : "./assest/login/eye-svgrepo-com 1.svg"} alt="" />
                  </button>
                  
                </span>
            </div>

            <div className={styles.loginSec}>
              <h1 className={match ? styles.secTextError : styles.secText}>Confirm Password</h1>
            </div>

            <div className={styles.inputBoxRegister}>
                <input onChange={(e) => setPasswordTwo(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Confirm Password"/>

                <span className={styles.icon}>
                  <button className={styles.passViB} onClick={() => setShowPassword(!showPassword)}>
                    <img className={styles.passVi} src={showPassword? "./assest/login/eye-password-see-view-svgrepo-com 1.svg" : "./assest/login/eye-svgrepo-com 1.svg"} alt="" />
                  </button>
                  
                </span>
            </div>


            <button onClick={hundleSignUp} className={styles.signUpButton}>SIGN UP</button>

            <p className={styles.errorPasswordRegister}>{match?"The password is not match" : ""}</p>
        </main>

    </div>
  );
}


export default Register;