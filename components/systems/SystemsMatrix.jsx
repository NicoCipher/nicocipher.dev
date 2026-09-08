"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/ui/Icons";
import styles from "./SystemsMatrix.module.css";

const CORE_CONCEPTS = [
  {
    term: "Active Directory & Kerberos",
    description: "Centralized identity management and ticket-based authentication. Eliminates fragmented per-machine credentials by enforcing single-sign-on and domain-wide access control.",
    pubType: "lab",
    pubSlug: "ubuntu-active-directory-integration",
    pubTitle: "Connecting Ubuntu Linux to Windows Active Directory",
  },
  {
    term: "OSPF & Dynamic Routing",
    description: "Link-state interior gateway protocol that maintains topological maps of the network and automatically recalculates optimal forwarding paths during link failures.",
    pubType: "project",
    pubSlug: "enterprise-network-security-architecture",
    pubTitle: "Building an Enterprise Office Network: VLANs & OSPF",
  },
  {
    term: "VLANs (802.1Q)",
    description: "Logical Layer 2 segmentation within shared physical switches, isolating broadcast domains and enforcing traffic separation between departmental networks.",
    pubType: "project",
    pubSlug: "enterprise-network-security-architecture",
    pubTitle: "Building an Enterprise Office Network: VLANs & OSPF",
  },
  {
    term: "IPv4 Subnetting & CIDR",
    description: "Hierarchical IP address space allocation using variable-length subnet masks (VLSM) to optimize routing boundaries and prevent address space exhaustion.",
    pubType: "research",
    pubSlug: "ipv4-subnetting-binary-logic",
    pubTitle: "Subnetting Made Simple: Magic Number Shortcut",
  },
  {
    term: "Headless Linux Administration",
    description: "Managing remote server instances via authenticated OpenSSH without graphical desktop overhead, enforcing least-privilege command-line workflows.",
    pubType: "case-study",
    pubSlug: "linux-headless-service-deployment",
    pubTitle: "Deploying Software on Headless Linux: SSH & Clustering",
  },
  {
    term: "Session Cookie Security",
    description: "Browser state authorization secured with HttpOnly, Secure, and SameSite directives to prevent credential hijacking and cross-site script theft.",
    pubType: "research",
    pubSlug: "session-cookie-authentication-mechanics",
    pubTitle: "Testing Pass-the-Cookie Attacks & Cookie Theft",
  },
  {
    term: "Threat Modeling (STRIDE)",
    description: "Structured evaluation of software and network architectures to identify trust boundaries, threat actors, and attack surfaces before deployment.",
    pubType: "research",
    pubSlug: "threat-modeling",
    pubTitle: "Applying STRIDE Threat Modeling to Web Auth",
  },
  {
    term: "Layer 2 ARP vs. Default Gateway",
    description: "Host-level routing logic determining whether destination traffic resolves via local Layer 2 broadcast resolution or forwards through a Layer 3 default gateway.",
    pubType: "lab",
    pubSlug: "layer2-arp-default-gateway-validation",
    pubTitle: "Why Local Pings Fail: Testing Layer 2 ARP & Gateway",
  },
];

function getVerificationClass(verification) {
  switch (verification) {
    case "Lab Verified":
      return styles.badgeLab;
    case "Production Hardened":
      return styles.badgeProd;
    case "Security Tested":
      return styles.badgeSecurity;
    case "Research Backed":
      return styles.badgeResearch;
    default:
      return styles.badgeDefault;
  }
}

