import styles from "./n.module.css";
import { useState, useEffect } from "react";
import Logo from "../../assets/patient/logo.svg?react";
import { useNavigate, useParams } from "react-router-dom";

function Emailv() {
  const navigate = useNavigate();
  const { key } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!key) {
      setError("Invalid or missing verification link.");
      return;
    }

    const verifyEmail = async () => {
      setError("");
      setLoading(true);

      try {
        const cleanKey = key.replaceAll(" ", "").replaceAll("=", "");
        const hostname = window.location.hostname;

        const response = await fetch(
          `http://${hostname}:8000/dj-rest-auth/registration/verify-email/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: cleanKey,
            }),
          }
        );

        // read as text first so a non-JSON (HTML) response never crashes the app
        const raw = await response.text();

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error("Non-JSON response:", response.status, raw.slice(0, 500));
          throw new Error(
            `Server returned an unexpected response (status ${response.status}). Please try again later.`
          );
        }

        if (!response.ok) {
          throw new Error(data.detail || data.message || "Verification failed");
        }

        setVerified(true);
      } catch (err) {
        console.error("Email verification error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [key]);

  return (
    <div className={styles.loginpage}>
      <div className={styles.backgroundImg}>
        <img className={styles.rightDNA} src="./assest/login/dna-svgrepo-com 1.svg" alt="" />
        <img className={styles.rightTopDNA} src="./assest/login/dna-svgrepo-com 2.svg" alt="" />
        <img className={styles.leftDNA} src="./assest/login/dna-svgrepo-com 4.svg" alt="" />
        <img className={styles.bigBottom} src="./assest/login/dna-svgrepo-com 3.svg" alt="" />
      </div>

      <main className={styles.mainLog}>
        <Logo className={styles.heroLogo} />
        <p className={styles.heroTextA}>You're All Set!</p>
        <div className={styles.secTextA}>
          Your email has been successfully verified, and your account is now ready to use.
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          disabled={loading || !verified}
          onClick={() => navigate("/login")}
          className={styles.signUpButton}
        >
          {loading ? (
            <span className={styles.spinner} aria-label="Loading" />
          ) : (
            "Welcome to Medix!"
          )}
        </button>
      </main>
    </div>
  );
}

export default Emailv;