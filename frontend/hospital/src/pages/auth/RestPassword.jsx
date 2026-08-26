import styles from "./RestPassword.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function RestPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const [email, setEmail] = useState("");


    async function postEmail() {
      try {
        // Data you want to send
        const dataToSend = {
          email: email,
        };

        // Send POST request to API
        const hostName = window.location.hostname;
        const response = await fetch(`http://${hostName}:8000/dj-rest-auth/password/reset/`, {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dataToSend),
        });

        // Check if request failed
          if (!response.ok) {
            const errorData = await response.json();

            console.log("❌ Request failed");
            console.log("Status code:", response.status);
            console.log("Status text:", response.statusText);
            console.log("Error data:", errorData);

            throw new Error("Request failed");
          }

        // Convert response to JSON
        const data = await response.json();

        // Display response
        console.log(data);

        navigate("/resetpasswordDone")

      } catch (error) {
        // Display error
        console.error(error);
      }
    }

    const sentEmail = ()=>{
      
      console.log("Email have send");
      console.log("Email: ",email);
      postEmail();

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
          <h1 className={styles.heroText}>Reset Password Here!</h1>
            <div className={styles.loginSec}>
              <h1 className={styles.secText}>Email</h1>
            </div>

            <div className={styles.inputBox}>
                <input 

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sentEmail();
                  }
                }}

                onChange={(e) => setEmail(e.target.value)}
                
                type="email" placeholder="example@gmail.com"/>
                <span className={styles.icon}><img src="./assest/login/person-svgrepo-com 1.svg" alt="" /></span>
            </div>
            
            <button onClick={sentEmail} className={styles.sendEmailButton}>SEND EMAIL</button>

        </main>

    </div>
  );
}

export default RestPassword;