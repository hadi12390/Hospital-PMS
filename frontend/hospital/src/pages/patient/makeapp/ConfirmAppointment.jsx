import styles from "../MakeAppointment.module.css";

import Pill from "./icons/pill.svg?react";
import Locwhite from "./icons/location.svg?react";
import TimePast from "./icons/time-past.svg?react";
import Cam from "./icons/cam.svg?react";
import Per from "./icons/per.svg?react";
import Next from "./icons/next.svg?react";


const formatWorkTime = (timeStr) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};


function ConfirmAppointment({ appointment, onBack, onConfirm, submitting, submitError }) {

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
                            <img
                                src={doctor?.profile_picture || "/assest/patient/hadi.png"}
                                alt={`${doctor?.first_name} ${doctor?.last_name}`}
                            />
                        </div>
                    </div>

                    <div className={styles.infoDEV}>

                        <h1 className={styles.heroCardInfo}>
                            Dr. {doctor?.first_name} {doctor?.last_name}
                        </h1>

                        <div className={styles.infoshehe}>

                            <div className={styles.thingsCards}>
                                <Pill />
                                {doctor?.specialty}
                            </div>

                            <div className={styles.thingsCards}>
                                <Locwhite />
                                {doctor?.phone_number}
                            </div>

                            <div className={`${styles.timeICON} ${styles.thingsCards}`}>
                                <TimePast />
                                {formatWorkTime(doctor?.start_time)} - {formatWorkTime(doctor?.end_time)}
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
                        <p className={styles.confirmDateSub}>{timeSlot.display}</p>
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


            {submitError && (
                <p className={styles.confirmDateSub}>
                    Failed to confirm appointment: {submitError}
                </p>
            )}


            {/* NAVIGATION */}
            <div className={styles.navigationButtons}>

                <button
                    type="button"
                    onClick={onBack}
                    className={styles.backStep}
                    disabled={submitting}
                >
                    Back
                    <div className={`${styles.innerNB} ${styles.innerNBE}`}><Next/></div>
                </button>

                <button
                    type="button"
                    onClick={handleConfirm}
                    className={styles.nextStep}
                    disabled={submitting}
                >
                    {submitting ? "Confirming..." : "Confirm Appointment"}
                    <div className={styles.innerNB}><Next/></div>
                </button>

            </div>

        </div>
    );
}

export default ConfirmAppointment;