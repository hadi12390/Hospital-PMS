import { useState } from "react";

import styles from "../MakeAppointment.module.css";
import Next from "./icons/next.svg?react";


function DateChoice({
    doctor,
    onNext,
    onBack
}) {

    const [selectedDate, setSelectedDate] = useState(null);


    const dates = [
        {
            id: 1,
            day: "Monday",
            date: "17 August",
        },
        {
            id: 2,
            day: "Tuesday",
            date: "18 August",
        },
        {
            id: 3,
            day: "Wednesday",
            date: "19 August",
        },
        {
            id: 4,
            day: "Thursday",
            date: "20 August",
        },
        {
            id: 5,
            day: "Friday",
            date: "21 August",
        },
    ];


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
                        <strong>{doctor?.name}</strong>
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