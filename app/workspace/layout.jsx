import { redirect } from "next/navigation";
import styles from "./layout.module.css";

export const metadata = {
  title: "Publishing Workspace",
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }) {
  // Dev-only guard — redirect in production
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <span className={styles.brand}>workspace</span>
        <span className={styles.badge}>dev only</span>
        <a href="/" className={styles.exitLink}>← back to site</a>
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
