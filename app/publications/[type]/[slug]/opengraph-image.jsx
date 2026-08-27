import { ImageResponse } from "next/og";
import { getPublicationBySlug } from "@/lib/publications";

export const runtime = "nodejs";
export const alt = "Publication";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { type, slug } = await params;

  let pub;
  try {
    pub = getPublicationBySlug(type, slug);
  } catch {
    return new ImageResponse(
      (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#0a0a0a", color: "#efefef", fontSize: 48, fontFamily: "sans-serif" }}>
          NICOCIPHER
        </div>
      ),
      { ...size }
    );
  }

  const typeColors = {
    project: "#3b82f6",
    "case-study": "#8b5cf6",
    lab: "#10b981",
    research: "#f59e0b",
  };

  const accentColor = typeColors[pub.type] || "#3b82f6";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: type badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: accentColor,
              background: "rgba(255,255,255,0.06)",
              padding: "6px 16px",
              borderRadius: "6px",
              border: `1px solid ${accentColor}33`,
            }}
          >
            {pub.type}
          </div>
          <div style={{ fontSize: 14, color: "#555555" }}>{pub.date}</div>
          {pub.domain && <div style={{ fontSize: 14, color: "#555555" }}>·  {pub.domain}</div>}
        </div>

        {/* Middle: title + summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#efefef",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {pub.title}
          </div>
          {pub.summary && (
            <div style={{ fontSize: 22, color: "#a0a0a0", lineHeight: 1.5, maxWidth: "800px" }}>
              {pub.summary.length > 140 ? pub.summary.slice(0, 140) + "…" : pub.summary}
            </div>
          )}
        </div>

        {/* Bottom: branding + tech tags */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#efefef", letterSpacing: "-0.02em" }}>NICOCIPHER</div>
            <div style={{ fontSize: 14, color: "#555555" }}>nicocipher.dev</div>
          </div>
          {pub.technologies && pub.technologies.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "500px" }}>
              {pub.technologies.slice(0, 5).map((tech) => (
                <div
                  key={tech}
                  style={{
                    fontSize: 12,
                    color: "#a0a0a0",
                    background: "rgba(255,255,255,0.05)",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: "1px solid #252525",
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
