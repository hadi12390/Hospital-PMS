import "./RestPasswordDone.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function RestPasswordDone() {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();


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
          <h1 id="heroText">Check Your Email!</h1>
            <div id="loginSec">
              <h1 id="secText">We've sent a password reset link to your email address. <br /> If you don't see it within a few minutes, check your spam or junk folder.</h1>
            </div>
            
            <button onClick={()=> {navigate("/login")}} id="BackToLoginButton">BACK TO LOGIN</button>

        </main>

    </div>
  );
}

export default RestPasswordDone;