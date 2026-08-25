import styles from "./DoctorsTable.module.css";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Search from "./svg/search.svg?react";
import Person from "./svg/person.svg?react";
import ArrowDown from "./svg/arrowdown.svg?react";
import Dot from "./svg/dot.svg?react";

const statusOptions = ["Active", "On Leave", "Not exist"];

function DoctorsTable({ doctors = [], loading = false }) {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // "specialty" | "status" | null

  // Build specialty options dynamically from the real data
  const specialtyOptions = useMemo(() => {
    const set = new Set();
    doctors.forEach((doc) => {
      if (doc?.specialty) set.add(doc.specialty);
    });
    return Array.from(set).sort();
  }, [doctors]);

  function formatSchedule(schedule) {
    if (!schedule || !schedule.start_time || !schedule.end_time) {
      return "—";
    }

    // API returns time as "HH:MM:SS" or "HH:MM"
    const format = (t) => {
      if (!t) return "";
      const [h, m] = t.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    };

    return `${format(schedule.start_time)} - ${format(schedule.end_time)}`;
  }

  function handleDoctorClick(publicId) {
    navigate("/admin/manage&doctors/doctor&profile", {
      state: { doctorId: publicId },
    });
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

  // Normalize + filter
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((item) => item && item.doctor) // guard against null summaries
      .filter((item) => {
        const name = item.doctor.name || "";
        const specialty = item.specialty || "";
        const status = item.status || "";

        const matchesSearch = name
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const matchesSpecialty = selectedSpecialty
          ? specialty === selectedSpecialty
          : true;

        const matchesStatus = selectedStatus
          ? status === selectedStatus
          : true;

        return matchesSearch && matchesSpecialty && matchesStatus;
      });
  }, [doctors, searchText, selectedSpecialty, selectedStatus]);

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
              {specialtyOptions.length === 0 && (
                <div className={styles.dropdownItem}>No specialties</div>
              )}
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
          {loading && (
            <p className={styles.emptyState}>Loading doctors…</p>
          )}

          {!loading && filteredDoctors.length === 0 && (
            <p className={styles.emptyState}>No doctors found</p>
          )}

          {!loading &&
            filteredDoctors.map((item) => {
              const doc = item.doctor;
              const publicId = doc.public_id;
              const name = doc.name || "—";
              const specialty = item.specialty || "—";
              const scheduleText = formatSchedule(item.schedule);
              const status = item.status || "—";

              return (
                <button
                  key={publicId}
                  className={`${styles.row} ${styles.glass}`}
                  onClick={() => handleDoctorClick(publicId)}
                >
                  <div className={styles.colDoctor}>
                    <div className={styles.avatar}>
                      <Person className={styles.personIcon} />
                    </div>
                    <span>{name}</span>
                  </div>

                  <div className={styles.colSpecialty}>{specialty}</div>
                  <div className={styles.colSchedule}>{scheduleText}</div>

                  <div className={styles.colStatus}>
                    <Dot className={styles.dotIcon} />
                    {status}
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default DoctorsTable;