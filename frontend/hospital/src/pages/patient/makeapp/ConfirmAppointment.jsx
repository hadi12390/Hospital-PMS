import styles from "../MakeAppointment.module.css";

import Pill from "./icons/pill.svg?react";
import Star from "./icons/star.svg?react";
import Locwhite from "./icons/location.svg?react";
import TimePast from "./icons/time-past.svg?react";
import Cam from "./icons/cam.svg?react";
import Per from "./icons/per.svg?react";
import Next from "./icons/next.svg?react";


function ConfirmAppointment({ appointment, onBack, onConfirm }) {

    const { doctor, date, appointmentType, reason, note, timeSlot } = appointment;


    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
    };


    return (
        <div className={styles.confirmChoice}>

            <div className={styles.herosecDC}>
                <h1>Confirm Appointment</h1>
                <p>Review your appointment details before confirming</p>
            </div>


            <div className={styles.confirmGrid}>

                {/* DOCTOR CARD */}
                <div className={`${styles.confirmCard} ${styles.confirmDoctorCard}`}>

                    <div className={styles.secOneBox}>
                        <div className={`${styles.photoCont} ${styles.glass}`}>
                            <img src={doctor?.image} alt={doctor?.name} />
                        </div>
                    </div>

                    <div className={styles.infoDEV}>

                        <h1 className={styles.heroCardInfo}>
                            {doctor?.name}
                        </h1>

                        <div className={styles.infoshehe}>

                            <div className={styles.thingsCards}>
                                <Pill />
                                {doctor?.specialty}
                            </div>

                            <div className={styles.thingsCards}>
                                <Star />
                                {doctor?.rating} ({doctor?.reviews} Reviews)
                            </div>

                            <div className={styles.thingsCards}>
                                <Locwhite />
                                {doctor?.location}
                            </div>

                            <div className={`${styles.timeICON} ${styles.thingsCards}`}>
                                <TimePast />
                                {doctor?.availability}
                            </div>

                        </div>

                    </div>

                </div>


                {/* TYPE CARD */}
                <div className={`${styles.confirmCard} ${styles.confirmTypeCard}`}>
                    <h3>
                        {appointmentType === "routinecheckup" ? "Routine Checkup" : "I'm Not Feeling Well"}
                    </h3>

                    {appointmentType === "routinecheckup"
                        ? <Cam className={styles.confirmTypeIcon} />
                        : <Per className={styles.confirmTypeIcon} />
                    }
                </div>


                {/* DATE CARD */}
                <div className={`${styles.confirmCard} ${styles.confirmDateCard}`}>
                    <h3>{date?.day}</h3>
                    <p className={styles.confirmDateSub}>{date?.date}</p>
                    {timeSlot && (
                        <p className={styles.confirmDateSub}>{timeSlot.time}</p>
                    )}
                </div>


                {/* REASON CARD */}
                <div className={`${styles.confirmCard} ${styles.confirmTextCard}`}>
                    <h3>Reason for Visit</h3>
                    <p>{reason}</p>
                </div>


                {/* NOTE CARD */}
                <div className={`${styles.confirmCard} ${styles.confirmTextCard}`}>
                    <h3>Note</h3>
                    <p>{note ? note : "No additional notes"}</p>
                </div>

            </div>


            {/* NAVIGATION */}
            <div className={styles.navigationButtons}>

                <button
                    type="button"
                    onClick={onBack}
                    className={styles.backStep}
                >
                    Back
                    <div className={`${styles.innerNB} ${styles.innerNBE}`}><Next/></div>
                </button>

                <button
                    type="button"
                    onClick={handleConfirm}
                    className={styles.nextStep}
                >
                    Confirm Appointment
                    <div className={styles.innerNB}><Next/></div>
                </button>

            </div>

        </div>
    );
}

export default ConfirmAppointment;