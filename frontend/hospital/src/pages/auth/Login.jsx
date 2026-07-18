import "./Login.css";


function Login() {
  return (
    <div>
        <div id="background-img">
            <img id="rightDNA" src="./assest/login/dna-svgrepo-com 1.svg" alt="" />
            <img id="rightTopDNA" src="./assest/login/dna-svgrepo-com 2.svg" alt="" />
            <img id="leftDNA" src="./assest/login/dna-svgrepo-com 4.svg" alt="" />
            <img id="bigBottom" src="./assest/login/dna-svgrepo-com 3.svg" alt="" />
        </div>

        <main>
          <img src="./assest/logo.svg" alt="Medix" />
          <h1 id="heroText">Wellcome Back!</h1>
            <div id="loginSec">
              <h1 id="secText">Email and Password</h1>
            </div>
        </main>

    </div>
  );
}

export default Login;