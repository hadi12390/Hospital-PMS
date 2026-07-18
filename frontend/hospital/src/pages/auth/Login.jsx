import "./Login.css";
import { useState } from "react";
import { Link } from "react-router-dom";


function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
      console.log("Login");
    

    };
  return (
    <div>
        <div id="background-img">
            <img id="rightDNA" src="./assest/login/dna-svgrepo-com 1.svg" alt="" />
            <img id="rightTopDNA" src="./assest/login/dna-svgrepo-com 2.svg" alt="" />
            <img id="leftDNA" src="./assest/login/dna-svgrepo-com 4.svg" alt="" />
            <img id="bigBottom" src="./assest/login/dna-svgrepo-com 3.svg" alt="" />
        </div>

        <main>
          <img id="heroLogo" src="./assest/logo.svg" alt="Medix" />
          <h1 id="heroText">Wellcome Back!</h1>
            <div id="loginSec">
              <h1 id="secText">Email and Password</h1>
            </div>

            <div className="input-box">
                <input type="email" placeholder="example@gmail.com"/>
                <span className="icon"><img src="./assest/login/person-svgrepo-com 1.svg" alt="" /></span>
            </div>

            <div className="input-box">
                <input

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                
                type={showPassword ? "text" : "password"} placeholder="Password"/>

                <span className="icon">
                  <button id="passViB" onClick={() => setShowPassword(!showPassword)}>
                    <img id="passVi" src={showPassword? "./assest/login/eye-password-see-view-svgrepo-com 1.svg" : "./assest/login/eye-svgrepo-com 1.svg"} alt="" />
                  </button>
                  
                </span>
            </div>
            <Link id="frog" to="/resetpassword">
              Forget password?
            </Link>


            <button onClick={handleLogin} id="signInButton">SIGN IN</button>

            <p id="dontSignUp">
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