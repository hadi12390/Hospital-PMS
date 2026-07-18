import "./Register.css";
import { useState } from "react";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [match, setMatch] = useState(false);
    const [passwordOne, setPasswordOne] = useState("");
    const [passwordTwo, setPasswordTwo] = useState("");



    const checkMatch = ()=>{
       
        
        if(passwordOne !== passwordTwo){
            setMatch(true);
        }
        else{
            setMatch(false);
        }
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
          <h1 id="heroText">Wellcome to our team!</h1>
            <div id="loginSec">
              <h1 id="secText">User Name</h1>
            </div>

            <div className="input-box-register">
                <input type="email" placeholder="Name"/>
                <span className="icon"><img src="./assest/login/person-svgrepo-com 1.svg" alt="" /></span>
            </div>

            <div id="loginSec">
              <h1 id="secText">Email</h1>
            </div>

             <div className="input-box-register">
                <input type="email" placeholder="example@gmail.com"/>
                <span className="icon"><img src="./assest/login/email-9-svgrepo-com 1.svg" alt="" /></span>
            </div>

            <div id="loginSec">
              <h1 id={match?"errorPasswordRegister" :"secText"}>Password</h1>
            </div>
            
            <div className="input-box-register">
                <input onChange={(e) => setPasswordOne(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password"/>

                <span className="icon">
                  <button id="passViB" onClick={() => setShowPassword(!showPassword)}>
                    <img id="passVi" src={showPassword? "./assest/login/eye-password-see-view-svgrepo-com 1.svg" : "./assest/login/eye-svgrepo-com 1.svg"} alt="" />
                  </button>
                  
                </span>
            </div>

            <div id="loginSec">
              <h1 id={match?"errorPasswordRegister" :"secText"}>Confirm Password</h1>
            </div>

            <div className="input-box-register">
                <input onChange={(e) => setPasswordTwo(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Confirm Password"/>

                <span className="icon">
                  <button id="passViB" onClick={() => setShowPassword(!showPassword)}>
                    <img id="passVi" src={showPassword? "./assest/login/eye-password-see-view-svgrepo-com 1.svg" : "./assest/login/eye-svgrepo-com 1.svg"} alt="" />
                  </button>
                  
                </span>
            </div>


            <button onClick={checkMatch} className="signUpButton" id="signInButton">SIGN UP</button>

            <p className="errorPasswordRegister">{match?"The password is not match" : ""}</p>
        </main>

    </div>
  );
}

export default Register;
