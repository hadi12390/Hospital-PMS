import styles from "./Login.module.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleLogin = async () => {
      setError("");
      setLoading(true);

      try {
        const response = await fetch("http://alpha.localhost:8000/dj-rest-auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        console.log("Login successful:", data);
        // e.g. save token and redirect
        // localStorage.setItem("token", data.token);
        // navigate("/dashboard");

      } catch (err) {
        console.error("Login error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
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
          <h1 className={styles.heroText}>Wellcome Back!</h1>
            <div className={styles.loginSec}>
              <h1 className={styles.secText}>Email and Password</h1>
            </div>

            <div className={styles.inputBox}>
                <input 
                  type="email" 
                  placeholder="example@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className={styles.icon}><img src="./assest/login/person-svgrepo-com 1.svg" alt="" /></span>
            </div>

            <div className={styles.inputBox}>
                <input
                onChange={(e) => setPassword(e.target.value)}

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                
                type={showPassword ? "text" : "password"} placeholder="Password"/>

                <span className={styles.icon}>
                  <button className={styles.passViB} onClick={() => setShowPassword(!showPassword)}>
                    <img className={styles.passVi} src={showPassword? "./assest/login/eye-password-see-view-svgrepo-com 1.svg" : "./assest/login/eye-svgrepo-com 1.svg"} alt="" />
                  </button>
                  
                </span>
            </div>
            <Link className={styles.frog} to="/resetpassword">
              Forget password?
            </Link>


            <button onClick={handleLogin} className={styles.signInButton}>SIGN IN</button>

            <p className={styles.dontSignUp}>
              Dont have an account ? <span>
                <Link to="/register">
                  Sign Up
                </Link>

                </span>
            </p>

        </main>
        

    </div>
    
  );
}

export default Login;