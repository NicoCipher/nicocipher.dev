"use client";

import { useState } from "react";
import Link from "next/link";
import profile from "@/data/profile.json";
import { useToast } from "@/components/ui/Toast";
import styles from "./page.module.css";

export default function ResumePage() {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      showToast(`✓ Copied ${profile.email} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = profile.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      showToast(`✓ Copied ${profile.email} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.resumeWrapper}>
      {/* Top Utility Bar (Hidden when printing) */}
      <div className={`${styles.topBar} ${styles.noPrint}`}>
        <Link href="/" className={styles.backLink}>
          ← Back to Portfolio
        </Link>
        <div className={styles.actionGroup}>
          <span className={styles.printHint} aria-hidden="true">
            1-page Letter/A4 optimized
          </span>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleCopyEmail}
            aria-label="Copy email address"
          >
            <span>{copied ? "✓" : "✉"}</span>
            <span>{copied ? "Email Copied!" : "Copy Email"}</span>
          </button>
          <button
            type="button"
            className={styles.printBtn}
            onClick={handlePrint}
            aria-label="Print or save as PDF"
          >
            <span>⎙</span>
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Resume Sheet */}
      <main className={styles.resumeSheet}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.nameRow}>
            <div>
              <h1 className={styles.name}>{profile.name}</h1>
              <div className={styles.role}>{profile.role}</div>
            </div>
            <div className={styles.contactBar}>
              <span>@{profile.handle}</span>
            </div>
          </div>

          <div className={styles.contactBar}>
            <button
              type="button"
              onClick={handleCopyEmail}
              className={`${styles.contactItem} ${styles.contactBtn}`}
              title="Click to copy email address"
            >
              <span>✉ {profile.email}</span>
              {copied && <span className={styles.copiedInline}>✓ copied</span>}
            </button>
            <span aria-hidden="true">•</span>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              github.com/NicoCipher
            </a>
            <span aria-hidden="true">•</span>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              linkedin.com/in/nicocipher
            </a>
            <span aria-hidden="true">•</span>
            <span className={styles.contactItem}>https://nicocipher.dev</span>
          </div>
        </header>

        {/* Executive Summary */}
        <section className={styles.section} aria-label="Professional Summary">
          <h2 className={styles.sectionTitle}>[ Professional Summary ]</h2>
          <p className={styles.summaryText}>
            Cybersecurity and Systems Engineer specializing in defensible enterprise infrastructure, multi-tier campus networking, and identity management. Committed to an evidence-over-assertion methodology where technical claims are demonstrated through terminal outputs, packet captures, and reproducible lab configurations across Windows Server, Cisco IOS, and headless Linux.
          </p>
        </section>

        {/* Core Technical Competencies */}
        <section className={styles.section} aria-label="Core Technical Competencies">
          <h2 className={styles.sectionTitle}>[ Technical Competencies ]</h2>
          <div className={styles.skillsGrid}>
            <div className={styles.skillCategory}>
              <span className={styles.skillCategoryTitle}>Networking &amp; Switching</span>
              <span className={styles.skillList}>
                Cisco IOS, 3-Tier Campus Switching, 802.1Q VLANs &amp; Trunking, OSPFv2 Dynamic Routing, IPv4 Subnetting (VLSM/CIDR), Layer 2 ARP &amp; Gateway Boundaries.
              </span>
            </div>

            <div className={styles.skillCategory}>
              <span className={styles.skillCategoryTitle}>Identity &amp; Enterprise Systems</span>
              <span className={styles.skillList}>
                Active Directory Domain Services (AD DS), Kerberos Authentication, Linux SSSD/PAM Integration, DNS SRV Records, Windows Server 2022.
              </span>
            </div>

            <div className={styles.skillCategory}>
              <span className={styles.skillCategoryTitle}>Security &amp; Defensive Controls</span>
              <span className={styles.skillList}>
                STRIDE Threat Modeling, Pass-the-Cookie Attack Analysis, HTTP Session Security (HttpOnly, SameSite, Secure), Strict CSP/HSTS, Linux Permission Auditing.
              </span>
            </div>

            <div className={styles.skillCategory}>
              <span className={styles.skillCategoryTitle}>Systems &amp; Tooling</span>
              <span className={styles.skillList}>
                Headless Linux (Ubuntu Server, Debian), systemd, OpenSSH, Cisco Packet Tracer, Wireshark, Bash, Python, Git, Next.js.
              </span>
            </div>
          </div>
        </section>

        {/* Certifications & Training */}
        <section className={styles.section} aria-label="Certifications and Credentials">
          <h2 className={styles.sectionTitle}>[ Certifications &amp; Credentials ]</h2>
          <div className={styles.certList}>
            <div className={styles.certCard}>
              <div className={styles.certName}>Google Cybersecurity Professional Certificate</div>
              <div className={styles.certStatus}>In Progress · Credential ID Verified</div>
              <p className={styles.certDesc}>
                Covers network security architecture, Linux command-line defense, SIEM packet analysis, Python automation, and risk mitigation.
              </p>
            </div>

            <div className={styles.certCard}>
              <div className={styles.certName}>Cisco Certified Network Associate (CCNA)</div>
              <div className={styles.certStatus}>Active Study &amp; Lab Simulation</div>
              <p className={styles.certDesc}>
                Enterprise switching, OSPF single &amp; multi-area routing, 802.1Q trunks, port security, STP/RSTP, and access control lists (ACLs).
              </p>
            </div>
          </div>
        </section>

        {/* Selected Verified Projects & Labs */}
        <section className={styles.section} aria-label="Verified Engineering Projects and Labs">
          <h2 className={styles.sectionTitle}>[ Flagship Engineering Deliverables ]</h2>
          <div className={styles.projectList}>
            {/* Project 1 */}
            <div className={styles.projectItem}>
              <div className={styles.projectHeader}>
                <Link
                  href="/publications/project/enterprise-network-security-architecture"
                  className={styles.projectTitleLink}
                >
                  Building an Enterprise Office Network: Multi-Layer Switching, VLANs, &amp; OSPF
                </Link>
                <span className={styles.projectTypeBadge}>Enterprise Project</span>
              </div>
              <p className={styles.projectDesc}>
                Architected and deployed a multi-tier campus network featuring Core, Distribution, and Access switching layers. Configured Layer 3 SVI routing, isolated departmental broadcast domains via 802.1Q VLAN trunks, and established automated redundant failover with OSPFv2 dynamic routing.
              </p>
              <div className={styles.projectEvidence}>
                <span>Evidence:</span> Full Cisco running-configs, OSPF neighbor convergence logs, interactive 3-tier topology diagram.
              </div>
            </div>

            {/* Project 2 */}
            <div className={styles.projectItem}>
              <div className={styles.projectHeader}>
                <Link
                  href="/publications/lab/ubuntu-active-directory-integration"
                  className={styles.projectTitleLink}
                >
                  Connecting Ubuntu Linux to Windows Active Directory (SSSD &amp; Kerberos)
                </Link>
                <span className={styles.projectTypeBadge}>Hands-on Lab</span>
              </div>
              <p className={styles.projectDesc}>
                Enrolled a headless Ubuntu Linux server into a Windows Server 2022 Active Directory domain. Diagnosed and remediated DNS SRV lookup failures, configured SSSD and PAM stacks (`/etc/pam.d/common-auth`), and validated Kerberos ticket acquisition (TGT via `kinit`).
              </p>
              <div className={styles.projectEvidence}>
                <span>Evidence:</span> `/etc/sssd/sssd.conf`, `realm list` enrollment output, Kerberos ticket cache verification.
              </div>
            </div>

            {/* Project 3 */}
            <div className={styles.projectItem}>
              <div className={styles.projectHeader}>
                <Link
                  href="/publications/research/session-cookie-authentication-mechanics"
                  className={styles.projectTitleLink}
                >
                  Testing Pass-the-Cookie Attacks: Bypassing MFA via Stolen Session Tokens
                </Link>
                <span className={styles.projectTypeBadge}>Security Research</span>
              </div>
              <p className={styles.projectDesc}>
                Demonstrated how attackers bypass password and multi-factor authentication (MFA) requirements by hijacking authenticated session tokens. Documented concrete remediation architectures including HttpOnly directives, SameSite=Strict isolation, and continuous token rotation.
              </p>
              <div className={styles.projectEvidence}>
                <span>Evidence:</span> Attack reproduction workflow, browser storage boundaries, header defense matrix.
              </div>
            </div>

            {/* Project 4 */}
            <div className={styles.projectItem}>
              <div className={styles.projectHeader}>
                <Link
                  href="/publications/case-study/linux-headless-service-deployment"
                  className={styles.projectTitleLink}
                >
                  Deploying Software on Headless Linux: SSH &amp; Service Clustering
                </Link>
                <span className={styles.projectTypeBadge}>Case Study</span>
              </div>
              <p className={styles.projectDesc}>
                Administered remote Linux instances over authenticated SSH. Established least-privilege systemd service definitions, configured UFW firewall boundaries, and verified multi-node cluster communication without graphical desktop overhead.
              </p>
              <div className={styles.projectEvidence}>
                <span>Evidence:</span> systemd unit files, SSH key configuration, service restart logs.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
