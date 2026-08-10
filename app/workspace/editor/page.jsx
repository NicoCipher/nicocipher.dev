"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBodyTemplate } from "@/lib/serializer";
import MetadataForm from "@/components/workspace/MetadataForm";
import TagInput from "@/components/workspace/TagInput";
import EvidenceEditor from "@/components/workspace/EvidenceEditor";
import BodyEditor from "@/components/workspace/BodyEditor";
import LivePreview from "@/components/workspace/LivePreview";
import styles from "./page.module.css";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editType = searchParams.get("type");
  const editSlug = searchParams.get("slug");
  const isNew = !editType || !editSlug;

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
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing publication for editing
  useEffect(() => {
    if (isNew) return;
    fetch(`/api/workspace/publications/${editType}/${editSlug}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) throw new Error(result.error);
        setData(result.publication);
      })
      .catch((err) => {
        alert(`Failed to load: ${err.message}`);
        router.push("/workspace");
      })
      .finally(() => setLoading(false));
  }, [editType, editSlug, isNew, router]);

  const updateData = useCallback((updates) => {
    setData((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };

      // If type changed on a new publication with empty body, fill template
      if (!isNew) return next;
      if (updates.type && updates.type !== prev.type && !prev.body.trim()) {
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
      let res;
      if (isNew) {
        res = await fetch("/api/workspace/publications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch(`/api/workspace/publications/${editType}/${editSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSaveStatus("saved");

      if (isNew) {
        // Redirect to edit mode for the newly created publication
        router.replace(`/workspace/editor?type=${data.type}&slug=${data.slug}`);
      }
    } catch (err) {
      setSaveStatus("error");
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.backBtn} onClick={() => router.push("/workspace")}>← Back</button>
        <span className={styles.toolbarTitle}>{isNew ? "New Publication" : `Editing: ${data.title}`}</span>
        <div className={styles.toolbarActions}>
          <button
            className={styles.previewToggle}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : saveStatus === "saved" ? "✓ Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className={`${styles.editorLayout} ${showPreview ? styles.withPreview : ""}`}>
        <div className={styles.formPanel}>
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

        {/* Preview Panel */}
        {showPreview && (
          <div className={styles.previewPanel}>
            <LivePreview body={data.body || ""} />
          </div>
        )}
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
