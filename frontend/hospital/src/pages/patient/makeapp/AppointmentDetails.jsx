import { useState } from "react";

import styles from "../MakeAppointment.module.css";
import Cam from "./icons/cam.svg?react";
import Per from "./icons/per.svg?react";
import Next from "./icons/next.svg?react";


function AppointmentDetails({
    doctor,
    date,
    onNext,
    onBack
}) {
    const [appointmentType, setAppointmentType] = useState(null);
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isNoteFocused, setIsNoteFocused] = useState(false);

    const canContinue = appointmentType && reason.trim();

    const handleNext = () => {
        if (!canContinue) {
            return;
        }

        onNext({
            appointmentType,
            reason,
            note
        });
    };

    return (
        <div className={styles.timeChoice}>
            {/* APPOINTMENT TYPE */}

            <div className={styles.appointmentTypeSection}>

                <h2>
                    Appointment Type
                </h2>

                <div className={styles.appointmentTypes}>

                    <button
                        type="button"
                        className={`${styles.typeCard} ${
                            appointmentType === "routinecheckup"
                                ? styles.typeCardSelected
                                : ""
                        }`}
                        onClick={() =>
                            setAppointmentType("routinecheckup")
                        }
                    >

                        <div className={styles.typeIcon}>
                            <h3>
                                Routine Checkup
                            </h3>

                            <Cam/>

                        </div>

                    </button>


                    <button
                        type="button"
                        className={`${styles.typeCard} ${
                            appointmentType === "notfeelingwell"
                                ? styles.typeCardSelected
                                : ""
                        }`}
                        onClick={() =>
                            setAppointmentType("notfeelingwell")
                        }
                    >
                        <div className={styles.typeIcon}>
                            <h3>
                                I'm Not Feeling Well
                            </h3>

                            <Per/>

                        </div>

                    </button>

                </div>

            </div>


            {/* REASON */}

            <div className={styles.reasonSection}>

                <h2>
                    Reason for Visit
                </h2>

            <div className={styles.reasonWrapper}>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={styles.reasonInput}
                    rows={4}
                />
                {reason === "" && !isFocused && (
                    <span className={styles.fakePlaceholder}>
                        Tell your doctor why you are making this appointment...
                    </span>
                )}
            </div>

            </div>


            {/* NOTE */}

            <div className={styles.noteSection}>

                <h2>
                    Additional Note
                    (<span>Optional</span>)
                </h2>

                <div className={styles.noteWrapper}>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onFocus={() => setIsNoteFocused(true)}
                        onBlur={() => setIsNoteFocused(false)}
                        className={styles.noteInput}
                        rows={3}
                    />
                    {note === "" && !isNoteFocused && (
                        <span className={styles.fakePlaceholderNote}>
                            Add anything else you want your doctor to know...
                        </span>
                    )}
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
                onClick={handleNext}
                disabled={!canContinue}
                className={
                    canContinue
                        ? styles.nextStep
                        : `${styles.nextStep} ${styles.nextStepC}`
                }
            >
                Next
                <div className={styles.innerNB}><Next/></div>
            </button>

        </div>

        </div>
    );
}

export default AppointmentDetails;