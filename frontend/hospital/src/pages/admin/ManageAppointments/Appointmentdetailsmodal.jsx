import styles from "./AppointmentDetailsModal.module.css";
import tableStyles from "./DoctorsTable.module.css";
import { formatDisplayDate } from "./DateHelper/dateUtils";
import { createPortal } from "react-dom";

import SchM from "./svg/schM.svg?react";
import TimeM from "./svg/timeM.svg?react";
import PersonM from "./svg/personM.svg?react";
import PhoneM from "./svg/phoneM.svg?react";
import CancleM from "./svg/cancleM.svg?react";
import Approved from "./svg/approved.svg?react";

import Edit from "./svg/edit.svg?react";


// NOTE: swap this for your own pencil/edit asset if you have one
// (e.g. `import EditM from "../../../../../../assets/manager/editM.svg?react"`)
// I've kept it icon-free for now so this drops in without a missing-file error.

function AppointmentDetailsModal({ appointment, onClose, onEdit, onCancel }) {
  if (!appointment) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal}`}>
        <h2 className={styles.title}>Appointment Details</h2>

        <div className={`${styles.statusBadge} ${styles.glass}`}>
          <span className={styles.statusDot}></span>
          {appointment.status}
        </div>
        <div className={styles.contCard}>
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <TimeM className={styles.icon} />
            <span>{appointment.time}</span>
          </div>
          <div className={styles.metaItem}>
            <SchM className={styles.icon} />
            <span>{formatDisplayDate(appointment.date)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>Patient:</p>
          <div className={styles.sectionRow}>
            <PersonM className={styles.icon} />
            <span>{appointment.patient}</span>
          </div>
          <div className={styles.sectionRow}>
            <PhoneM className={styles.icon} />
            <span>{appointment.patientPhone}</span>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>Doctor:</p>
          <div className={styles.sectionRow}>
            <PersonM className={styles.icon} />
            <span>{appointment.doctor}</span>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>Appointment Type:</p>
          <div className={styles.sectionRow}>
            <SchM className={styles.icon} />
            <span>{appointment.type}</span>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>Note:</p>
          <p className={styles.noteText}>
            {appointment.note ? appointment.note : "There is no note"}
          </p>
        </div>
        </div>


        <div className={styles.actionsRow}>
          <button
            className={`${styles.cancelBtn} ${styles.glass}`}
            onClick={() => onCancel(appointment.id)}
          >
            <CancleM className={styles.icon} />
            Cancel Appointment
          </button>

          <button
            className={`${styles.doneBtn} ${styles.glass}`}
            onClick={() => onEdit(appointment)}
          >
            <Edit className={styles.icon} />
            Edit
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AppointmentDetailsModal;