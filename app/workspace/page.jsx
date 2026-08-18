"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listPublicationFiles, getFileContent, deleteFile } from "@/lib/github";
import { deserializePublication } from "@/lib/serializer";
import styles from "./page.module.css";

export default function WorkspaceDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadPublications();
  }, []);

  async function loadPublications() {
    setLoading(true);
    setError(null);

    try {
      const files = await listPublicationFiles();

      // Fetch each file's content and parse frontmatter
      const pubs = await Promise.all(
        files.map(async (file) => {
          try {
            const { content, sha } = await getFileContent(file.path);
            const pub = deserializePublication(content);
            pub._path = file.path;
            pub._sha = sha;
            return pub;
          } catch {
            return null;
          }
        })
      );

      const valid = pubs.filter(Boolean);
      valid.sort((a, b) => (a.date < b.date ? 1 : -1));
      setPublications(valid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (pub) => {
    if (!confirm(`Delete "${pub.title}"? This will commit a deletion to the repo.`)) return;

    try {
      await deleteFile(pub._path, pub._sha, `pub: delete ${pub.title}`);
      setPublications((prev) => prev.filter((p) => p._path !== pub._path));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading publications from GitHub...</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Publications</h1>
          <p className={styles.subtitle}>{publications.length} publication{publications.length !== 1 ? "s" : ""} in repo</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={styles.settingsBtn}
            onClick={() => router.push("/workspace/settings")}
          >
            ⚙ Settings
          </button>
          <button
            className={styles.newBtn}
            onClick={() => router.push("/workspace/editor")}
          >
            + New Publication
          </button>
        </div>
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
                key={pub._path}
                className={styles.row}
                onClick={() => router.push(`/workspace/editor?path=${encodeURIComponent(pub._path)}`)}
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
