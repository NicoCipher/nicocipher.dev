"use client";

import { useState } from "react";
import styles from "./ActiveDirectoryTopology.module.css";

const PHASES = {
  dns: {
    id: "dns",
    label: "1. DNS SRV Discovery",
    title: "Phase 1: DNS Service Location (SRV) Record Resolution",
    protocol: "DNS (UDP/TCP 53)",
    description: "Before authentication can occur, the Linux client must locate the Active Directory Domain Controller and Kerberos KDC using DNS SRV resource records (_ldap._tcp.lab.local and _kerberos._tcp.lab.local).",
    cli: `$ dig -t SRV _ldap._tcp.lab.local +short
0 100 389 dc01.lab.local.

$ dig -t SRV _kerberos._tcp.lab.local +short
0 100 88 dc01.lab.local.`,
    note: "Failure Point: If /etc/resolv.conf points to a public DNS server (e.g., 8.8.8.8) instead of the Domain Controller's DNS, realm join immediately fails with 'Cannot find KDC for realm LAB.LOCAL'.",
  },
  kerberos: {
    id: "kerberos",
    label: "2. Kerberos KDC Ticket",
    title: "Phase 2: Kerberos Authentication & Ticket Granting Ticket (TGT)",
    protocol: "Kerberos (TCP/UDP 88)",
    description: "The client communicates with the Kerberos Key Distribution Center (KDC) on the Windows Domain Controller, validating passwords against encrypted timestamps and receiving a Ticket Granting Ticket.",
    cli: `$ kinit Administrator@LAB.LOCAL
Password for Administrator@LAB.LOCAL: [redacted]

$ klist
Ticket cache: FILE:/tmp/krb5cc_1000
Default principal: Administrator@LAB.LOCAL

Valid starting       Expires              Service principal
01/16/2026 14:12:08  01/17/2026 00:12:08  krbtgt/LAB.LOCAL@LAB.LOCAL`,
    note: "Key Hardening: Kerberos realms must ALWAYS be written in UPPERCASE ('LAB.LOCAL'). Time drift between Linux client and DC must remain under 300 seconds (NTP synchronization required).",
  },
  sssd: {
    id: "sssd",
    label: "3. SSSD Identity Lookup",
    title: "Phase 3: SSSD Daemon & LDAP Identity Mapping",
    protocol: "LDAP / CLDAP (TCP/UDP 389)",
    description: "The System Security Services Daemon (SSSD) queries Active Directory via LDAP to map Windows SIDs to deterministic Linux UIDs and GIDs without requiring local /etc/passwd entries.",
    cli: `$ id administrator@lab.local
uid=1284800500(administrator@lab.local) gid=1284800513(domain users@lab.local) groups=1284800513(domain users@lab.local),1284800512(domain admins@lab.local),1284800572(denied rodc password replication group@lab.local)

$ getent passwd administrator@lab.local
administrator@lab.local:*:1284800500:1284800513:Administrator:/home/administrator@lab.local:/bin/bash`,
    note: "Performance Insight: SSSD caches credentials locally in /var/lib/sss/db, enabling offline logins even if the Domain Controller is rebooted or temporarily unreachable.",
  },
  pam: {
    id: "pam",
    label: "4. PAM Home Dir & Login",
    title: "Phase 4: PAM Stack Authentication & Home Directory Provisioning",
    protocol: "Local PAM + SSH (Port 22)",
    description: "The Pluggable Authentication Modules (PAM) stack validates credentials against SSSD and invokes pam_mkhomedir.so to dynamically create /home/%u@%d upon first successful SSH or console login.",
    cli: `$ pam-auth-update --enable mkhomedir
[sudo] password for localadmin: 

$ su - administrator@lab.local
Password: 
Creating directory '/home/administrator@lab.local'.
administrator@lab.local@srv-linux01:~$ pwd
/home/administrator@lab.local`,
    note: "Essential Step: Without 'pam_mkhomedir.so' enabled, domain users authenticate successfully but are immediately ejected because their home directory does not exist on Linux.",
  },
};

