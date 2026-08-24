import styles from "./MakeAppointment.module.css";

import Pill from "./makeapp/icons/pill.svg?react";
import Star from "./makeapp/icons/star.svg?react";
import Location from "./makeapp/icons/location.svg?react";
import TimePast from "./makeapp/icons/time-past.svg?react";
function AppointmentButton({ isSelected, onSelect }) {
    const handleMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
    };

    return (
        <button
            className={`${styles.makeAppBut} ${styles.glass} ${isSelected ? styles.selected : ""}`}
            onMouseMove={handleMove}
            onClick={onSelect}
        >
            <span className={styles.shineLayer} />
            <div className={styles.thePLusIcon}>
                {isSelected ? <Seleted/> : <p className={styles.theanicon}>Select</p>}
            </div>
            
        </button>
    );
}

export default AppointmentButton;