"use client";

import { useState } from "react";
import Link from "next/link";
import { playSoftClick } from "@/lib/sound";
import styles from "./AudienceLens.module.css";

const PERSPECTIVES = {
  engineer: {
    id: "engineer",
    pillLabel: "⚡ Systems Engineer",
    tagline: "TECHNICAL ARCHITECTURE & LAB EVIDENCE",
    headline: "Everything published here started with something breaking.",
    bio: "Most security knowledge claims are assertions. Mine are documented with terminal outputs, OSPF convergence packet captures, and reproducible lab procedures across Windows Server, Cisco IOS, and headless Linux.",
    highlights: [
      { label: "Lab Verification", detail: "Deterministic RFC and protocol-level testing" },
      { label: "Infrastructure", detail: "Active Directory, SSSD, Kerberos, and OSPF" },
      { label: "Evidence", detail: "Full CLI logs, configs, and error postmortems" },
    ],
    recommended: [
      {
        type: "project",
        slug: "enterprise-network-security-architecture",
        title: "Building an Enterprise Office Network: VLANs & OSPF Routing",
      },
      {
        type: "lab",
        slug: "ubuntu-active-directory-integration",
        title: "Connecting Ubuntu Linux to Windows Active Directory (SSSD)",
      },
    ],
  },
  recruiter: {
    id: "recruiter",
    pillLabel: "💼 Recruiter / TL;DR",
    tagline: "EXECUTIVE SUMMARY & CORE COMPETENCIES",
    headline: "Proven hands-on engineering, documented from scratch.",
    bio: "Cybersecurity & Systems Engineer with demonstrable skills in enterprise directory services, multi-tier campus networking, and production Linux administration. Holds Google Cybersecurity Professional credential; actively studying Cisco CCNA.",
    highlights: [
      { label: "Core Competencies", detail: "Cisco Switching, Windows AD DS, Linux systemd" },
      { label: "Credentials", detail: "Google Cybersecurity Cert · Cisco CCNA Study" },
      { label: "Deliverables", detail: "10 end-to-end projects, case studies, & labs" },
    ],
    recommended: [
      {
        type: "case-study",
        slug: "linux-headless-service-deployment",
        title: "Deploying Software on Headless Linux: SSH & Clustering",
      },
      {
        type: "lab",
        slug: "domain-controller",
        title: "Standing Up a Windows Server 2022 Domain Controller",
      },
    ],
  },
  security: {
    id: "security",
    pillLabel: "🛡️ Security & Trust",
    tagline: "DEFENSIBLE SYSTEMS & ZERO-TRUST CONTROLS",
    headline: "Defense-in-depth validated by offensive testing.",
    bio: "Focused on trust boundary analysis, STRIDE threat modeling, and web application hardening. This website itself runs on a 7-thread hardened posture: strict CSP, HSTS, anti-clickjacking, safe JSON-LD, zero-dependency XSS sanitization, and 0 dependency vulnerabilities.",
    highlights: [
      { label: "Threat Modeling", detail: "STRIDE framework applied to web authentication" },
      { label: "Session Security", detail: "Pass-the-Cookie reproduction & defense" },
      { label: "Hardening Posture", detail: "Strict CSP, subresource protection, 0 CVEs" },
    ],
    recommended: [
      {
        type: "research",
        slug: "session-cookie-authentication-mechanics",
        title: "Testing Pass-the-Cookie Attacks: Bypassing MFA via Cookies",
      },
      {
        type: "research",
        slug: "threat-modeling",
        title: "Applying STRIDE Threat Modeling to Web Authentication",
      },
    ],
  },
};

export default function AudienceLens() {
  const [activeTab, setActiveTab] = useState("engineer");
  const current = PERSPECTIVES[activeTab];

  const handleSwitch = (id) => {
    if (id === activeTab) return;
    playSoftClick();
    setActiveTab(id);
  };

  return (
    <div className={styles.lensCard}>
      {/* Persona Selection Header */}
      <div className={styles.lensHeader}>
        <div className={styles.lensPrompt}>
          <span className={styles.lensIcon} aria-hidden="true">✦</span>
          <span className={styles.lensLabel}>Select your reading lens:</span>
        </div>

        <div className={styles.lensPills} role="tablist" aria-label="Perspective selector">
          {Object.values(PERSPECTIVES).map((p) => {
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.lensPill} ${isActive ? styles.lensPillActive : ""}`}
                onClick={() => handleSwitch(p.id)}
              >
                {p.pillLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Body */}
      <div className={styles.lensBody} key={activeTab}>
        <div className={styles.lensTop}>
          <span className={styles.lensTagline}>{current.tagline}</span>
          <h2 className={styles.lensHeadline}>{current.headline}</h2>
        </div>

        <p className={styles.lensBio}>{current.bio}</p>

        {/* Value Highlights */}
        <div className={styles.highlightsGrid}>
          {current.highlights.map((h, i) => (
            <div key={i} className={styles.highlightCard}>
              <span className={styles.highlightLabel}>{h.label}</span>
              <span className={styles.highlightDetail}>{h.detail}</span>
            </div>
          ))}
        </div>

        {/* Recommended Starting Point */}
        <div className={styles.recommendedSection}>
          <span className={styles.recommendedLabel}>Recommended for this lens:</span>
          <div className={styles.recommendedLinks}>
            {current.recommended.map((pub) => (
              <Link
                key={pub.slug}
                href={`/publications/${pub.type}/${pub.slug}`}
                className={styles.recommendedCard}
                onClick={playSoftClick}
              >
                <span className={styles.pubTypeBadge}>{pub.type}</span>
                <span className={styles.pubTitle}>{pub.title}</span>
                <span className={styles.pubArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
