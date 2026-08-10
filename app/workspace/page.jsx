"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function WorkspaceDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/workspace/publications")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPublications(data.publications || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (pub) => {
    if (!confirm(`Delete "${pub.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/workspace/publications/${pub.type}/${pub.slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPublications((prev) => prev.filter((p) => p.slug !== pub.slug || p.type !== pub.type));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading publications...</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Publications</h1>
          <p className={styles.subtitle}>{publications.length} publication{publications.length !== 1 ? "s" : ""} in system</p>
        </div>
        <button
          className={styles.newBtn}
          onClick={() => router.push("/workspace/editor")}
        >
          + New Publication
        </button>
      </div>

      {publications.length === 0 ? (
        <div className={styles.empty}>
          No publications yet. Click &quot;+ New Publication&quot; to create one.
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Domain</th>
              <th className={styles.th}>Ev.</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {publications.map((pub) => (
              <tr
                key={`${pub.type}-${pub.slug}`}
                className={styles.row}
                onClick={() => router.push(`/workspace/editor?type=${pub.type}&slug=${pub.slug}`)}
              >
                <td className={styles.td}>
                  <span className={styles.typeBadge}>{pub.type}</span>
                </td>
                <td className={`${styles.td} ${styles.titleCell}`}>{pub.title}</td>
                <td className={styles.td}>{pub.date}</td>
                <td className={styles.td}>
                  <span className={`${styles.statusDot} ${pub.status === "active" ? styles.statusActive : ""}`} />
                  {pub.status}
                </td>
                <td className={styles.td}>{pub.domain}</td>
                <td className={styles.td}>{pub.evidence?.length || 0}</td>
                <td className={styles.td}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); handleDelete(pub); }}
                    title="Delete publication"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
