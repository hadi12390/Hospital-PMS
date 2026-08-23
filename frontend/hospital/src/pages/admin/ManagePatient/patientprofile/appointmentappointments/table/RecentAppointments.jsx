import styles from "./RecentAppointments.module.css";

const recentAppointments = [
  { id: 1, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 2, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 3, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 4, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 5, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 6, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 7, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 8, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
  { id: 9, date: "Aug 14", doctor: "Dr.Jessica", type: "Consultation", status: "Confirmed" },
];

function RecentAppointments() {
  return (
    <div className={`${styles.card} ${styles.glass}`}>
      <h2 className={styles.title}>Recent Appointments</h2>

      <div className={styles.list}>
        {recentAppointments.map((appt) => (
          <div key={appt.id} className={`${styles.row} ${styles.glass}`}>
            <div className={styles.colDate}>{appt.date}</div>
            <div className={styles.colDoctor}>{appt.doctor}</div>
            <div className={styles.colType}>{appt.type}</div>
            <div className={styles.colStatus}>{appt.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentAppointments;