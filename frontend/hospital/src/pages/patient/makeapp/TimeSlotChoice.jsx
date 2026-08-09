import { useState } from "react";

import styles from "../MakeAppointment.module.css";
import Next from "./icons/next.svg?react";


function TimeSlotChoice({
    doctor,
    date,
    onNext,
    onBack
}) {

    const [selectedSlot, setSelectedSlot] = useState(null);


    const timeSlots = [
        { id: 1, time: "9:00 AM" },
        { id: 2, time: "10:00 AM" },
        { id: 3, time: "11:00 AM" },
        { id: 4, time: "12:00 PM" },
        { id: 5, time: "1:00 PM" },
        { id: 6, time: "2:00 PM" },
        { id: 7, time: "3:00 PM" },
        { id: 8, time: "4:00 PM" },
    ];


    const handleNext = () => {

        if (!selectedSlot) {
            return;
        }

        onNext(selectedSlot);
    };


    return (
        <div className={styles.dateChoice}>
            <div>
                <div className={styles.herosecDC}>

                    <h1>
                        Choose a Time
                    </h1>

                    <p>
                        Choose a time slot for your appointment with{" "}
                        <strong>{doctor?.name}</strong> on{" "}
                        <strong>{date?.day}, {date?.date}</strong>
                    </p>
                </div>


                <div className={styles.datesContainer}>

                    {timeSlots.map((slot) => (

                        <button
                            key={slot.id}
                            className={
                                selectedSlot?.id === slot.id
                                    ? styles.dateSelected
                                    : styles.dateCard
                            }
                            onClick={() => setSelectedSlot(slot)}
                        >

                            <span>
                                {slot.time}
                            </span>

                        </button>

                    ))}

                </div>
            </div>


            <div className={styles.navigationButtons}>

                <button
                    onClick={onBack}
                    className={styles.backStep}
                >
                    Back
                    <div className={`${styles.innerNB} ${styles.innerNBE}`}><Next/></div>
                </button>

                <button
                    onClick={handleNext}
                    disabled={!selectedSlot}
                    className={
                        selectedSlot
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

export default TimeSlotChoice;