import { useState } from "react";

import styles from "../MakeAppointment.module.css";

import AppointmentButton from "./AppointmentButton";

import Pill from "./icons/pill.svg?react";
import Star from "./icons/star.svg?react";
import Locwhite from "./icons/location.svg?react";
import TimePast from "./icons/time-past.svg?react";
import Next from "./icons/next.svg?react";


function DoctorChoice({ doctors, onNext }) {

    const [selectedDoctorId, setSelectedDoctorId] = useState(null);


    const selectedDoctor = doctors.find(
        (doctor) => doctor.id === selectedDoctorId
    );


    const handleNext = () => {

        if (!selectedDoctor) {
            return;
        }

        onNext(selectedDoctor);
    };


    return (
        <div className={styles.doctorChoice}>

            <div className={styles.cardsDCont}>

                {doctors.map((doctor) => (

                    <div
                        key={doctor.id}
                        className={`${styles.Dcards} ${
                            selectedDoctorId === doctor.id
                                ? styles.cardSelected
                                : ""
                        }`}
                    >

                        {/* IMAGE */}

                        <div className={styles.secOneBox}>

                            <div
                                className={`${styles.photoCont} ${styles.glass}`}
                            >
                                <img
                                    src={doctor.image}
                                    alt={doctor.name}
                                />
                            </div>

                        </div>


                        {/* INFORMATION */}

                        <div className={styles.infoANDb}>

                            <div className={styles.infoDEV}>

                                <h1 className={styles.heroCardInfo}>
                                    {doctor.name}
                                </h1>


                                <div className={styles.infoshehe}>

                                    <div className={styles.thingsCards}>
                                        <Pill />
                                        {doctor.specialty}
                                    </div>


                                    <div className={styles.thingsCards}>
                                        <Star />
                                        {doctor.rating} ({doctor.reviews} Reviews)
                                    </div>


                                    <div className={styles.thingsCards}>
                                        <Locwhite />
                                        {doctor.location}
                                    </div>


                                    <div
                                        className={`${styles.timeICON} ${styles.thingsCards}`}
                                    >
                                        <TimePast className={styles.upti} />
                                        {doctor.availability}
                                    </div>

                                </div>

                            </div>


                            {/* SELECT */}

                            <div className={styles.buttAddDiv}>

                                <AppointmentButton
                                    isSelected={
                                        selectedDoctorId === doctor.id
                                    }
                                    onSelect={() =>
                                        setSelectedDoctorId(doctor.id)
                                    }
                                />

                            </div>

                        </div>

                    </div>

                ))}

            </div>


            {/* NEXT */}
            <div className={styles.butConti}>
                <button
                    className={
                        selectedDoctor
                            ? styles.nextStep
                            : `${styles.nextStep} ${styles.nextStepC}`
                    }
                    disabled={!selectedDoctor}
                    onClick={handleNext}
                >
                    Next

                    <div className={styles.innerNB}><Next/></div>
                    
                </button>
            </div>

        </div>
    );
}

export default DoctorChoice;