export default function SystemsMatrix({ domains = [], publications = [] }) {
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReference, setShowReference] = useState(false);

  // Total technologies across all domains
  const totalTechCount = useMemo(() => {
    return domains.reduce((sum, d) => sum + (d.technologies?.length || 0), 0);
  }, [domains]);

  // Filtered domains and technologies based on active tab and search query
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return domains
      .filter((domain) => {
        if (selectedDomain !== "all" && domain.id !== selectedDomain) {
          return false;
        }
        return true;
      })
      .map((domain) => {
        const matchingTechs = (domain.technologies || []).filter((tech) => {
          if (!query) return true;
          const nameMatch = tech.name.toLowerCase().includes(query);
          const contextMatch = tech.context.toLowerCase().includes(query);
          const verificationMatch = (tech.verification || "").toLowerCase().includes(query);
          const keywordMatch = (tech.keywords || []).some((k) => k.toLowerCase().includes(query));
          return nameMatch || contextMatch || verificationMatch || keywordMatch;
        });

        const domainPubs = publications.filter(
          (p) => p.domain === domain.id || p.tags?.some((t) => t.toLowerCase() === domain.id)
        );

        return {
          ...domain,
          technologies: matchingTechs,
          publications: domainPubs,
        };
      })
      .filter((domain) => domain.technologies.length > 0 || (searchQuery === "" && selectedDomain === domain.id));
  }, [domains, publications, selectedDomain, searchQuery]);

  const totalVisibleTechs = useMemo(() => {
    return filteredData.reduce((sum, d) => sum + d.technologies.length, 0);
  }, [filteredData]);

  // Filter core concepts by search query if user searches
  const filteredConcepts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return CORE_CONCEPTS;
    return CORE_CONCEPTS.filter(
      (c) => c.term.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className={styles.matrixWrapper}>
      {/* Metrics Banner */}
      <div className={styles.metricsBanner} role="region" aria-label="System Metrics">
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>{totalTechCount}</span>
          <span className={styles.metricLabel}>Technologies</span>
        </div>
        <div className={styles.metricDivider} aria-hidden="true" />
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>{publications.length}</span>
          <span className={styles.metricLabel}>Publications</span>
        </div>
        <div className={styles.metricDivider} aria-hidden="true" />
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>{domains.length}</span>
          <span className={styles.metricLabel}>Domains</span>
        </div>
        <div className={styles.metricDivider} aria-hidden="true" />
        <div className={styles.metricItem}>
          <span className={styles.metricValueHighlight}>100%</span>
          <span className={styles.metricLabel}>Evidence-Linked</span>
        </div>
      </div>

      {/* Interactive Controls: Filter Tabs & Search Bar */}
      <div className={styles.controlsBar}>
        {/* Domain Filter Pills */}
        <div className={styles.filterPills} role="tablist" aria-label="Filter by engineering domain">
          <button
            type="button"
            role="tab"
            aria-selected={selectedDomain === "all"}
            className={`${styles.pillBtn} ${selectedDomain === "all" ? styles.pillActive : ""}`}
            onClick={() => setSelectedDomain("all")}
          >
            All Domains
            <span className={styles.pillBadge}>{totalTechCount}</span>
          </button>

          {domains.map((domain) => {
            const count = domain.technologies?.length || 0;
            const isActive = selectedDomain === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.pillBtn} ${isActive ? styles.pillActive : ""}`}
                onClick={() => setSelectedDomain(domain.id)}
              >
                {domain.label.split(" ")[0]}
                <span className={styles.pillBadge}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className={styles.searchBox}>
          <SearchIcon size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Filter skills (e.g., OSPF, Kerberos, Linux)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter skills and technologies"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchQuery("")}
              aria-label="Clear skill search filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search status feedback */}
      {searchQuery && (
        <div className={styles.searchFeedback}>
          Showing {totalVisibleTechs} matching {totalVisibleTechs === 1 ? "skill" : "skills"} for &ldquo;{searchQuery}&rdquo;
          {totalVisibleTechs === 0 && (
            <button
              type="button"
              className={styles.resetFilterBtn}
              onClick={() => {
                setSearchQuery("");
                setSelectedDomain("all");
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Main Domains and Technologies Grid */}
      <div className={styles.domainsContainer}>
        {filteredData.map((domain) => (
          <section key={domain.id} className={styles.domainSection} aria-labelledby={`domain-${domain.id}`}>
            <div className={styles.domainHeader}>
              <div className={styles.domainTitleRow}>
                <h2 id={`domain-${domain.id}`} className={styles.domainTitle}>
                  {domain.label}
                </h2>
                <span className={styles.domainCountBadge}>
                  {domain.technologies.length} verified {domain.technologies.length === 1 ? "technology" : "technologies"}
                </span>
              </div>
              {domain.description && (
                <p className={styles.domainDescription}>{domain.description}</p>
              )}
            </div>

            {/* Interactive Technology Cards Grid */}
            <div className={styles.techGrid}>
              {domain.technologies.map((tech) => (
                <div key={tech.name} className={styles.techCard}>
                  <div className={styles.techCardHeader}>
                    <h3 className={styles.techName}>{tech.name}</h3>
                    {tech.verification && (
                      <span className={`${styles.verificationBadge} ${getVerificationClass(tech.verification)}`}>
                        <span className={styles.badgeDot} aria-hidden="true">●</span>
                        {tech.verification}
                      </span>
                    )}
                  </div>

                  <p className={styles.techContext}>{tech.context}</p>

                  {tech.pubSlug && tech.pubTitle && (
                    <div className={styles.techEvidence}>
                      <span className={styles.evidenceLabel}>Primary Evidence:</span>
                      <Link
                        href={`/publications/${tech.pubType}/${tech.pubSlug}`}
                        className={styles.evidenceLink}
                        title={`Read ${tech.pubTitle}`}
                      >
                        <span className={styles.evidenceType}>[{tech.pubType}]</span>
                        <span className={styles.evidenceTitle}>{tech.pubTitle}</span>
                        <span className={styles.evidenceArrow} aria-hidden="true">→</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Domain Publications Quick-Access Panel */}
            {domain.publications && domain.publications.length > 0 && (
              <div className={styles.domainPublications}>
                <div className={styles.pubSectionHeader}>
                  <span className={styles.pubSectionTag}>Related Evidence</span>
                  <h4 className={styles.pubSectionTitle}>
                    Publications in {domain.label} ({domain.publications.length})
                  </h4>
                </div>
                <div className={styles.pubCardsGrid}>
                  {domain.publications.map((pub) => (
                    <Link
                      key={pub.type + pub.slug}
                      href={`/publications/${pub.type}/${pub.slug}`}
                      className={styles.pubCard}
                    >
                      <div className={styles.pubCardTop}>
                        <span className={styles.pubCardType}>{pub.type}</span>
                        {pub.readingTime && (
                          <span className={styles.pubCardReading}>{pub.readingTime}</span>
                        )}
                      </div>
                      <h5 className={styles.pubCardTitle}>{pub.title}</h5>
                      <span className={styles.pubCardPrompt}>Read publication →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Architecture & Protocol Reference Section (Collapsible / Secondary) */}
      <section className={styles.referenceSection} aria-label="Architecture and Protocol Reference">
        <div className={styles.referenceHeader}>
          <div className={styles.referenceTitleGroup}>
            <span className={styles.referenceTag}>Foundational Knowledge</span>
            <h2 className={styles.referenceTitle}>Architecture &amp; Protocol Reference</h2>
            <p className={styles.referenceSubtitle}>
              Core networking protocols, directory services, and security boundaries implemented and tested across this portfolio.
            </p>
          </div>
          <button
            type="button"
            className={styles.referenceToggleBtn}
            onClick={() => setShowReference((prev) => !prev)}
            aria-expanded={showReference}
          >
            {showReference ? "Collapse Glossary ↑" : `View Protocols (${filteredConcepts.length}) ↓`}
          </button>
        </div>

        {showReference && (
          <div className={styles.referenceGrid}>
            {filteredConcepts.map((item) => (
              <div key={item.term} className={styles.conceptCard}>
                <div className={styles.conceptHeader}>
                  <h3 className={styles.conceptTerm}>{item.term}</h3>
                </div>
                <p className={styles.conceptDescription}>{item.description}</p>
                {item.pubSlug && (
                  <Link
                    href={`/publications/${item.pubType}/${item.pubSlug}`}
                    className={styles.conceptLink}
                  >
                    <span>Applied in: {item.pubTitle}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
