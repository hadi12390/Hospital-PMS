import styles from "./Doctor.module.css";
import Plusvec from "../../assets/patient/plusvec.svg?react";

function AppointmentButton() {
    const handleMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
    };

    return (
        <button
            className={`${styles.makeAppBut} ${styles.glass}`}
            onMouseMove={handleMove}
        >
            <span className={styles.shineLayer} />
            <div className={styles.thePLusIcon}><Plusvec/></div>
            <span className={styles.btnLabel}>Book Appointment</span>
        </button>
    );
}

export default AppointmentButton;