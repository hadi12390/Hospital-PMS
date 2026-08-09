import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MakeAppointment.module.css";

import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";
import Search from "../../assets/patient/search.svg?react";

import dashStyles from "./Doctor.module.css";
import { NavLink } from "react-router-dom";

import DoctorChoice from "./makeapp/DoctorChoice";
import DateChoice from "./makeapp/DateChoice";
import AppointmentDetails from "./makeapp/AppointmentDetails";
import TimeSlotChoice from "./makeapp/TimeSlotChoice";
import ConfirmAppointment from "./makeapp/ConfirmAppointment";
import AppointmentSent from "./makeapp/AppointmentSent";


function MakeAppointment() {

    const navigate = useNavigate();


    // ================================
    // SEARCH
    // ================================

    const [searchValue, setSearchValue] = useState("");


    // ================================
    // CURRENT STEP
    // ================================

    const [step, setStep] = useState(1);


    // ================================
    // APPOINTMENT DATA
    // ================================

    const [appointment, setAppointment] = useState({
        doctor: null,
        date: null,
        appointmentType: null,
        reason: "",
        note: "",
        timeSlot: null,
    });


    // ================================
    // TEMPORARY DOCTOR DATA
    // ================================

    const doctors = [
        {
            id: 1,
            name: "Dr. Hadi Al-Issa",
            image: "/assest/patient/hadi.png",
            specialty: "Cardiologist",
            rating: 4.9,
            reviews: 234,
            location: "Amman Medical Center",
            availability: "Available Today",
        },

        {
            id: 2,
            name: "Dr. Sarah Ahmad",
            image: "/assest/patient/hadi.png",
            specialty: "Dermatologist",
            rating: 4.8,
            reviews: 189,
            location: "Amman Medical Center",
            availability: "Available Today",
        },

        {
            id: 3,
            name: "Dr. Ahmad Khaled",
            image: "/assest/patient/hadi.png",
            specialty: "Neurologist",
            rating: 4.7,
            reviews: 156,
            location: "Amman Medical Center",
            availability: "Available Tomorrow",
        },

        {
            id: 4,
            name: "Dr. Lina Omar",
            image: "/assest/patient/hadi.png",
            specialty: "Pediatrician",
            rating: 4.9,
            reviews: 312,
            location: "Amman Medical Center",
            availability: "Available Today",
        },

        {
            id: 5,
            name: "Dr. James Wilson",
            image: "/assest/patient/hadi.png",
            specialty: "Orthopedic",
            rating: 4.8,
            reviews: 201,
            location: "Amman Medical Center",
            availability: "Available Tomorrow",
        },
    ];


    // ================================
    // STEP FUNCTIONS
    // ================================

    const nextStep = () => {
        setStep((prev) => Math.min(prev + 1, 6));
    };


    const previousStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };


    // ================================
    // STEP 1 - DOCTOR
    // ================================

    const handleDoctorNext = (doctor) => {

        setAppointment((prev) => ({
            ...prev,
            doctor: doctor,
        }));

        nextStep();
    };


    // ================================
    // STEP 2 - DATE
    // ================================

    const handleDateNext = (date) => {

        setAppointment((prev) => ({
            ...prev,
            date: date,
        }));

        nextStep();
    };


    // ================================
    // STEP 3 - DETAILS
    // ================================

    const handleDetailsNext = (details) => {

        setAppointment((prev) => ({
            ...prev,
            ...details,
        }));

        nextStep();
    };


    // ================================
    // STEP 4 - TIME SLOT
    // ================================

    const handleTimeSlotNext = (timeSlot) => {

        setAppointment((prev) => ({
            ...prev,
            timeSlot: timeSlot,
        }));

        nextStep();
    };


    return (
        <div className={dashStyles.PatientDashboard}>

            {/* ================================= */}
            {/* SIDEBAR */}
            {/* ================================= */}

            <aside className={dashStyles.sideBar}>

                <img
                    src="/assest/patient/logo.svg"
                    alt="Logo"
                />

                <div className={dashStyles.contSide}>

                    <div className={dashStyles.optionsContainer}>

                        <NavLink
                            to="/patient/home"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.homeLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <HomeLogo className={dashStyles.homelogoicon} />
                        </NavLink>


                        <NavLink
                            to="/patient/appointment"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.appLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <AppLogo className={dashStyles.applogoicon} />
                        </NavLink>


                        <NavLink
                            to="/patient/doctor"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.docLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <DocLogo className={dashStyles.doclogoicon} />
                        </NavLink>


                        <NavLink
                            to="/patient/medication"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.pillLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <PillLogo className={dashStyles.pilllogoicon} />
                        </NavLink>


                        <NavLink
                            to="/patient/report"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.docuLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <DocuLogo className={dashStyles.doculogoicon} />
                        </NavLink>

                    </div>


                    <div className={dashStyles.optionsContainer}>

                        <NavLink
                            to="/patient/help"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.helpLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <HelpLogo className={dashStyles.helplogoicon} />
                        </NavLink>


                        <NavLink
                            to="/patient/settings"
                            className={({ isActive }) =>
                                `${dashStyles.options}
                                ${dashStyles.settLogoButton}
                                ${isActive ? dashStyles.active : ""}`
                            }
                        >
                            <SettLogo className={dashStyles.settlogoicon} />
                        </NavLink>

                    </div>


                    <div className={dashStyles.logoutsec}>

                        <div className={dashStyles.optionsContainer}>

                            <button
                                className={`${dashStyles.options} ${dashStyles.logoutLogoButton}`}
                            >
                                <LogOutLogo
                                    className={dashStyles.logoutlogoicon}
                                />
                            </button>


                            <NavLink
                                to="/patient/account"
                                className={({ isActive }) =>
                                    `${dashStyles.options}
                                    ${dashStyles.settLogoButton}
                                    ${isActive ? dashStyles.active : ""}`
                                }
                            >
                                <SettLogo
                                    className={dashStyles.Asettlogoicon}
                                />
                            </NavLink>

                        </div>


                        <div className={dashStyles.profPicLogOut}>

                            <img
                                src="/assest/patient/pp.png"
                                alt="Profile"
                            />

                        </div>

                    </div>

                </div>

            </aside>


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <section className={dashStyles.dashboardContent}>


                {/* NAVBAR */}

                <nav className={dashStyles.nav}>

                    <div
                        className={`${dashStyles.navContentSearch} ${dashStyles.glass}`}
                    >

                        <div className={dashStyles.searchIcon}>
                            <Search size={18} />
                        </div>


                        Making Appointment

                    </div>


                    <div
                        className={`${dashStyles.navContent} ${dashStyles.glass}`}
                    >

                        <div className={dashStyles.profileSec}>

                            <div className={dashStyles.profilePic}>

                                <img
                                    className={dashStyles.navPP}
                                    src="/assest/patient/pp.png"
                                    alt="Profile"
                                />

                            </div>


                            <div className={dashStyles.nameNav}>

                                <p>
                                    Mia Quian
                                </p>

                            </div>

                        </div>

                    </div>

                </nav>


                {/* ================================= */}
                {/* APPOINTMENT */}
                {/* ================================= */}

                <main className={styles.MakeAppointment}>

                    <div className={styles.appointmentContent}>


                        {/* ================================= */}
                        {/* STEP INDICATOR */}
                        {/* ================================= */}

                        <div className={styles.stepIndicator}>


                            {/* STEP 1 */}

                            <div
                                className={`${styles.step} ${
                                    step >= 1
                                        ? styles.stepActive
                                        : ""
                                }`}
                            >
                                <span>1</span>
                                <p>Doctor</p>
                            </div>


                            <div
                                className={`${styles.line} ${
                                    step >= 2
                                        ? styles.lineActive
                                        : ""
                                }`}
                            />


                            {/* STEP 2 */}

                            <div
                                className={`${styles.step} ${
                                    step >= 2
                                        ? styles.stepActive
                                        : ""
                                }`}
                            >
                                <span>2</span>
                                <p>Date</p>
                            </div>


                            <div
                                className={`${styles.line} ${
                                    step >= 3
                                        ? styles.lineActive
                                        : ""
                                }`}
                            />


                            {/* STEP 3 */}

                            <div
                                className={`${styles.step} ${
                                    step >= 3
                                        ? styles.stepActive
                                        : ""
                                }`}
                            >
                                <span>3</span>
                                <p>Details</p>
                            </div>


                            <div
                                className={`${styles.line} ${
                                    step >= 4
                                        ? styles.lineActive
                                        : ""
                                }`}
                            />


                            {/* STEP 4 */}

                            <div
                                className={`${styles.step} ${
                                    step >= 4
                                        ? styles.stepActive
                                        : ""
                                }`}
                            >
                                <span>4</span>
                                <p>Time</p>
                            </div>


                            <div
                                className={`${styles.line} ${
                                    step >= 5
                                        ? styles.lineActive
                                        : ""
                                }`}
                            />


                            {/* STEP 5 */}

                            <div
                                className={`${styles.step} ${
                                    step >= 5
                                        ? styles.stepActive
                                        : ""
                                }`}
                            >
                                <span>5</span>
                                <p>Confirm</p>
                            </div>

                        </div>


                        {/* ================================= */}
                        {/* STEP CONTENT */}
                        {/* ================================= */}

                        <div className={styles.stepContent}>

                            <div key={step} className={styles.stepAnimate}>

                                {step === 1 && (
                                    <DoctorChoice
                                        doctors={doctors}
                                        onNext={handleDoctorNext}
                                    />
                                )}

                                {step === 2 && (
                                    <DateChoice
                                        doctor={appointment.doctor}
                                        onNext={handleDateNext}
                                        onBack={previousStep}
                                    />
                                )}

                                {step === 3 && (
                                    <AppointmentDetails
                                        doctor={appointment.doctor}
                                        date={appointment.date}
                                        onNext={handleDetailsNext}
                                        onBack={previousStep}
                                    />
                                )}

                                {step === 4 && (
                                    <TimeSlotChoice
                                        doctor={appointment.doctor}
                                        date={appointment.date}
                                        onNext={handleTimeSlotNext}
                                        onBack={previousStep}
                                    />
                                )}

                                {step === 5 && (
                                    <ConfirmAppointment
                                        appointment={appointment}
                                        onBack={previousStep}
                                        onConfirm={nextStep}
                                    />
                                )}

                                {step === 6 && (
                                    <AppointmentSent
                                        appointment={appointment}
                                        onBackHome={() => navigate("/patient/home")}
                                    />
                                )}

                            </div>

                        </div>

                    </div>

                </main>

            </section>

        </div>
    );
}

export default MakeAppointment;