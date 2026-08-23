import styles from "./NotFound.module.css"
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <img className={styles.heroLogo} src="/../assest/logo.svg" alt="Medix" />
        <h1 className={styles.error}>404</h1>
        <h2 className={styles.label}>Page Not Found</h2>
        <p className={styles.message}>The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/login")}>Back to Login page</button>
      </div>
    </div>
  );
}

export default NotFound;