export default function ActiveDirectoryTopology() {
  const [activePhase, setActivePhase] = useState("dns");
  const [selectedNode, setSelectedNode] = useState("all");
  const phase = PHASES[activePhase];

  return (
    <div className={styles.topologyContainer} aria-label="Active Directory and SSSD Integration Architecture">
      {/* Control Bar */}
      <div className={styles.controlBar}>
        <div className={styles.flowPills} role="tablist" aria-label="Authentication Flow Steps">
          {Object.values(PHASES).map((p) => {
            const isActive = activePhase === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.flowPill} ${isActive ? styles.flowPillActive : ""}`}
                onClick={() => setActivePhase(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className={styles.statusIndicator} aria-label="System status">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>REALM: LAB.LOCAL · ENROLLED</span>
        </div>
      </div>

      {/* Visual Diagram Stage */}
      <div className={styles.diagramStage}>
        {/* Linux Client Card */}
        <div
          className={`${styles.hostCard} ${selectedNode === "linux" ? styles.hostCardSelected : ""}`}
          onClick={() => setSelectedNode(selectedNode === "linux" ? "all" : "linux")}
          tabIndex={0}
          role="button"
          aria-label="Ubuntu Linux Client: srv-linux01.lab.local"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedNode(selectedNode === "linux" ? "all" : "linux");
            }
          }}
        >
          <div className={styles.hostHeader}>
            <div className={styles.hostIconName}>
              <span className={styles.hostIcon} aria-hidden="true">🐧</span>
              <span className={styles.hostName}>srv-linux01.lab.local</span>
            </div>
            <span className={styles.hostBadge}>Client Member</span>
          </div>
          <span className={styles.hostIp}>IP: 192.168.1.50/24</span>

          <div className={styles.subComponentsList}>
            <div className={styles.subComponentItem}>
              <span>sssd.service (SSSD Daemon)</span>
              <span className={styles.subComponentPort}>Active / Enrolled</span>
            </div>
            <div className={styles.subComponentItem}>
              <span>libpam-sss (PAM Stack)</span>
              <span className={styles.subComponentPort}>mkhomedir.so</span>
            </div>
            <div className={styles.subComponentItem}>
              <span>libnss-sss (NSS Library)</span>
              <span className={styles.subComponentPort}>passwd/group</span>
            </div>
          </div>
        </div>

        {/* Transit & Active Flow Protocol */}
        <div className={styles.transitPipeline}>
          <span className={styles.protocolPill}>{phase.protocol}</span>
          <div className={styles.wireLine} />
          <span className={styles.arrowIndicator} aria-hidden="true">⇄</span>
        </div>

        {/* Windows Domain Controller Card */}
        <div
          className={`${styles.hostCard} ${selectedNode === "dc" ? styles.hostCardSelected : ""}`}
          onClick={() => setSelectedNode(selectedNode === "dc" ? "all" : "dc")}
          tabIndex={0}
          role="button"
          aria-label="Windows Server 2022 Domain Controller: dc01.lab.local"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedNode(selectedNode === "dc" ? "all" : "dc");
            }
          }}
        >
          <div className={styles.hostHeader}>
            <div className={styles.hostIconName}>
              <span className={styles.hostIcon} aria-hidden="true">🪟</span>
              <span className={styles.hostName}>dc01.lab.local</span>
            </div>
            <span className={styles.hostBadge}>Root Domain Controller</span>
          </div>
          <span className={styles.hostIp}>IP: 192.168.1.10/24</span>

          <div className={styles.subComponentsList}>
            <div className={styles.subComponentItem}>
              <span>Active Directory DS</span>
              <span className={styles.subComponentPort}>Port 389 (LDAP)</span>
            </div>
            <div className={styles.subComponentItem}>
              <span>Kerberos KDC</span>
              <span className={styles.subComponentPort}>Port 88 (TCP/UDP)</span>
            </div>
            <div className={styles.subComponentItem}>
              <span>Windows DNS Server</span>
              <span className={styles.subComponentPort}>Port 53 (SRV/A/PTR)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Panel for Selected Phase */}
      <div className={styles.inspectorPanel} aria-live="polite">
        <div className={styles.inspectorHeader}>
          <span className={styles.inspectorTitle}>{phase.title}</span>
          <span className={styles.inspectorTagline}>Verified Evidence</span>
        </div>

        <p className={styles.inspectorDesc}>{phase.description}</p>

        <div className={styles.cliTerminal}>
          <div className={styles.cliHeader}>Terminal Verification Log</div>
          <pre className={styles.cliPre}><code>{phase.cli}</code></pre>
        </div>

        <p className={styles.inspectorDesc}>
          <strong>Root-Cause Note:</strong> {phase.note}
        </p>
      </div>
    </div>
  );
}
