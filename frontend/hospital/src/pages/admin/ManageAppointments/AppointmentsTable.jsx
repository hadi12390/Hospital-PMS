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


function statusIcon(status) {
  if (status === "Completed") return <Approved className={styles.dotIcon} />;
  if (status === "Pending") return <Clock className={styles.dotIcon} />;
  return <Dot className={styles.dotIcon} />;
}

function AppointmentsTable({ appointments = []  }) {
  const [selectedButton, setSelectedButton] = useState("Today");

  // Appointments now live in state so edits made in EditAppointmentModal
  // actually persist in the table. Swap this for a real fetch/save to your
  // backend whenever that's wired up.

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
  const doctorOptions = Array.from(
    new Set(appointments.map((a) => a.doctor))
  );

  const patientOptions = Array.from(
    new Set(appointments.map((a) => a.patient))
  );

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

  const filteredAppointments = appointments.filter((appt) => {
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