import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./PatientProfileModal.module.css";
import tableStyles from "./Dashboard.module.css";

import Calendar from "./svg/calendar.svg?react";
import Blood from "./svg//blood.svg?react";
import Phone from "./svg/phone.svg?react";
import PersonM from "./svg//personC.svg?react";

/* ==========================================================================
   Tilt card — right-click + drag tilts the card toward the cursor,
   like a physical card catching light. Releases spring back to flat.
   ========================================================================== */

function useTilt() {
  const cardRef = useRef(null);
  const [tilting, setTilting] = useState(false);
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg)");
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  function handleContextMenu(e) {
    e.preventDefault(); // suppress the native right-click menu on this card
  }

  function handleMouseDown(e) {
    if (e.button !== 2) return; // right mouse button only
    e.preventDefault();
    setTilting(true);
  }

  function updateTilt(e) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0 -> 1 across the card
    const py = (e.clientY - rect.top) / rect.height;   // 0 -> 1 down the card

    const maxTilt = 14; // degrees
    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - py) * maxTilt * 2;

    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setGlow({ x: px * 100, y: py * 100 });
  }

  function handleMouseMove(e) {
    if (!tilting) return;
    updateTilt(e);
  }

  function releaseTilt() {
    if (!tilting) return;
    setTilting(false);
    setTransform("rotateX(0deg) rotateY(0deg)"); // CSS transition eases this back
  }

  useEffect(() => {
    if (!tilting) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", releaseTilt);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", releaseTilt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tilting]);

  return {
    cardRef,
    tilting,
    transform,
    glow,
    handleContextMenu,
    handleMouseDown,
  };
}

/* ==========================================================================
   PatientProfileModal
   ========================================================================== */

function PatientProfileModal({ patient, onClose }) {
  const { cardRef, tilting, transform, glow, handleContextMenu, handleMouseDown } = useTilt();

  if (!patient) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={cardRef}
        className={`${styles.modal} ${tilting ? styles.tilting : styles.settled}`}
        style={{
          transform,
          "--glow-x": `${glow.x}%`,
          "--glow-y": `${glow.y}%`,
        }}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.glowOverlay} />

        <h2 className={styles.title}>{patient.firstName} Profile</h2>

        <div className={styles.topRow}>
          <div className={`${styles.photoBox} ${styles.glass}`}>
            <img
              className={styles.photo}
              src={patient.photo}
              alt={`${patient.firstName} ${patient.lastName}`}
            />
          </div>

          <div className={`${styles.infoCard} ${tableStyles.glass}`}>
            <p className={styles.nameLine}>
              First Name: <strong>{patient.firstName}</strong>
            </p>
            <p className={styles.nameLine}>
              Last Name: <strong>{patient.lastName}</strong>
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Calendar className={styles.icon} />
                <span>{patient.dob}</span>
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

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={`${styles.doneBtn} ${tableStyles.glass}`}
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

export default PatientProfileModal;