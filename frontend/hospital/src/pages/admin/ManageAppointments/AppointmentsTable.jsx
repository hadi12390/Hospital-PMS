import styles from "./DoctorsTable.module.css";
import { useState, useEffect } from "react";

import Search from "./svg/search.svg?react";
import ArrowDown from "./svg/arrowdown.svg?react";
import Dot from "./svg/dot.svg?react";
import Approved from "./svg/approved.svg?react";
import Clock from "./svg/clock.svg?react";
import Calendar from "./svg/calendar.svg?react";

import { fetchServerDate, toISODate, formatDisplayDate } from "./DateHelper/dateUtils";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import EditAppointmentModal from "./EditAppointmentModal";

const statusOptions = ["Completed", "Confirmed", "Pending"];
const typeOptions = ["Consultation", "Follow Up", "Check Up", "Surgery"];

const initialAppointments = [
  { id: 1, date: "2026-08-05", time: "9:00AM", patient: "Mia Quien", patientPhone: "+962 79 120 0976", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Completed", note: "" },
  { id: 2, date: "2026-08-06", time: "10:00AM", patient: "Adam Smith", patientPhone: "+962 79 555 1122", doctor: "Dr.Jessica Smeeth", type: "Follow Up", status: "Completed", note: "" },
  { id: 3, date: "2026-08-07", time: "11:30AM", patient: "Lara Johnson", patientPhone: "+962 78 333 4455", doctor: "Dr.Jessica Smeeth", type: "Check Up", status: "Completed", note: "" },
  { id: 4, date: "2026-08-08", time: "2:00PM", patient: "Omar Khalil", patientPhone: "+962 77 111 2233", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Completed", note: "" },
  { id: 5, date: "2026-08-09", time: "9:30AM", patient: "Sara Ahmad", patientPhone: "+962 79 222 3344", doctor: "Dr.Jessica Smeeth", type: "Follow Up", status: "Completed", note: "" },
  { id: 6, date: "2026-08-10", time: "10:30AM", patient: "Daniel Brown", patientPhone: "+962 78 444 5566", doctor: "Dr.Jessica Smeeth", type: "Check Up", status: "Completed", note: "" },
  { id: 7, date: "2026-08-11", time: "1:00PM", patient: "Lina Adel", patientPhone: "+962 77 666 7788", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Completed", note: "" },
  { id: 8, date: "2026-08-12", time: "3:00PM", patient: "Noah Wilson", patientPhone: "+962 79 888 9900", doctor: "Dr.Jessica Smeeth", type: "Follow Up", status: "Completed", note: "" },
  { id: 9, date: "2026-08-13", time: "9:00AM", patient: "John Doe", patientPhone: "+962 78 123 4567", doctor: "Dr.Jessica Smeeth", type: "Check Up", status: "Completed", note: "" },
  { id: 10, date: "2026-08-14", time: "10:00AM", patient: "Emily Davis", patientPhone: "+962 77 234 5678", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Completed", note: "" },
  { id: 11, date: "2026-08-15", time: "11:30AM", patient: "Yousef Hassan", patientPhone: "+962 79 345 6789", doctor: "Dr.Jessica Smeeth", type: "Follow Up", status: "Completed", note: "" },
  { id: 12, date: "2026-08-16", time: "2:00PM", patient: "Sophia Miller", patientPhone: "+962 78 456 7890", doctor: "Dr.Jessica Smeeth", type: "Check Up", status: "Completed", note: "" },
  { id: 13, date: "2026-08-17", time: "9:30AM", patient: "Rania Omar", patientPhone: "+962 77 567 8901", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Completed", note: "" },

  { id: 14, date: "2026-08-18", time: "9:00AM", patient: "Michael Taylor", patientPhone: "+962 79 678 9012", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Completed", note: "" },
  { id: 15, date: "2026-08-18", time: "10:00AM", patient: "Nour Saleh", patientPhone: "+962 78 789 0123", doctor: "Dr.Jessica Smeeth", type: "Follow Up", status: "Confirmed", note: "" },
  { id: 16, date: "2026-08-18", time: "11:00AM", patient: "James Anderson", patientPhone: "+962 77 890 1234", doctor: "Dr.Jessica Smeeth", type: "Check Up", status: "Pending", note: "" },

  { id: 17, date: "2026-08-19", time: "9:00AM", patient: "Hala Mahmoud", patientPhone: "+962 79 901 2345", doctor: "Dr.Jessica Smeeth", type: "Consultation", status: "Confirmed", note: "" },
  { id: 18, date: "2026-08-19", time: "11:30AM", patient: "William Thomas", patientPhone: "+962 78 012 3456", doctor: "Dr.Jessica Smeeth", type: "Surgery", status: "Pending", note: "" },
  { id: 19, date: "2026-08-20", time: "9:00AM", patient: "Omar Ali", patientPhone: "+962 77 123 4567", doctor: "Dr.Jessica Smeeth", type: "Follow Up", status: "Confirmed", note: "" },
  { id: 20, date: "2026-08-20", time: "2:00PM", patient: "Maya Ibrahim", patientPhone: "+962 79 234 5678", doctor: "Dr.Jessica Smeeth", type: "Check Up", status: "Pending", note: "" },
];

function statusIcon(status) {
  if (status === "Completed") return <Approved className={styles.dotIcon} />;
  if (status === "Pending") return <Clock className={styles.dotIcon} />;
  return <Dot className={styles.dotIcon} />;
}

function AppointmentsTable() {
  const [selectedButton, setSelectedButton] = useState("Today");

  // Appointments now live in state so edits made in EditAppointmentModal
  // actually persist in the table. Swap this for a real fetch/save to your
  // backend whenever that's wired up.
  const [appointmentsData, setAppointmentsData] = useState(initialAppointments);

  const [searchText, setSearchText] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openDropdownDoctor, setOpenDropdownDoctor] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [selectedStatusType, setSelectedStatusType] = useState(null);
  const [openDropdownType, setOpenDropdownType] = useState(false);

  const [todayISO, setTodayISO] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingDate, setLoadingDate] = useState(true);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Derived from live data so new patients/doctors show up in the
  // filters and the edit form automatically.
  const doctorOptions = Array.from(new Set(appointmentsData.map((a) => a.doctor)));
  const patientOptions = Array.from(new Set(appointmentsData.map((a) => a.patient)));

  useEffect(() => {
    let isMounted = true;

    async function loadServerDate() {
      const serverDate = await fetchServerDate();
      const iso = toISODate(serverDate);

      if (isMounted) {
        setTodayISO(iso);
        setSelectedDate(iso);
        setLoadingDate(false);
      }
    }

    loadServerDate();

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleDropdownDoctor() {
    setOpenDropdownDoctor((prev) => !prev);
    setOpenDropdown(false);
    setOpenDropdownType(false);
  }

  function toggleDropdown() {
    setOpenDropdown((prev) => !prev);
    setOpenDropdownType(false);
    setOpenDropdownDoctor(false);
  }

  function toggleDropdownType() {
    setOpenDropdownType((prev) => !prev);
    setOpenDropdown(false);
    setOpenDropdownDoctor(false);
  }

  function handleSelectDoctor(value) {
    setSelectedDoctor((prev) => (prev === value ? null : value));
    setOpenDropdownDoctor(false);
  }

  function handleSelectStatus(value) {
    setSelectedStatus((prev) => (prev === value ? null : value));
    setOpenDropdown(false);
  }

  function handleSelectType(value) {
    setSelectedStatusType((prev) => (prev === value ? null : value));
    setOpenDropdownType(false);
  }

  function handleTodayClick() {
    setSelectedDate(todayISO);
  }
  function handleAllClick() {
    setSelectedDate(null);
  }

  function handleDateChange(e) {
    const value = e.target.value;
    if (value) setSelectedDate(value);
    setShowDatePicker(false);
  }

  function handleRowClick(appt) {
    setSelectedAppointment(appt);
  }

  function closeModal() {
    setSelectedAppointment(null);
  }

  function handleCancelAppointment(id) {
    console.log("Cancel appointment", id);
    closeModal();
  }

  // Details modal -> Edit button
  function handleEditClick(appt) {
    setSelectedAppointment(null);
    setEditingAppointment(appt);
  }

  function closeEditModal() {
    setEditingAppointment(null);
  }

  function handleSaveEdit(updatedAppt) {
    setAppointmentsData((prev) =>
      prev.map((a) => (a.id === updatedAppt.id ? updatedAppt : a))
    );
    setEditingAppointment(null);
  }

  const filteredAppointments = appointmentsData.filter((appt) => {
    const matchesSearch = appt.patient
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesDoctor = selectedDoctor
      ? appt.doctor === selectedDoctor
      : true;

    const matchesStatus = selectedStatus
      ? appt.status === selectedStatus
      : true;

    const matchesType = selectedStatusType
      ? appt.type === selectedStatusType
      : true;

    const matchesDate = selectedDate
      ? appt.date === selectedDate
      : true;

    return (
      matchesSearch &&
      matchesDoctor &&
      matchesStatus &&
      matchesDate &&
      matchesType
    );
  });

  if (loadingDate) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.emptyState}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Search + Filters */}
      <div className={styles.filtersRow}>
        <div className={`${styles.searchBox} ${styles.glass}`}>
          <Search className={styles.icon} />
          <input
            type="text"
            placeholder="Search Patient..."
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Doctor Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={toggleDropdownDoctor}
          >
            {selectedDoctor || "Doctor"}

            <ArrowDown
              className={`${styles.icon} ${
                openDropdownDoctor ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdownDoctor && (
            <div className={`${styles.dropdownMenu} ${styles.glass}`}>
              {doctorOptions.map((option) => (
                <button
                  key={option}
                  className={`${styles.dropdownItem} ${
                    selectedDoctor === option ? styles.dropdownItemActive : ""
                  }`}
                  onClick={() => handleSelectDoctor(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={toggleDropdownType}
          >
            {selectedStatusType || "Type"}

            <ArrowDown
              className={`${styles.icon} ${
                openDropdownType ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdownType && (
            <div className={`${styles.dropdownMenu} ${styles.glass}`}>
              {typeOptions.map((option) => (
                <button
                  key={option}
                  className={`${styles.dropdownItem} ${
                    selectedStatusType === option
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={() => handleSelectType(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={toggleDropdown}
          >
            {selectedStatus || "Status"}

            <ArrowDown
              className={`${styles.icon} ${
                openDropdown ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdown && (
            <div className={`${styles.dropdownMenu} ${styles.glass}`}>
              {statusOptions.map((option) => (
                <button
                  key={option}
                  className={`${styles.dropdownItem} ${
                    selectedStatus === option
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={() => handleSelectStatus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Today Button */}
        <button
          className={`${styles.todayBtn} ${styles.glass} ${
            selectedButton === "Today" ? styles.selectedBtn : ""
          }`}
          onClick={() => {
            handleTodayClick();
            setSelectedButton("Today");
          }}
        >
          {selectedDate === null
            ? "Today"
            : selectedDate === todayISO
            ? "Today"
            : formatDisplayDate(selectedDate)}
        </button>

        <button
          className={`${styles.todayBtn} ${styles.glass} ${
            selectedButton === "All" ? styles.selectedBtn : ""
          }`}
          onClick={() => {
            handleAllClick();
            setSelectedButton("All");
          }}
        >
          All
        </button>

        {/* Calendar Icon Button */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.calendarBtn} ${styles.glass}`}
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            <Calendar className={styles.icon} />
          </button>

          {showDatePicker && (
            <input
              type="date"
              className={styles.dateInput}
              value={selectedDate}
              onChange={handleDateChange}
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`${styles.tableCard} ${styles.glass}`}>
        <div className={styles.appointmentsHeader}>
          <div className={styles.colDate}>Date</div>
          <div className={styles.colPatient}>Patient</div>
          <div className={styles.colDoctorCell}>Doctor</div>
          <div className={styles.colType}>Appointment type</div>
          <div className={styles.colStatus}>Status</div>
        </div>

        <div className={styles.tableBody}>
          {filteredAppointments.length === 0 && (
            <p className={styles.emptyState}>
              {selectedDate
                ? `No appointments on ${formatDisplayDate(selectedDate)}`
                : "No appointments found"}
            </p>
          )}

          {filteredAppointments.map((appt) => (
            <button
              key={appt.id}
              className={`${styles.appointmentsRow} ${styles.glass}`}
              onClick={() => handleRowClick(appt)}
            >
              <div className={styles.colDate}>
                {formatDisplayDate(appt.date)}
              </div>
              <div className={styles.colPatient}>{appt.patient}</div>
              <div className={styles.colDoctorCell}>{appt.doctor}</div>
              <div className={styles.colType}>{appt.type}</div>

              <div className={styles.colStatus}>
                {statusIcon(appt.status)}
                {appt.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={closeModal}
          onEdit={handleEditClick}
          onCancel={handleCancelAppointment}
        />
      )}

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          patients={patientOptions}
          doctors={doctorOptions}
          types={typeOptions}
          onClose={closeEditModal}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default AppointmentsTable;