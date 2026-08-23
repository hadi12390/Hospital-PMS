import styles from "./DoctorsTable.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Search from "./svg/search.svg?react";
import Person from "./svg/person.svg?react";
import ArrowDown from "./svg/arrowdown.svg?react";
import Dot from "./svg/dot.svg?react";
import Calendar from "./svg/calender.svg?react";

const ageOptions = [
  { label: "0 - 18", min: 0, max: 18 },
  { label: "19 - 35", min: 19, max: 35 },
  { label: "36 - 50", min: 36, max: 50 },
  { label: "51+", min: 51, max: 200 },
];

const patients = [
  { id: 1, name: "Mia Quien", phone: "0791200976", lastVisit: "2026-08-10", age: 24 },
  { id: 2, name: "Adam Smith", phone: "0785551122", lastVisit: "2026-08-11", age: 45 },
  { id: 3, name: "Lara Johnson", phone: "0783334455", lastVisit: "2026-08-12", age: 12 },
  { id: 4, name: "Omar Khalil", phone: "0771112233", lastVisit: "2026-08-13", age: 60 },
  { id: 5, name: "Sara Ahmad", phone: "0792223344", lastVisit: "2026-08-14", age: 29 },
  { id: 6, name: "Daniel Brown", phone: "0784445566", lastVisit: "2026-08-15", age: 8 },
  { id: 7, name: "Lina Adel", phone: "0776667788", lastVisit: "2026-08-16", age: 33 },
  { id: 8, name: "Noah Wilson", phone: "0798889900", lastVisit: "2026-08-17", age: 52 },
  { id: 9, name: "John Doe", phone: "0781234567", lastVisit: "2026-08-05", age: 40 },
  { id: 10, name: "Emily Davis", phone: "0772345678", lastVisit: "2026-08-06", age: 19 },
  { id: 11, name: "Yousef Hassan", phone: "0793456789", lastVisit: "2026-08-07", age: 15 },
  { id: 12, name: "Sophia Miller", phone: "0784567890", lastVisit: "2026-08-08", age: 55 },
  { id: 13, name: "Rania Omar", phone: "0775678901", lastVisit: "2026-08-09", age: 27 },
  { id: 14, name: "Michael Taylor", phone: "0796789012", lastVisit: "2026-08-01", age: 38 },
  { id: 15, name: "Nour Saleh", phone: "0787890123", lastVisit: "2026-08-02", age: 22 },
];

function formatDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function PatientTable() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");

  const [selectedAgeRange, setSelectedAgeRange] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [selectedDate, setSelectedDate] = useState(""); // "" = بدون فلتر تاريخ
  const [showDatePicker, setShowDatePicker] = useState(false);

  function handlePatientClick(patientId) {
    navigate("/admin/manage&patients/patient&profile", { state: { patientId } });
  }

  function toggleDropdown() {
    setOpenDropdown((prev) => !prev);
  }

  function handleSelectAge(range) {
    setSelectedAgeRange((prev) => (prev?.label === range.label ? null : range));
    setOpenDropdown(false);
  }

  function handleDateChange(e) {
    setSelectedDate(e.target.value); 
  }

  function handleClearDate() {
    setSelectedDate("");
    setShowDatePicker(false);
  }

  function handleClearFilters() {
    setSearchText("");
    setSelectedAgeRange(null);
    setSelectedDate("");
  }

  const filteredPatients = patients.filter((patient) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      patient.name.toLowerCase().includes(search) ||
      patient.phone.includes(searchText);

    const matchesAge = selectedAgeRange
      ? patient.age >= selectedAgeRange.min && patient.age <= selectedAgeRange.max
      : true;

    const matchesDate = selectedDate
      ? patient.lastVisit === selectedDate
      : true;

    return matchesSearch && matchesAge && matchesDate;
  });

  return (
    <div className={styles.wrapper}>
      {/* Search + Filters */}
      <div className={styles.filtersRow}>
        <div className={`${styles.searchBox} ${styles.glass}`}>
          <Search className={styles.icon} />
          <input
            type="text"
            placeholder="Search name or phone number..."
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Age Filter Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={toggleDropdown}
          >
            {selectedAgeRange ? selectedAgeRange.label : "Age"}
            <ArrowDown
              className={`${styles.icon} ${
                openDropdown ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdown && (
            <div className={`${styles.dropdownMenu} ${styles.glass}`}>
              {ageOptions.map((range) => (
                <button
                  key={range.label}
                  className={`${styles.dropdownItem} ${
                    selectedAgeRange?.label === range.label
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={() => handleSelectAge(range)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            {selectedDate ? formatDisplayDate(selectedDate) : "Visit Date"}
            <Calendar className={styles.icon} />
          </button>

          {showDatePicker && (
            <input
              type="date"
              className={`${styles.dateInput} ${styles.glass}`}
              value={selectedDate}
              onChange={handleDateChange}
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`${styles.tableCard} ${styles.glass}`}>
        <div className={styles.tableHeader}>
          <div className={styles.colDoctor}>Patient</div>
          <div className={styles.colSpecialty}>Phone</div>
          <div className={styles.colSchedule}>Last Visit</div>
          <div className={styles.colStatus}>Age</div>
        </div>

        <div className={styles.tableBody}>
          {filteredPatients.length === 0 && (
            <p className={styles.emptyState}>No patients found</p>
          )}

          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              className={`${styles.row} ${styles.glass}`}
              onClick={() => handlePatientClick(patient.id)}
            >
              <div className={styles.colDoctor}>
                <div className={styles.avatar}>
                  <Person className={styles.personIcon} />
                </div>
                <span>{patient.name}</span>
              </div>

              <div className={styles.colSpecialty}>{patient.phone}</div>
              <div className={styles.colSchedule}>
                {formatDisplayDate(patient.lastVisit)}
              </div>

              <div className={styles.colStatus}>
                <Dot className={styles.dotIcon} />
                {patient.age}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientTable;