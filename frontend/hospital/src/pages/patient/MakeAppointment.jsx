import { useState, useEffect } from "react";
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
import NotificationLogo from "../../assets/patient/notification.svg?react";


// ================================
// API CONFIG
// ================================

const API_BASE = `http://${window.location.hostname}:8000`;

const mapAppointmentType = (type) =>
    type === "routinecheckup" ? "checkup" : "consultation";


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
    // DOCTORS (fetched)
    // ================================

    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [doctorsError, setDoctorsError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        setDoctorsLoading(true);
        setDoctorsError(null);

        fetch(`${API_BASE}/doctor/`, {
            credentials: "include",
            signal: controller.signal,
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load doctors");
                return res.json();
            })
            .then((data) => setDoctors(data))
            .catch((err) => {
                if (err.name !== "AbortError") setDoctorsError(err.message);
            })
            .finally(() => setDoctorsLoading(false));

        return () => controller.abort();
    }, []);


    // ================================
    // SUBMISSION STATE
    // ================================

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);


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

    // ================================
    // CSRF HELPER
    // ================================

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);

        if (parts.length === 2) {
            return parts.pop().split(";").shift();
        }

        return null;
    };


    // ================================
    // STEP 5 - CONFIRM (submit to API)
    // ================================

    const handleConfirm = async () => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch(`${API_BASE}/appointment/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({
                    doctor: appointment.doctor?.public_id ?? null,
                    scheduled_time: appointment.timeSlot?.time ?? null,
                    reason_for_visit: appointment.reason,
                    notes: appointment.note,
                    appointment_type: mapAppointmentType(
                        appointment.appointmentType
                    ),
                }),
            });

            // Get the response body first
            const data = await res.json();

            // Log everything from the backend
            console.log("Response status:", res.status);
            console.log("Response data:", data);

            console.log("doctor being sent:", appointment.doctor);


            if (!res.ok) {
                console.log("Full error response:", data);

                throw new Error(
                    data.detail ||
                    data.message ||
                    JSON.stringify(data)
                );

            }

            // Success
            nextStep();

        } catch (err) {
            console.error("Appointment error:", err);
            console.error("Error message:", err.message);

            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div className={dashStyles.PatientDashboard}>

            {/* ================================= */}
            {/* SIDEBAR */}
            {/* ================================= */}

            <aside className={styles.sideBar}>
            
                    {/* Logo */}
                    <div className={styles.sidebarLogo}>
                        <img
                            src="/assest/patient/logo.svg"
                            alt="Logo"
                        />
                    </div>
            
            
                    <div className={styles.contSide}>
            
                        {/* ================= MAIN MENU ================= */}
                        <div className={styles.optionsContainer}>
            
                            {/* Home */}
                            <NavLink
                                to="/patient/home"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.homeLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <HomeLogo className={styles.homelogoicon} />
                            </NavLink>
            
            
                            {/* Appointments */}
                            <NavLink
                                to="/patient/appointment"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.appLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <AppLogo className={styles.applogoicon} />
                            </NavLink>
            
            
                            {/* Doctors */}
                            <NavLink
                                to="/patient/doctor"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.docLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <DocLogo className={styles.doclogoicon} />
                            </NavLink>
            
            
                            {/* Reports */}
                            <NavLink
                                to="/patient/reports"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.pillLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <PillLogo className={styles.pilllogoicon} />
                            </NavLink>
            
            
                            {/* Payments */}
                            <NavLink
                                to="/patient/payment"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.docuLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <DocuLogo className={styles.doculogoicon} />
                            </NavLink>
            
                        </div>
            
            
                        {/* ================= SECOND MENU ================= */}
                        <div
                            className={`${styles.optionsContainer} ${styles.optionsContainerNN}`}
                        >
            
                            {/* Help */}
                            <NavLink
                                to="/patient/flag"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.helpLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <HelpLogo className={styles.helplogoicon} />
                            </NavLink>
            
            
                            {/* Settings */}
                            <NavLink
                                to="/patient/settings"
                                className={({ isActive }) =>
                                    `${styles.options} ${styles.settLogoButton} ${
                                        isActive ? styles.active : ""
                                    }`
                                }
                            >
                                <SettLogo className={styles.settlogoicon} />
                            </NavLink>
            
                        </div>
            
            
                        {/* ================= LOGOUT SECTION ================= */}
                        <div className={styles.logoutsec}>
            
                            <div className={`${styles.optionsContainer} ${styles.optionsContainerLL}`}>
            
                                {/* Logout */}
                                <button
                                    type="button"
                                    className={`${styles.options} ${styles.logoutLogoButton}`}
                                >
                                    <LogOutLogo
                                        className={styles.logoutlogoicon}
                                    />
                                </button>
            
            
                                {/* Notifications */}
                                <NavLink
                                    to="/patient/notifications"
                                    className={({ isActive }) =>
                                        `${styles.options} ${styles.notificationLogoButton} ${
                                            isActive ? styles.active : ""
                                        }`
                                    }
                                >
                                    <NotificationLogo
                                        className={styles.notificationlogoicon}
                                    />
                                </NavLink>
            
                            </div>
            
            
                            {/* Profile picture */}
                            <div className={styles.profPicLogOut}>
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
                                    doctorsLoading ? (
                                        <p>Loading doctors...</p>
                                    ) : doctorsError ? (
                                        <p>Failed to load doctors: {doctorsError}</p>
                                    ) : (
                                        <DoctorChoice
                                            doctors={doctors}
                                            onNext={handleDoctorNext}
                                        />
                                    )
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
                                        type={mapAppointmentType(appointment.appointmentType)}
                                        apiBase={API_BASE}
                                        onNext={handleTimeSlotNext}
                                        onBack={previousStep}
                                    />
                                )}

                                {step === 5 && (
                                    <ConfirmAppointment
                                        appointment={appointment}
                                        onBack={previousStep}
                                        onConfirm={handleConfirm}
                                        submitting={submitting}
                                        submitError={submitError}
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