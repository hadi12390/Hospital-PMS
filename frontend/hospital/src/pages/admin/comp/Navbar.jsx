import styles from "./Dashboard.module.css";
import { useState } from "react";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.buttonAddAppoi}>
          <button>
            <img src="/assest/doctor/cards/Add.svg" alt="Add" />
            Doctor
          </button>
        </div>

        <img src="/assest/doctor/cards/LIne3.svg" alt="" />

        <div className={styles.profileSec}>
          <div className={styles.profilePic}>M</div>

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
    </nav>
  );
}

export default Navbar;