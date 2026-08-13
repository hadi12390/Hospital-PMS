import styles from "./Payment.module.css";
import HomeLogo from "../../assets/patient/home.svg?react";
import AppLogo from "../../assets/patient/app.svg?react";
import DocLogo from "../../assets/patient/doc.svg?react";
import PillLogo from "../../assets/patient/pill.svg?react";
import DocuLogo from "../../assets/patient/docu.svg?react";
import HelpLogo from "../../assets/patient/help.svg?react";
import SettLogo from "../../assets/patient/setting.svg?react";
import LogOutLogo from "../../assets/patient/logout.svg?react";
import Search from "../../assets/patient/search.svg?react";
import Paid from "../../assets/patient/paid.svg?react";
import Uptime from "../../assets/patient/uptime.svg?react";
import DownloadMM from "../../assets/patient/downloadmm.svg?react";
import TimePast from "../../assets/patient/time-past.svg?react";

import { useState } from "react";
import { NavLink } from "react-router-dom";

/* ==========================================================================
   PaymentRow — shared row for Recent Payments + Outstanding Balance
   ========================================================================== */

function PaymentRow({ title, dueDate, amount, isPaid = true, showStatus = true, onDownload }) {
  return (
    <div className={styles.paymentRow}>
      <div className={styles.paymentInfo}>
        <h3 className={styles.paymentTitle}>{title}</h3>

        <div className={styles.paymentMeta}>
          <div className={styles.metaPill}>
            <TimePast className={styles.metaIcon} />
            <span>Due Date: {dueDate}</span>
          </div>

          <button type="button" className={styles.metaPill} onClick={onDownload}>
            <DownloadMM className={styles.metaIcon} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className={styles.paymentBoxes}>
        {showStatus && (
          <div className={styles.statusBox}>
            <span>{isPaid ? "Paid" : "Pending"}</span>
            {isPaid ? (
              <Paid className={styles.statusIcon} />
            ) : (
              <Uptime className={styles.statusIcon} />
            )}
          </div>
        )}

        <div className={styles.amountBox}>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   RecentPayments
   ========================================================================== */

function RecentPayments({ payments }) {
  return (
    <section className={styles.recentPaymentsCard}>
      <h2 className={styles.sectionTitle}>Recent Payments</h2>

      <div className={styles.paymentsList}>
        {payments.map((p) => (
          <PaymentRow key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   PaymentStats — top stat cards + Outstanding Balance
   ========================================================================== */

function StatCard({ label, value }) {
  return (
    <div className={styles.statCard}>
      <h3 className={styles.statLabel}>{label}</h3>
      <div className={styles.statValueBox}>
        <span>{value}</span>
      </div>
    </div>
  );
}

function PaymentStats({ totalPaid, outstanding, invoiceCount, thisMonth, outstandingPayment }) {
  return (
    <section className={styles.statsSection}>
      <div className={styles.statsGrid}>
        <StatCard label="Total Paid" value={`$${totalPaid.toLocaleString()}`} />
        <StatCard label="Outstanding" value={`$${outstanding}`} />
        <StatCard label="Invoices" value={invoiceCount} />
        <StatCard label="This Month" value={`$${thisMonth}`} />
      </div>

      <h2 className={styles.sectionTitle}>Outstanding Balance</h2>

      <div className={styles.outstandingCard}>
        <PaymentRow {...outstandingPayment} showStatus={false} />
      </div>
    </section>
  );
}

/* ==========================================================================
   Payment — page
   ========================================================================== */

function Payment() {
  const [searchValue, setSearchValue] = useState("");

  // sample data — swap for your API response
  const payments = [
    { id: 1, title: "Consultation", dueDate: "August 12, 2026", amount: 40, isPaid: true },
    { id: 2, title: "Blood Test", dueDate: "July 22, 2026", amount: 65, isPaid: true },
    { id: 3, title: "MRI Scan", dueDate: "July 14, 2026", amount: 180, isPaid: false },
  ];

  const outstandingPayment = {
    title: "Outstanding Balance",
    dueDate: "August 12, 2026",
    amount: 80,
  };

  return (
    <div className={styles.PatientDashboard}>
      <aside className={styles.sideBar}>
        <img src="/assest/patient/logo.svg" alt="Logo" />

        <div className={styles.contSide}>
          <div className={styles.optionsContainer}>
            <NavLink
              to="/patient/home"
              className={({ isActive }) =>
                `${styles.options} ${styles.homeLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <HomeLogo className={styles.homelogoicon} />
            </NavLink>

            <NavLink
              to="/patient/appointment"
              className={({ isActive }) =>
                `${styles.options} ${styles.appLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <AppLogo className={styles.applogoicon} />
            </NavLink>

            <NavLink
              to="/patient/doctor"
              className={({ isActive }) =>
                `${styles.options} ${styles.docLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <DocLogo className={styles.doclogoicon} />
            </NavLink>

            <NavLink
              to="/patient/reports"
              className={({ isActive }) =>
                `${styles.options} ${styles.pillLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <PillLogo className={styles.pilllogoicon} />
            </NavLink>

            <NavLink
              to="/patient/payment"
              className={({ isActive }) =>
                `${styles.options} ${styles.docuLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <DocuLogo className={styles.doculogoicon} />
            </NavLink>
          </div>

          <div className={`${styles.optionsContainer} ${styles.optionsContainerNN}`}>
            <NavLink
              to="/patient/flag"
              className={({ isActive }) =>
                `${styles.options} ${styles.helpLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <HelpLogo className={styles.helplogoicon} />
            </NavLink>

            <NavLink
              to="/patient/settings"
              className={({ isActive }) =>
                `${styles.options} ${styles.settLogoButton} ${isActive ? styles.active : ""}`
              }
            >
              <SettLogo className={styles.settlogoicon} />
            </NavLink>
          </div>

          <div className={styles.logoutsec}>
            <div className={styles.optionsContainer}>
              <button className={`${styles.options} ${styles.logoutLogoButton}`}>
                <LogOutLogo className={styles.logoutlogoicon} />
              </button>

              <NavLink
                to="/patient/account"
                className={({ isActive }) =>
                  `${styles.options} ${styles.settLogoButton} ${isActive ? styles.active : ""}`
                }
              >
                <SettLogo className={styles.Asettlogoicon} />
              </NavLink>
            </div>

            <div className={styles.profPicLogOut}>
              <img src="/assest/patient/pp.png" alt="Profile" />
            </div>
          </div>
        </div>
      </aside>

      <section className={styles.dashboardContent}>
        {/* Navbar */}
        <nav className={styles.nav}>
          <div className={`${styles.navContentSearch} ${styles.glass}`}>
            <div className={styles.searchIcon}>
              <Search size={18} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for Doctor"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className={`${styles.navContent} ${styles.glass}`}>
            <div className={styles.buttonAddAppoi}>
              <button>
                <div className={styles.addDivApp}>+</div>
                Make an New Appointment
              </button>
            </div>

            <div className={styles.profileSec}>
              <div className={styles.profilePic}>
                <img className={styles.navPP} src="/assest/patient/pp.png" alt="Profile" />
              </div>
              <div className={styles.nameNav}>
                <p>Mia Quian</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.cards}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2em", width: "100%" }}>
            <PaymentStats
              totalPaid={1250}
              outstanding={80}
              invoiceCount={24}
              thisMonth={120}
              outstandingPayment={outstandingPayment}
            />
            <RecentPayments payments={payments} />
          </div>
        </main>
      </section>
    </div>
  );
}

export default Payment;