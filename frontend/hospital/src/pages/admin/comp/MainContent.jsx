import styles from "../Dashboard.module.css";

function MainContent({ children }) {
  return (
    <main className={styles.mainTemplate}>
      {children}
    </main>
  );
}

export default MainContent;