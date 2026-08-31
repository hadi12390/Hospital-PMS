import styles from "./AppointmentDetailsModal.module.css";
import { formatDisplayDate } from "./DateHelper/dateUtils";
import { createPortal } from "react-dom";
import { adaptAppointment } from "./appointmentAdapter";
import patient1 from "./photos/patient1.png";
import patient2 from "./photos/patient2.png";
import patient3 from "./photos/patient3.png";
import patient4 from "./photos/patient4.png";
import patient5 from "./photos/patient5.png";
import patient6 from "./photos/patient6.png";

const photoMap = {
  patient1,
  patient2,
  patient3,
  patient4,
  patient5,
  patient6,
};

import SchM from "./svg/schM.svg?react";
import TimeM from "./svg/timeM.svg?react";
import PersonM from "./svg/personM.svg?react";
import Phone from "./svg/phone.svg?react";
import Blood from "./svg/blood.svg?react";
import CancleM from "./svg/cancleM.svg?react";
import Approved from "./svg/approved.svg?react";
import Edit from "./svg/edit.svg?react";

function formatTime(dateTime) {
  const timePart = dateTime.split("T")[1];
  if (!timePart) return "";

  let [hour, minute] = timePart.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${String(minute).padStart(2, "0")}${period}`;
}

function AppointmentDetailsModal({ appointment, onClose, onEdit, onCancel }) {
  if (!appointment) return null;

  const { patient } = appointment;
  console.log(appointment)

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Appointments details</h2>

        {/* ---- Patient photo + info ---- */}
        <div className={styles.topRow}>
          <div className={`${styles.photoBox} ${styles.glass}`}>
            {patient.photo ? (
              <img className={styles.photo} src={patient.photo} alt={`${patient.firstName} ${patient.lastName}`} />
            ) : (
              <div className={styles.photoFallback}>
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </div>
            )}
          </div>

          <div className={`${styles.infoCard} ${styles.glass}`}>
            <p className={styles.nameLine}>
              First Name: <strong>{patient.firstName}</strong>
            </p>
            <p className={styles.nameLine}>
              Last Name: <strong>{patient.lastName}</strong>
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <SchM className={styles.icon} />
                <span>{formatDisplayDate(patient.dateOfBirth)}</span>
              </div>
              <div className={styles.infoItem}>
                <Blood className={styles.icon} />
                <span>{patient.bloodType}</span>
              </div>

              <div className={styles.infoItem}>
                <Phone className={styles.icon} />
                <span>{patient.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <PersonM className={styles.icon} />
                <span className={styles.strongText}>{patient.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Appointment details + notes ---- */}
        <div className={`${styles.detailsCard} ${styles.glass}`}>
          <div className={styles.detailsCol}>
            <p className={styles.detailLine}>
              <TimeM className={styles.icon} />
              Time: {formatTime(appointment.dateTime)}
            </p>
            <p className={styles.detailLine}>
              <SchM className={styles.icon} />
              Date: {formatDisplayDate(appointment.dateTime.split("T")[0])}
            </p>
            <p className={styles.detailLine}>
              Duration: {appointment.duration || "Default"}
            </p>
            <p className={styles.detailLine}>
              Reason for visit: {appointment.reason}
            </p>
            <p className={styles.detailLine}>
              Type: {appointment.type}
            </p>
            <div className={styles.detailLine}>
             {appointment.createdAt && (
                <p className={styles.detailLine}>
                  Created at: {formatDisplayDate(appointment.createdAt.split("T")[0])}
                </p>
              )}
            </div>
            <p className={styles.detailLine}>
              Status: {appointment.status}
            </p>
          </div>

          <div className={styles.notesCol}>
            <p className={styles.notesLabel}>Notes:</p>
            <div className={`${styles.notesBox} ${styles.glass}`}>
              {appointment.note ? (
                <p className={styles.noteText}>{appointment.note}</p>
              ) : (
                <p className={styles.noNoteText}>There is no Note...</p>
              )}
            </div>
          </div>
        </div>

        {/* ---- Actions ---- */}
        <div className={styles.actionsRow}>
          <button
            className={`${styles.editBtn} ${styles.glass}`}
            onClick={() => onEdit(appointment)}
          >
            <Edit className={styles.icon} />
            Edit
          </button>

          <button
            className={`${styles.doneBtn} ${styles.glass}`}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AppointmentDetailsModal;