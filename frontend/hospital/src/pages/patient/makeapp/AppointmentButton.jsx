import styles from "./MakeAppointment.module.css";

import Selected from "./icons/selected.svg?react";

function AppointmentButton({ isSelected, onSelect }) {

    const handleMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        e.currentTarget.style.setProperty(
            "--x",
            `${e.clientX - rect.left}px`
        );

        e.currentTarget.style.setProperty(
            "--y",
            `${e.clientY - rect.top}px`
        );
    };

    return (
        <button
            className={`${styles.makeAppBut} ${styles.glass} ${
                isSelected ? styles.selected : ""
            }`}
            onMouseMove={handleMove}
            onClick={onSelect}
        >
            <span className={styles.shineLayer} />

            <div className={styles.thePLusIcon}>

                {isSelected ? (
                    <Selected />
                ) : (
                    <p className={styles.theanicon}>
                        Select
                    </p>
                )}

            </div>

        </button>
    );
}

export default AppointmentButton;