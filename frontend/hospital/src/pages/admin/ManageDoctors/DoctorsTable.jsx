import styles from "./DoctorsTable.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Search from "./svg/search.svg?react";
import Person from "./svg/person.svg?react";
import ArrowDown from "./svg/arrowdown.svg?react";
import Dot from "./svg/dot.svg?react";

const specialtyOptions = [
  "Software Engineering",
  "Network Engineering",
  "Cyber Security",
  "Data Science",
  "Dentist",
];

const statusOptions = ["Active", "Not Active"];

const doctors = [
  { id: 1, name: "Dr. Jessica", specialty: "Dentist", schedule: "09:00 - 18:00", status: "Active" },
  { id: 2, name: "Dr. Ahmad", specialty: "Software Engineering", schedule: "09:00 - 18:00", status: "Active" },
  { id: 3, name: "Dr. Lina", specialty: "Data Science", schedule: "10:00 - 18:00", status: "Not Active" },
  { id: 4, name: "Dr. Omar", specialty: "Cyber Security", schedule: "08:00 - 16:00", status: "Active" },
  { id: 5, name: "Dr. Sara", specialty: "Network Engineering", schedule: "09:00 - 17:00", status: "Not Active" },
  { id: 6, name: "Dr. Khaled", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 7, name: "Dr. Noor", specialty: "Dentist", schedule: "10:00 - 18:00", status: "Active" },
  { id: 8, name: "Dr. Yazan", specialty: "Cyber Security", schedule: "09:00 - 17:00", status: "Active" },
  { id: 9, name: "Dr. Rania", specialty: "Data Science", schedule: "08:00 - 15:00", status: "Not Active" },
  { id: 10, name: "Dr. Tareq", specialty: "Network Engineering", schedule: "11:00 - 19:00", status: "Active" },

  { id: 11, name: "Dr. Hala", specialty: "Dentist", schedule: "09:00 - 18:00", status: "Active" },
  { id: 12, name: "Dr. Sami", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 13, name: "Dr. Dana", specialty: "Data Science", schedule: "09:00 - 17:00", status: "Not Active" },
  { id: 14, name: "Dr. Fadi", specialty: "Cyber Security", schedule: "10:00 - 18:00", status: "Active" },
  { id: 15, name: "Dr. Maya", specialty: "Network Engineering", schedule: "08:00 - 15:00", status: "Active" },
  { id: 16, name: "Dr. Zaid", specialty: "Software Engineering", schedule: "09:00 - 18:00", status: "Active" },
  { id: 17, name: "Dr. Reem", specialty: "Dentist", schedule: "10:00 - 19:00", status: "Not Active" },
  { id: 18, name: "Dr. Basel", specialty: "Network Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 19, name: "Dr. Aya", specialty: "Data Science", schedule: "09:00 - 17:00", status: "Active" },
  { id: 20, name: "Dr. Laith", specialty: "Cyber Security", schedule: "09:00 - 18:00", status: "Not Active" },

  { id: 21, name: "Dr. Farah", specialty: "Software Engineering", schedule: "10:00 - 18:00", status: "Active" },
  { id: 22, name: "Dr. Nasser", specialty: "Network Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 23, name: "Dr. Salma", specialty: "Dentist", schedule: "09:00 - 17:00", status: "Active" },
  { id: 24, name: "Dr. Ibrahim", specialty: "Cyber Security", schedule: "24 Hours", status: "Active" },
  { id: 25, name: "Dr. Leen", specialty: "Data Science", schedule: "09:00 - 18:00", status: "Not Active" },
  { id: 26, name: "Dr. Adam", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 27, name: "Dr. Mariam", specialty: "Dentist", schedule: "10:00 - 19:00", status: "Active" },
  { id: 28, name: "Dr. Hamza", specialty: "Cyber Security", schedule: "09:00 - 17:00", status: "Not Active" },
  { id: 29, name: "Dr. Yasmeen", specialty: "Data Science", schedule: "08:00 - 15:00", status: "Active" },
  { id: 30, name: "Dr. Wael", specialty: "Network Engineering", schedule: "09:00 - 18:00", status: "Active" },

  { id: 31, name: "Dr. Jana", specialty: "Dentist", schedule: "10:00 - 18:00", status: "Active" },
  { id: 32, name: "Dr. Murad", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Not Active" },
  { id: 33, name: "Dr. Tala", specialty: "Cyber Security", schedule: "09:00 - 17:00", status: "Active" },
  { id: 34, name: "Dr. Anas", specialty: "Data Science", schedule: "11:00 - 19:00", status: "Active" },
  { id: 35, name: "Dr. Rawan", specialty: "Network Engineering", schedule: "09:00 - 18:00", status: "Not Active" },
  { id: 36, name: "Dr. Mahmoud", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 37, name: "Dr. Dalia", specialty: "Dentist", schedule: "10:00 - 18:00", status: "Active" },
  { id: 38, name: "Dr. Saif", specialty: "Cyber Security", schedule: "09:00 - 17:00", status: "Not Active" },
  { id: 39, name: "Dr. Esraa", specialty: "Data Science", schedule: "08:00 - 16:00", status: "Active" },
  { id: 40, name: "Dr. Rami", specialty: "Network Engineering", schedule: "09:00 - 18:00", status: "Active" },

  { id: 41, name: "Dr. Malak", specialty: "Dentist", schedule: "10:00 - 18:00", status: "Active" },
  { id: 42, name: "Dr. Ayman", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Not Active" },
  { id: 43, name: "Dr. Nour", specialty: "Data Science", schedule: "09:00 - 17:00", status: "Active" },
  { id: 44, name: "Dr. Qasem", specialty: "Cyber Security", schedule: "09:00 - 18:00", status: "Active" },
  { id: 45, name: "Dr. Batool", specialty: "Network Engineering", schedule: "10:00 - 19:00", status: "Not Active" },
  { id: 46, name: "Dr. Yousef", specialty: "Software Engineering", schedule: "08:00 - 16:00", status: "Active" },
  { id: 47, name: "Dr. Sawsan", specialty: "Dentist", schedule: "09:00 - 17:00", status: "Active" },
  { id: 48, name: "Dr. Iyad", specialty: "Cyber Security", schedule: "24 Hours", status: "Active" },
  { id: 49, name: "Dr. Haneen", specialty: "Data Science", schedule: "10:00 - 18:00", status: "Not Active" },
  { id: 50, name: "Dr. Majd", specialty: "Network Engineering", schedule: "09:00 - 18:00", status: "Active" },
];

function DoctorsTable() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null); // "specialty" | "status" | null

  function handleDoctorClick(doctorId) {
    navigate("/admin/manage&doctors/doctor&profile", { state: { doctorId } });
  }

  function toggleDropdown(name) {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  function handleSelectSpecialty(value) {
    setSelectedSpecialty((prev) => (prev === value ? null : value));
    setOpenDropdown(null);
  }

  function handleSelectStatus(value) {
    setSelectedStatus((prev) => (prev === value ? null : value));
    setOpenDropdown(null);
  }

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesSpecialty = selectedSpecialty
      ? doc.specialty === selectedSpecialty
      : true;

    const matchesStatus = selectedStatus
      ? doc.status === selectedStatus
      : true;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  return (
    <div className={styles.wrapper}>
      {/* Search + Filters */}
      <div className={styles.filtersRow}>
        <div className={`${styles.searchBox} ${styles.glass}`}>
          <Search className={styles.icon} />
          <input
            type="text"
            placeholder="Search doctor..."
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Specialty Dropdown */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.filterBtn} ${styles.glass}`}
            onClick={() => toggleDropdown("specialty")}
          >
            {selectedSpecialty || "Specialty"}
            <ArrowDown
              className={`${styles.icon} ${
                openDropdown === "specialty" ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdown === "specialty" && (
            <div className={`${styles.dropdownMenu} ${styles.glass}`}>
              {specialtyOptions.map((option) => (
                <button
                  key={option}
                  className={`${styles.dropdownItem} ${
                    selectedSpecialty === option ? styles.dropdownItemActive : ""
                  }`}
                  onClick={() => handleSelectSpecialty(option)}
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
            onClick={() => toggleDropdown("status")}
          >
            {selectedStatus || "Status"}
            <ArrowDown
              className={`${styles.icon} ${
                openDropdown === "status" ? styles.iconOpen : ""
              }`}
            />
          </button>

          {openDropdown === "status" && (
            <div className={`${styles.dropdownMenu} ${styles.glass}`}>
              {statusOptions.map((option) => (
                <button
                  key={option}
                  className={`${styles.dropdownItem} ${
                    selectedStatus === option ? styles.dropdownItemActive : ""
                  }`}
                  onClick={() => handleSelectStatus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`${styles.tableCard} ${styles.glass}`}>
        <div className={styles.tableHeader}>
          <div className={styles.colDoctor}>Doctor</div>
          <div className={styles.colSpecialty}>Specialty</div>
          <div className={styles.colSchedule}>Today's Schedule</div>
          <div className={styles.colStatus}>Status</div>
        </div>

        <div className={styles.tableBody}>
          {filteredDoctors.length === 0 && (
            <p className={styles.emptyState}>No doctors found</p>
          )}

          {filteredDoctors.map((doc) => (
            <button
              key={doc.id}
              className={`${styles.row} ${styles.glass}`}
              onClick={() => handleDoctorClick(doc.id)}
            >
              <div className={styles.colDoctor}>
                <div className={styles.avatar}>
                  <Person className={styles.personIcon} />
                </div>
                <span>{doc.name}</span>
              </div>

              <div className={styles.colSpecialty}>{doc.specialty}</div>
              <div className={styles.colSchedule}>{doc.schedule}</div>

              <div className={styles.colStatus}>
                <Dot className={styles.dotIcon} />
                {doc.status}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DoctorsTable;