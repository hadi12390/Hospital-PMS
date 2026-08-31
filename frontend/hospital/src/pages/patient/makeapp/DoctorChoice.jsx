import { useState } from "react";

import styles from "../MakeAppointment.module.css";

import AppointmentButton from "./AppointmentButton";

import Pill from "./icons/pill.svg?react";
import Locwhite from "./icons/location.svg?react";
import TimePast from "./icons/time-past.svg?react";
import Next from "./icons/next.svg?react";


const formatTime = (timeStr) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};


function DoctorChoice({ doctors, onNext }) {

    const [selectedDoctorId, setSelectedDoctorId] = useState(null);


    const selectedDoctor = doctors.find(
        (doctor) => doctor.public_id === selectedDoctorId
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

                {doctors.map((doctor) => {

                    const fullName = `${doctor.first_name} ${doctor.last_name}`;

                    return (

                        <div
                            key={doctor.public_id}
                            className={`${styles.Dcards} ${
                                selectedDoctorId === doctor.public_id
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
                                        src={doctor.profile_picture || "/assest/patient/hadi.png"}
                                        alt={fullName}
                                    />
                                </div>

                            </div>


                            {/* INFORMATION */}

                            <div className={styles.infoANDb}>

                                <div className={styles.infoDEV}>

                                    <h1 className={styles.heroCardInfo}>
                                        Dr. {fullName}
                                    </h1>


                                    <div className={styles.infoshehe}>

                                        <div className={styles.thingsCards}>
                                            <Pill />
                                            {doctor.specialty}
                                        </div>


                                        <div className={styles.thingsCards}>
                                            <Locwhite />
                                            {doctor.phone_number}
                                        </div>


                                        <div
                                            className={`${styles.timeICON} ${styles.thingsCards}`}
                                        >
                                            <TimePast className={styles.upti} />
                                            {formatTime(doctor.start_time)} - {formatTime(doctor.end_time)}
                                        </div>

                                    </div>

                                </div>


                                {/* SELECT */}

                                <div className={styles.buttAddDiv}>

                                    <AppointmentButton
                                        isSelected={
                                            selectedDoctorId === doctor.public_id
                                        }
                                        onSelect={() =>
                                            setSelectedDoctorId(doctor.public_id)
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    );

                })}

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