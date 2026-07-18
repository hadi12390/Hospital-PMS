import "./RestPassword.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function RestPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();


    const sentEmail = ()=>{
      

      console.log("Email have send");
      navigate("/resetpasswordDone")
  
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
          <h1 id="heroText">Reset Password Here!</h1>
            <div id="loginSec">
              <h1 id="secText">Email</h1>
            </div>

            <div className="input-box">
                <input 

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sentEmail();
                  }
                }}
                
                type="email" placeholder="example@gmail.com"/>
                <span className="icon"><img src="./assest/login/person-svgrepo-com 1.svg" alt="" /></span>
            </div>
            
            <button onClick={sentEmail} id="sendEmailButton">SEND EMAIL</button>

        </main>

    </div>
  );
}

export default RestPassword;