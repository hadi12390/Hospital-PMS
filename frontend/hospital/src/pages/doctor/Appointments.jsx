import styles from "./Dashboard.module.css";
import { useRef, useState, useEffect } from "react";
import Sidebar from "./sidebarD";

import patient1 from "./photos/patient1.png";

const defaultAvatar = patient1;

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

// ---------- API <-> UI mapping helpers ----------

// "consultation" -> "Consultation", "follow_up" -> "Follow Up"
function formatType(rawType) {
  if (!rawType) return "Consultation";
  return rawType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// "pending" -> "Pending"
function formatStatus(rawStatus) {
  if (!rawStatus) return "Pending";
  return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

// Maps one row of GET /doctor/appointments/ into the shape the table/modals use
function mapApiAppointment(apt) {
  const { firstName, lastName } = splitName(apt.patient?.name);
  const patientId =
    apt.patient?.public_id && !apt.patient.public_id.toLowerCase().includes("guest")
      ? apt.patient.public_id
      : null;

  return {
    id: apt.appointment_public_id,
    patient: {
      id: patientId,
      firstName,
      lastName,
      dateOfBirth: apt.patient?.birth_date || null,
      phone: apt.patient?.phone_number || null,
      bloodType: apt.patient?.blood_type || null,
      gender: apt.patient?.gender || null,
      photo: apt.patient?.profile_picture || defaultAvatar,
    },
    doctor: null,
    reason: apt.resone_for_visit || "—",
    type: formatType(apt.appointment_type),
    dateTime: apt.date,
    duration: "30 minutes",
    createdAt: apt.date,
    status: formatStatus(apt.status),
  };
}

function statusIcon(status) {
  if (status === "Completed") return <Approved className={styles.dotIcon} />;
  if (status === "Pending") return <Clock className={styles.dotIcon} />;
  return <Dot className={styles.dotIcon} />;
}

function AppointmentsTable() {
  const [selectedButton, setSelectedButton] = useState("Today");

  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openDropdownDoctor, setOpenDropdownDoctor] = useState(false);
  const [closingDoctor, setClosingDoctor] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [closingStatus, setClosingStatus] = useState(false);

  const [selectedStatusType, setSelectedStatusType] = useState(null);
  const [openDropdownType, setOpenDropdownType] = useState(false);
  const [closingType, setClosingType] = useState(false);

  const [todayISO, setTodayISO] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingDate, setLoadingDate] = useState(true);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const doctorOptions = Array.from(
    new Set(appointmentsData.map((a) => a.doctor).filter(Boolean))
  );
  const patientOptions = appointmentsData.map((a) => a.patient);

  // ---------- Fetch appointments from API ----------
  useEffect(() => {
    const controller = new AbortController();

    async function getData() {
      setLoadingAppointments(true);
      setAppointmentsError(null);
      try {
        const hostName = window.location.hostname;
        const response = await fetch(`http://${hostName}:8000/doctor/appointments/`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setAppointmentsData(data.map(mapApiAppointment));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setAppointmentsError(error.message || "Failed to load appointments.");
        }
      } finally {
        setLoadingAppointments(false);
      }
    }

    getData();
    return () => controller.abort();
  }, []);

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

  // ---------- Animated dropdown close helper ----------
  // Closes a dropdown after a short exit animation instead of unmounting instantly.
  function closeWithAnimation(setClosing, setOpen, duration = 140) {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, duration);
  }

  function toggleDropdownDoctor() {
    if (openDropdownDoctor) {
      closeWithAnimation(setClosingDoctor, setOpenDropdownDoctor);
    } else {
      setOpenDropdownDoctor(true);
      setOpenDropdown(false);
      setOpenDropdownType(false);
    }
  }

  function toggleDropdown() {
    if (openDropdown) {
      closeWithAnimation(setClosingStatus, setOpenDropdown);
    } else {
      setOpenDropdown(true);
      setOpenDropdownType(false);
      setOpenDropdownDoctor(false);
    }
  }

  function toggleDropdownType() {
    if (openDropdownType) {
      closeWithAnimation(setClosingType, setOpenDropdownType);
    } else {
      setOpenDropdownType(true);
      setOpenDropdown(false);
      setOpenDropdownDoctor(false);
    }
  }

  function handleSelectDoctor(value) {
    setSelectedDoctor((prev) => (prev === value ? null : value));
    closeWithAnimation(setClosingDoctor, setOpenDropdownDoctor);
  }

  function handleSelectStatus(value) {
    setSelectedStatus((prev) => (prev === value ? null : value));
    closeWithAnimation(setClosingStatus, setOpenDropdown);
  }

  function handleSelectType(value) {
    setSelectedStatusType((prev) => (prev === value ? null : value));
    closeWithAnimation(setClosingType, setOpenDropdownType);
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
  const matchesSearch = `${appt.patient.firstName} ${appt.patient.lastName}`
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
    ? appt.dateTime.split("T")[0] === selectedDate
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

        

        {/* Type Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={toggleDropdownType}
          >
            {selectedStatusType || "Type"}

            <ArrowDown
              className={`${styles.icon} ${
                openDropdownType && !closingType ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdownType && (
            <div
              className={`${styles.dropdownMenu} ${styles.glass} ${
                closingType ? styles.dropdownClosing : styles.dropdownOpening
              }`}
            >
              {typeOptions.map((option, i) => (
                <button
                  key={option}
                  style={{ "--i": i }}
                  className={`${styles.dropdownItem} ${styles.dropdownItemAnim} ${
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
                openDropdown && !closingStatus ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdown && (
            <div
              className={`${styles.dropdownMenu} ${styles.glass} ${
                closingStatus ? styles.dropdownClosing : styles.dropdownOpening
              }`}
            >
              {statusOptions.map((option, i) => (
                <button
                  key={option}
                  style={{ "--i": i }}
                  className={`${styles.dropdownItem} ${styles.dropdownItemAnim} ${
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
              className={`${styles.dateInput} ${styles.dropdownOpening}`}
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
          <div className={styles.colDoctorCell}>reason</div>
          <div className={styles.colType}>Appointment type</div>
          <div className={styles.colStatus}>Status</div>
        </div>

        <div className={styles.tableBody}>
          {loadingAppointments && (
            <p className={`${styles.emptyState} ${styles.fadeIn}`}>
              Loading appointments...
            </p>
          )}

          {!loadingAppointments && appointmentsError && (
            <p className={`${styles.emptyState} ${styles.fadeIn}`}>
              Couldn't load appointments: {appointmentsError}
            </p>
          )}

          {!loadingAppointments && !appointmentsError && filteredAppointments.length === 0 && (
            <p className={`${styles.emptyState} ${styles.fadeIn}`}>
              {selectedDate
                ? `No appointments on ${formatDisplayDate(selectedDate)}`
                : "No appointments found"}
            </p>
          )}

          {!loadingAppointments && !appointmentsError && filteredAppointments.map((appt, i) => (
            <button
              key={appt.id}
              style={{ "--i": i }}
              className={`${styles.appointmentsRow} ${styles.glass} ${styles.rowAnim}`}
              onClick={() => handleRowClick(appt)}
            >
              {/* Date */}
              <div className={styles.colDate}>
                {formatDisplayDate(appt.dateTime.split("T")[0])}
              </div>

              {/* Patient */}
              <div className={styles.colPatient}>
                {appt.patient.firstName} {appt.patient.lastName}
              </div>

              {/* Reason */}
              <div className={styles.colDoctorCell}>
                {appt.reason}
              </div>

              {/* Type */}
              <div className={styles.colType}>
                {appt.type}
              </div>

              {/* Status */}
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

function DoctorAppointments() {
  const [activeNav, setActiveNav] = useState("appointment");

  // ---------- Date helpers ----------
  function getCurrentDate() {
    const date = new Date();
    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  }

  function getFormattedDate() {
    const date = new Date();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const month = months[date.getMonth()];

    function getSuffix(day) {
      if (day > 3 && day < 21) return "th";

      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    return {
      dayName,
      dayNumber,
      suffix: getSuffix(dayNumber),
      month,
    };
  }

  function handleDateChange(e) {
    const value = e.target.value;

    if (!value) {
      setCurrentDate("");
      return;
    }

    const [year, month, day] = value.split("-");
    setCurrentDate(`${day} / ${month} / ${year}`);
  }

  // ---------- Time helpers ----------
  const START = 8;
  const END = 18;

  function timeToPercent(time) {
    const [hour, minute] = time.split(":").map(Number);
    const total = hour + minute / 60;

    return ((total - START) / (END - START)) * 100;
  }

  function getClockIcon(time) {
    const hour = Number(time.split(":")[0]);
    return `/assest/doctor/cards/clock/${hour.toString().padStart(2, "0")}.svg`;
  }

  function formatTime(time) {
    let [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
  }

  // ---------- State ----------
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [showMenu, setShowMenu] = useState(false);
  const dateInput = useRef();

  // ---------- Data ----------
  const today = getFormattedDate();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const appointments = [
    {
      id: 1,
      day: "Mon",
      patient: "MIA",
      type: "Surgery",
      start: "15:00",
      end: "18:00",
    },
    {
      id: 2,
      day: "Tue",
      patient: "John",
      type: "Checkup",
      start: "11:00",
      end: "12:00",
    },
    {
      id: 3,
      day: "Thu",
      patient: "Sara",
      type: "Consultation",
      start: "14:00",
      end: "16:00",
    },
    {
      id: 4,
      day: "Fri",
      patient: "GAZI",
      type: "Surgery",
      start: "12:00",
      end: "18:00",
    },
  ];

  const currentAppointment = appointments[0];

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const [stopped, setStopped] = useState(false);

  // ---------- Render ----------
  return (
    <div className={styles.DoctorDashboard}>
      <div className={styles.back}></div>

      {/* Sidebar */}
      <Sidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* Right Side */}
      <section className={styles.dashboardContent}>
        {/* Navbar */}
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            <button
              onMouseEnter={() => setStopped(true)}
              className={styles.pinding}>
              <img
               className={`${styles.icon} ${stopped ? styles.stopped : ""}`}
               
               width="10%" src="/assest/doctor/sidebar/notification-svgrepo-com.svg" alt="" />
               <div 
               className={`${styles.pindingNum} ${stopped ? styles.stoppedN : ""}`}>
                12
               </div>
               Pending Appointments 
               <img width="5%" src="/assest/doctor/cards/go-svgrepo-com 1.svg" alt="" />
            </button>
            <div className={styles.co}>
              <div className={styles.buttonAddAppoi}>
                <button>
                  <img src="/assest/doctor/cards/Add.svg" alt="Add" />
                  Appointment
                </button>
              </div>

              <img src="/assest/doctor/cards/LIne3.svg" alt="" />

              <div className={styles.profileSec}>
                <div className={styles.profilePic}>J</div>

                <button
                  className={styles.profBut}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <img src="/assest/doctor/cards/dropDown.svg" alt="Dropdown" />
                </button>

                {showMenu && (
                  <div className={styles.dropdownMenu}>
                    <button>
                      <img
                        width="40%"
                        src="/assest/doctor/cards/log-out.svg"
                        alt="a"
                      />
                      Logout
                    </button>
                  </div>
              )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.cards}>
          <div className={styles.heroname}>My Appointments</div>
          <AppointmentsTable/>
        </main>
      </section>
    </div>
  );
}

export default DoctorAppointments;