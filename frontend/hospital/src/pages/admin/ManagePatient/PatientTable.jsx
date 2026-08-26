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

function formatDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function PatientTable({ patients }) {
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