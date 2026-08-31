import { useState, useEffect } from "react";

import styles from "../MakeAppointment.module.css";
import Next from "./icons/next.svg?react";


const formatSlotTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });


function TimeSlotChoice({
    doctor,
    date,
    type,
    apiBase,
    onNext,
    onBack
}) {

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        if (!doctor?.public_id || !date?.isoDate || !type) {
            return;
        }

        const controller = new AbortController();

        setLoading(true);
        setError(null);
        setSelectedSlot(null);

        const url =
            `${apiBase}/appointment/available-times/?date=${date.isoDate}&doctor=${doctor.public_id}&type=${type}`;

        fetch(url, {
            credentials: "include",
            signal: controller.signal,
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load available times");
                return res.json();
            })
            .then((data) => setSlots(data))
            .catch((err) => {
                if (err.name !== "AbortError") setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();

    }, [doctor?.public_id, date?.isoDate, type, apiBase]);


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
                        <strong>Dr. {doctor?.first_name} {doctor?.last_name}</strong> on{" "}
                        <strong>{date?.day}, {date?.date}</strong>
                    </p>
                </div>


                {loading && <p>Loading available times...</p>}
                {error && <p>Failed to load available times: {error}</p>}
                {!loading && !error && slots.length === 0 && (
                    <p>No available times for this day.</p>
                )}

                {!loading && !error && slots.length > 0 && (

                    <div className={styles.datesContainer}>

                        {slots.map((slot) => (

                            <button
                                key={slot.time}
                                disabled={slot.conflict_with_patient}
                                className={
                                    selectedSlot?.time === slot.time
                                        ? styles.dateSelected
                                        : styles.dateCard
                                }
                                onClick={() =>
                                    setSelectedSlot({
                                        time: slot.time,
                                        display: formatSlotTime(slot.time),
                                    })
                                }
                            >

                                <span>
                                    {formatSlotTime(slot.time)}
                                    {slot.conflict_with_patient ? " (Booked)" : ""}
                                </span>

                            </button>

                        ))}

                    </div>

                )}
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