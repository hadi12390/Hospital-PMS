import styles from "../MakeAppointment.module.css";
import Check from "./icons/check.svg?react";
import Home from "./icons/home.svg?react";


function AppointmentSent({ appointment, onBackHome }) {

    const { doctor, date, appointmentType, timeSlot } = appointment;

    return (
        <div className={styles.sentChoice}>

            <h1 className={styles.sentTitle}>
                Appointment sent
            </h1>


            <div className={styles.sentCard}>

                <h2>
                    Your Appointment have been sent
                </h2>

                <div className={styles.sentDetails}>

                    <p className={styles.sentBold}>
                        {doctor?.name}
                    </p>

                    <p className={styles.sentBold}>
                        {appointmentType === "routinecheckup" ? "Routine Checkup" : "I'm Not Feeling Well"}
                    </p>

                    <div className={styles.sentDateRow}>
                        <p className={styles.sentBold}>
                            {date?.day}
                        </p>
                        {timeSlot && (
                            <p className={styles.sentBold}>
                                {timeSlot.time}
                            </p>
                        )}
                    </div>

                </div>


                <div className={styles.sentCheck}>
                    <Check />
                </div>

            </div>


            <button
                type="button"
                onClick={onBackHome}
                className={styles.backHomeBtn}
            >
                Back to Home
                <div className={styles.innerNB}><Home/></div>
            </button>

        </div>
    );
}

export default AppointmentSent;