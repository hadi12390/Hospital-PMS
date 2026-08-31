import { useState, useMemo } from "react";

import styles from "../MakeAppointment.module.css";
import Next from "./icons/next.svg?react";


const buildDates = () => {

    const today = new Date();

    return Array.from({ length: 8 }).map((_, i) => {

        const d = new Date(today);
        d.setDate(today.getDate() + i);

        const isoDate =
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        return {
            id: i,
            day: d.toLocaleDateString("en-US", { weekday: "long" }),
            date: d.toLocaleDateString("en-US", { day: "2-digit", month: "long" }),
            isoDate,
        };
    });
};


function DateChoice({
    doctor,
    onNext,
    onBack
}) {

    const [selectedDate, setSelectedDate] = useState(null);

    const dates = useMemo(() => buildDates(), []);


    const handleNext = () => {

        if (!selectedDate) {
            return;
        }

        onNext(selectedDate);
    };


    return (
        <div className={styles.dateChoice}>
            <div>
                <div className={styles.herosecDC}>

                    <h1>
                        Choose a Date
                    </h1>

                    <p>
                        Choose a date for your appointment with{" "}
                        <strong>Dr. {doctor?.first_name} {doctor?.last_name}</strong>
                    </p>
                </div>


                <div className={styles.datesContainer}>

                    {dates.map((item) => (

                        <button
                            key={item.id}
                            className={
                                selectedDate?.id === item.id
                                    ? styles.dateSelected
                                    : styles.dateCard
                            }
                            onClick={() => setSelectedDate(item)}
                        >

                            <span>
                                {item.day}
                            </span>

                            <strong>
                                {item.date}
                            </strong>

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
                    disabled={!selectedDate}
                    className={
                        selectedDate
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

export default DateChoice;