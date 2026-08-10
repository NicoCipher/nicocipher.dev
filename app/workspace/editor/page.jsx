"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFileContent, saveFile } from "@/lib/github";
import { deserializePublication, serializePublication, getBodyTemplate, slugify, getPublicationPath } from "@/lib/serializer";
import MetadataForm from "@/components/workspace/MetadataForm";
import TagInput from "@/components/workspace/TagInput";
import EvidenceEditor from "@/components/workspace/EvidenceEditor";
import BodyEditor from "@/components/workspace/BodyEditor";
import LivePreview from "@/components/workspace/LivePreview";
import styles from "./page.module.css";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editPath = searchParams.get("path");
  const isNew = !editPath;

  const [data, setData] = useState({
    type: "lab",
    title: "",
    slug: "",
    date: new Date().toISOString().split("T")[0],
    status: "complete",
    domain: "",
    summary: "",
    effort: "",
    technologies: [],
    tags: [],
    featured: false,
    evidence: [],
    body: "",
  });
  const [fileSha, setFileSha] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saved" | "error"
  const [showPreview, setShowPreview] = useState(false);

  // Load existing publication for editing
  useEffect(() => {
    if (isNew) return;

    getFileContent(editPath)
      .then(({ content, sha, path }) => {
        const pub = deserializePublication(content);
        setData(pub);
        setFileSha(sha);
        setFilePath(path);
      })
      .catch((err) => {
        alert(`Failed to load: ${err.message}`);
        router.push("/workspace");
      })
      .finally(() => setLoading(false));
  }, [editPath, isNew, router]);

  const updateData = useCallback((updates) => {
    setData((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };

      // Auto-generate slug from title for new publications
      if (isNew && updates.type && updates.type !== prev.type && !prev.body.trim()) {
        next.body = getBodyTemplate(updates.type);
      }

      return next;
    });
    setSaveStatus(null);
  }, [isNew]);

  // Pre-fill body template on first mount for new publications
  useEffect(() => {
    if (isNew && !data.body) {
      setData((prev) => ({ ...prev, body: getBodyTemplate(prev.type) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!data.title?.trim()) {
      alert("Title is required.");
      return;
    }
    if (!data.domain) {
      alert("Domain is required.");
      return;
    }

    setSaving(true);
    setSaveStatus(null);

    try {
      const slug = data.slug || slugify(data.title);
      const pubData = { ...data, slug };
      const content = serializePublication(pubData);

      let targetPath;
      let commitMsg;

      if (isNew) {
        targetPath = getPublicationPath(pubData.type, slug, pubData.date);
        commitMsg = `pub: create ${pubData.title}`;
      } else {
        targetPath = filePath;
        commitMsg = `pub: update ${pubData.title}`;
      }

      const newSha = await saveFile(targetPath, content, commitMsg, isNew ? null : fileSha);

      setFileSha(newSha);
      setFilePath(targetPath);
      setSaveStatus("saved");

      if (isNew) {
        // Redirect to edit mode
        router.replace(`/workspace/editor?path=${encodeURIComponent(targetPath)}`);
      }
    } catch (err) {
      setSaveStatus("error");
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading from GitHub...</div></div>;
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.backBtn} onClick={() => router.push("/workspace")}>← Back</button>
        <span className={styles.toolbarTitle}>{isNew ? "New Publication" : data.title}</span>
        <div className={styles.toolbarActions}>
          <button
            className={styles.previewToggle}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Editor" : "Preview"}
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Committing..." : saveStatus === "saved" ? "✓ Pushed" : "Save & Push"}
          </button>
        </div>
      </div>

      {/* Deployment notice */}
      {saveStatus === "saved" && (
        <div className={styles.deployNotice}>
          ✓ Committed to main — Vercel will deploy in ~30s
        </div>
      )}

      {/* Editor Layout */}
      <div className={`${styles.editorLayout} ${showPreview ? styles.withPreview : ""}`}>
        {/* Form panel — hidden on mobile when preview is active */}
        <div className={styles.formPanel} style={showPreview ? { display: "none" } : undefined}>
          {/* Metadata */}
          <section className={styles.section}>
            <MetadataForm data={data} onChange={updateData} isNew={isNew} />
          </section>

          {/* Tags & Technologies */}
          <section className={styles.section}>
            <TagInput
              label="Technologies"
              values={data.technologies || []}
              onChange={(v) => updateData({ technologies: v })}
            />
            <TagInput
              label="Tags"
              values={data.tags || []}
              onChange={(v) => updateData({ tags: v })}
            />
          </section>

          {/* Evidence */}
          <section className={styles.section}>
            <EvidenceEditor
              evidence={data.evidence || []}
              onChange={(v) => updateData({ evidence: v })}
            />
          </section>

          {/* Body */}
          <section className={styles.section}>
            <BodyEditor
              body={data.body || ""}
              onChange={(v) => updateData({ body: v })}
            />
          </section>
        </div>

        {/* Preview Panel — on mobile, replaces form when active */}
        {showPreview && (
          <div className={styles.previewPanel}>
            <LivePreview body={data.body || ""} />
          </div>
        )}
      </div>

      {/* Mobile sticky save */}
      <div className={styles.mobileSave}>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Committing..." : saveStatus === "saved" ? "✓ Pushed" : "Save & Push"}
        </button>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
