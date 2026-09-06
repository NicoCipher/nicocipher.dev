"use client";

import { useState } from "react";
import styles from "./CampusTopology.module.css";

const NODES = {
  "core-sw01": {
    id: "core-sw01",
    name: "CORE-SW01 (Cisco Catalyst 3560-24PS)",
    tier: "Core Layer (L3)",
    tierId: "core",
    role: "High-Speed Backbone Routing & Inter-VLAN Default Gateway",
    ipInfo: "SVIs: 192.168.10.1/24 (V10), 192.168.20.1/24 (V20), 192.168.30.1/24 (V30)",
    interfaces: "Gi0/1 (10.0.0.1/30 Routed Transit), Vlan10, Vlan20, Vlan30",
    protocols: "OSPFv2 (Router-ID 1.1.1.1, Area 0), ip routing, 802.1Q",
    diagnostic: "Required 'no switchport' on Gi0/1 to convert L2 switchport to routed interface. OSPF network statement required inverse wildcard mask (0.0.0.255) rather than subnet mask.",
    vlans: ["vlan10", "vlan20", "vlan30", "transit"],
  },
  "transit-link": {
    id: "transit-link",
    name: "CORE <-> DIST Backbone Transit Link",
    tier: "Transit Link",
    tierId: "core",
    role: "Point-to-Point Layer 3 Routed Interconnect (OSPF Area 0)",
    ipInfo: "Subnet: 10.0.0.0/30 (Usable: 10.0.0.1 - 10.0.0.2)",
    interfaces: "CORE: Gi0/1 (10.0.0.1/30) <---> DIST: Gi0/1 (10.0.0.2/30)",
    protocols: "OSPFv2 Point-to-Point Adjacency (State: FULL/BDR)",
    diagnostic: "Neighbor relationship stalled in EXSTART until mismatched MTU and network wildcard statement were corrected.",
    vlans: ["transit"],
  },
  "dist-sw01": {
    id: "dist-sw01",
    name: "DIST-SW01 (Cisco Catalyst 2960-24TT)",
    tier: "Distribution Layer (L2/L3)",
    tierId: "distribution",
    role: "802.1Q Trunk Aggregation & Departmental Traffic Boundary",
    ipInfo: "Management IP: 192.168.10.2/24",
    interfaces: "Gi0/1 (Uplink to Core), Gi0/2 (Trunk to ACC-01), Gi0/3 (Trunk to ACC-02)",
    protocols: "802.1Q Trunking, DTP Nonegotiate, Native VLAN 99",
    diagnostic: "Native VLAN changed from default VLAN 1 to unused VLAN 99 to eliminate double-tagging VLAN hopping vulnerabilities.",
    vlans: ["vlan10", "vlan20", "vlan30", "transit"],
  },
  "acc-sw01": {
    id: "acc-sw01",
    name: "ACC-SW01 (Cisco Catalyst 2960)",
    tier: "Access Layer",
    tierId: "access",
    role: "Workstation Edge Access (Floors 1 & 2: Mgmt + Engineering)",
    ipInfo: "Management IP: 192.168.10.11/24",
    interfaces: "Gi0/1 (Trunk to Dist), Fa0/1-2 (VLAN 10 Access), Fa0/3-4 (VLAN 20 Access)",
    protocols: "Spanning Tree PortFast, BPDU Guard, 802.1Q Trunking",
    diagnostic: "Access switchports enabled with spanning-tree portfast and bpduguard to bring ports up instantly without topology loops.",
    vlans: ["vlan10", "vlan20"],
  },
  "acc-sw02": {
    id: "acc-sw02",
    name: "ACC-SW02 (Cisco Catalyst 2960)",
    tier: "Access Layer",
    tierId: "access",
    role: "Server & Operations Edge Access (Floor 3: Operations)",
    ipInfo: "Management IP: 192.168.10.12/24",
    interfaces: "Gi0/1 (Trunk to Dist), Fa0/9-10 (VLAN 30 Access)",
    protocols: "Spanning Tree PortFast, BPDU Guard, 802.1Q Trunking",
    diagnostic: "Separates server farm broadcast traffic from user desktop access switches.",
    vlans: ["vlan30"],
  },
  "pc-mgmt": {
    id: "pc-mgmt",
    name: "ADMIN-PC01 (Management)",
    tier: "VLAN 10 Endpoint",
    tierId: "access",
    role: "Network Administration & Infrastructure Monitoring Host",
    ipInfo: "IP: 192.168.10.50/24 | Gateway: 192.168.10.1 (CORE-SW01 SVI)",
    interfaces: "FastEthernet 0 connected to ACC-SW01 [Fa0/1]",
    protocols: "Static IP, SSH/HTTPS Management Access",
    diagnostic: "Directly accesses network device management SVIs across VLAN 10.",
    vlans: ["vlan10"],
  },
  "pc-eng": {
    id: "pc-eng",
    name: "ENG-WS01 (Engineering)",
    tier: "VLAN 20 Endpoint",
    tierId: "access",
    role: "Engineering Workstation (Source of cross-VLAN test ping)",
    ipInfo: "IP: 192.168.20.50/24 | Gateway: 192.168.20.1 (CORE-SW01 SVI)",
    interfaces: "FastEthernet 0 connected to ACC-SW01 [Fa0/3]",
    protocols: "VLAN 20 Client Segment, ICMP Diagnostics",
    diagnostic: "Initiated ping to OPS-SRV01 (192.168.30.50) to verify inter-VLAN routing across Core SVI gateways.",
    vlans: ["vlan20"],
  },
  "srv-ops": {
    id: "srv-ops",
    name: "OPS-SRV01 (Operations)",
    tier: "VLAN 30 Endpoint",
    tierId: "access",
    role: "Critical Operations Production Server",
    ipInfo: "IP: 192.168.30.50/24 | Gateway: 192.168.30.1 (CORE-SW01 SVI)",
    interfaces: "FastEthernet 0 connected to ACC-SW02 [Fa0/9]",
    protocols: "VLAN 30 Server Segment, OSPF Destination",
    diagnostic: "Received routed ICMP packets with 0% loss once Core Switch OSPF wildcard statement was repaired.",
    vlans: ["vlan30"],
  },
};

const VLAN_CONFIG = {
  all: { label: "All VLANs", color: "var(--accent)" },
  vlan10: { label: "VLAN 10: Management", color: "#f59e0b", subnet: "192.168.10.0/24" },
  vlan20: { label: "VLAN 20: Engineering", color: "#06b6d4", subnet: "192.168.20.0/24" },
  vlan30: { label: "VLAN 30: Operations", color: "#10b981", subnet: "192.168.30.0/24" },
  transit: { label: "Transit: OSPF Area 0", color: "#8b5cf6", subnet: "10.0.0.0/30" },
};

const TIERS = [
  { id: "all", label: "All Tiers" },
  { id: "core", label: "Core Layer" },
  { id: "distribution", label: "Distribution" },
  { id: "access", label: "Access Layer" },
];

export default function CampusTopology() {
  const [activeVlan, setActiveVlan] = useState("all");
  const [activeTier, setActiveTier] = useState("all");
  const [selectedId, setSelectedId] = useState("core-sw01");

  const selectedNode = NODES[selectedId] || NODES["core-sw01"];

  // Helper to determine node opacity/highlight
  function isNodeVisible(node) {
    if (activeTier !== "all" && node.tierId !== activeTier) return false;
    if (activeVlan !== "all" && !node.vlans.includes(activeVlan)) return false;
    return true;
  }

  function isLinkVisible(vlans, tier) {
    if (activeTier !== "all" && tier && tier !== activeTier) return false;
    if (activeVlan !== "all") {
      return vlans.includes(activeVlan);
    }
    return true;
  }

  return (
    <div className={styles.container}>
      {/* Interactive Toolbar */}
      <div className={styles.toolbar}>
        {/* VLAN Filter */}
        <div className={styles.controlGroup}>
          <span className={styles.groupLabel}>VLAN / Segment:</span>
          {Object.entries(VLAN_CONFIG).map(([key, config]) => {
            const isActive = activeVlan === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveVlan(key)}
                className={`${styles.btn} ${isActive ? styles.btnActive : ""}`}
                aria-pressed={isActive}
              >
                {key !== "all" && (
                  <span
                    className={styles.btnDot}
                    style={{ backgroundColor: config.color }}
                  />
                )}
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Tier Filter */}
        <div className={styles.controlGroup}>
          <span className={styles.groupLabel}>Tier:</span>
          {TIERS.map((tier) => {
            const isActive = activeTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTier(tier.id)}
                className={`${styles.btn} ${isActive ? styles.btnActive : ""}`}
                aria-pressed={isActive}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive SVG Architecture Canvas */}
      <div className={styles.svgCard}>
        <svg
          viewBox="0 0 820 500"
          className={styles.svg}
          role="img"
          aria-label="3-Tier Campus Network Architecture Diagram showing Core, Distribution, and Access Switching"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="distGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#182234" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#182234" />
              <stop offset="100%" stopColor="#0b1120" />
            </linearGradient>

            {/* Glowing path filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ─── TIER BACKGROUND ZONES ──────────────────────────────────── */}
          {/* Core Layer Zone */}
          <rect
            x="20"
            y="15"
            width="780"
            height="115"
            rx="8"
            fill="#141923"
            fillOpacity={activeTier === "all" || activeTier === "core" ? "0.6" : "0.15"}
            stroke="#2a3548"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="35" y="40" fill="#64748b" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" letterSpacing="0.08em">
            [ CORE LAYER ] · L3 Inter-VLAN Routing &amp; OSPF Area 0
          </text>

          {/* Distribution Layer Zone */}
          <rect
            x="20"
            y="145"
            width="780"
            height="115"
            rx="8"
            fill="#141923"
            fillOpacity={activeTier === "all" || activeTier === "distribution" ? "0.6" : "0.15"}
            stroke="#2a3548"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="35" y="170" fill="#64748b" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" letterSpacing="0.08em">
            [ DISTRIBUTION LAYER ] · 802.1Q Trunk Aggregation &amp; Security Boundary
          </text>

          {/* Access Layer Zone */}
          <rect
            x="20"
            y="275"
            width="780"
            height="210"
            rx="8"
            fill="#141923"
            fillOpacity={activeTier === "all" || activeTier === "access" ? "0.6" : "0.15"}
            stroke="#2a3548"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="35" y="300" fill="#64748b" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" letterSpacing="0.08em">
            [ ACCESS LAYER &amp; CLIENT DROPS ] · PortFast, BPDU Guard, Isolated Broadcast Domains
          </text>

          {/* ─── PHYSICAL & LOGICAL LINKS ───────────────────────────────── */}
          {/* Link: Core to Dist (Transit Link 10.0.0.0/30) */}
          <g
            className={styles.linkGroup}
            onClick={() => setSelectedId("transit-link")}
            style={{ cursor: "pointer" }}
            opacity={isLinkVisible(["transit", "vlan10", "vlan20", "vlan30"]) ? 1 : 0.15}
          >
            <line
              x1="410"
              y1="110"
              x2="410"
              y2="175"
              stroke={activeVlan === "transit" ? "#8b5cf6" : "#60a5fa"}
              strokeWidth={activeVlan === "transit" || selectedId === "transit-link" ? "3.5" : "2"}
              filter={activeVlan === "transit" ? "url(#glow)" : undefined}
            />
            {/* Transit Link Tag */}
            <rect x="350" y="132" width="120" height="20" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            <text x="410" y="146" fill="#93c5fd" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">
              10.0.0.0/30 (Gi0/1)
            </text>
          </g>

          {/* Link: Dist to Access 01 (Trunk 802.1Q) */}
          <g
            className={styles.linkGroup}
            opacity={isLinkVisible(["vlan10", "vlan20"]) ? 1 : 0.15}
          >
            <line
              x1="350"
              y1="230"
              x2="240"
              y2="320"
              stroke={activeVlan === "vlan10" ? "#f59e0b" : activeVlan === "vlan20" ? "#06b6d4" : "#94a3b8"}
              strokeWidth={activeVlan === "vlan10" || activeVlan === "vlan20" ? "3" : "2"}
              strokeDasharray={activeVlan === "all" ? "4 2" : undefined}
            />
            <text x="275" y="270" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">
              802.1Q Trunk (Gi0/2)
            </text>
          </g>

          {/* Link: Dist to Access 02 (Trunk 802.1Q) */}
          <g
            className={styles.linkGroup}
            opacity={isLinkVisible(["vlan30"]) ? 1 : 0.15}
          >
            <line
              x1="470"
              y1="230"
              x2="580"
              y2="320"
              stroke={activeVlan === "vlan30" ? "#10b981" : "#94a3b8"}
              strokeWidth={activeVlan === "vlan30" ? "3" : "2"}
              strokeDasharray={activeVlan === "all" ? "4 2" : undefined}
            />
            <text x="495" y="270" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">
              802.1Q Trunk (Gi0/3)
            </text>
          </g>

          {/* Access Drops to Endpoints */}
          {/* Drop: ACC-01 -> ADMIN-PC (VLAN 10) */}
          <g opacity={isLinkVisible(["vlan10"]) ? 1 : 0.15}>
            <line
              x1="200"
              y1="365"
              x2="150"
              y2="420"
              stroke="#f59e0b"
              strokeWidth={activeVlan === "vlan10" ? "2.5" : "1.5"}
            />
            <text x="155" y="390" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize="9">
              Fa0/1 [V10]
            </text>
          </g>

          {/* Drop: ACC-01 -> ENG-WS01 (VLAN 20) */}
          <g opacity={isLinkVisible(["vlan20"]) ? 1 : 0.15}>
            <line
              x1="260"
              y1="365"
              x2="320"
              y2="420"
              stroke="#06b6d4"
              strokeWidth={activeVlan === "vlan20" ? "2.5" : "1.5"}
            />
            <text x="295" y="395" fill="#06b6d4" fontFamily="var(--font-mono)" fontSize="9">
              Fa0/3 [V20]
            </text>
          </g>

          {/* Drop: ACC-02 -> OPS-SRV01 (VLAN 30) */}
          <g opacity={isLinkVisible(["vlan30"]) ? 1 : 0.15}>
            <line
              x1="580"
              y1="365"
              x2="580"
              y2="420"
              stroke="#10b981"
              strokeWidth={activeVlan === "vlan30" ? "2.5" : "1.5"}
            />
            <text x="590" y="395" fill="#10b981" fontFamily="var(--font-mono)" fontSize="9">
              Fa0/9 [V30]
            </text>
          </g>

          {/* ─── HARDWARE SWITCH NODES ───────────────────────────────────── */}

          {/* 1. CORE-SW01 */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "core-sw01" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("core-sw01")}
            opacity={isNodeVisible(NODES["core-sw01"]) ? 1 : 0.25}
          >
            <rect
              x="290"
              y="45"
              width="240"
              height="65"
              rx="6"
              fill="url(#coreGrad)"
              stroke={selectedId === "core-sw01" ? "var(--accent)" : "#3b82f6"}
              strokeWidth={selectedId === "core-sw01" ? "2.5" : "1.5"}
            />
            {/* Device Icon indicator */}
            <circle cx="315" cy="72" r="10" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="315" y="76" fill="#93c5fd" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle" fontWeight="700">
              L3
            </text>
            <text x="335" y="68" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="13" fontWeight="700">
              CORE-SW01
            </text>
            <text x="335" y="84" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="10">
              Cisco 3560 · OSPF RID: 1.1.1.1
            </text>
            <text x="335" y="98" fill="#60a5fa" fontFamily="var(--font-mono)" fontSize="9">
              Default Gateways: SVI 10, 20, 30
            </text>
          </g>

          {/* 2. DIST-SW01 */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "dist-sw01" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("dist-sw01")}
            opacity={isNodeVisible(NODES["dist-sw01"]) ? 1 : 0.25}
          >
            <rect
              x="300"
              y="175"
              width="220"
              height="60"
              rx="6"
              fill="url(#distGrad)"
              stroke={selectedId === "dist-sw01" ? "var(--accent)" : "#475569"}
              strokeWidth={selectedId === "dist-sw01" ? "2.5" : "1.5"}
            />
            <circle cx="325" cy="202" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <text x="325" y="206" fill="#cbd5e1" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle" fontWeight="700">
              L2
            </text>
            <text x="345" y="198" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="13" fontWeight="700">
              DIST-SW01
            </text>
            <text x="345" y="214" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="10">
              Cisco 2960 · 802.1Q Trunks
            </text>
            <text x="345" y="226" fill="#cbd5e1" fontFamily="var(--font-mono)" fontSize="9">
              Native VLAN 99 Isolation
            </text>
          </g>

          {/* 3. ACC-SW01 (Left) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "acc-sw01" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("acc-sw01")}
            opacity={isNodeVisible(NODES["acc-sw01"]) ? 1 : 0.25}
          >
            <rect
              x="140"
              y="320"
              width="190"
              height="55"
              rx="6"
              fill="url(#accGrad)"
              stroke={selectedId === "acc-sw01" ? "var(--accent)" : "#475569"}
              strokeWidth={selectedId === "acc-sw01" ? "2.5" : "1.5"}
            />
            <text x="155" y="342" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
              ACC-SW01 (Floors 1-2)
            </text>
            <text x="155" y="358" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="10">
              Access Ports: V10 &amp; V20
            </text>
          </g>

          {/* 4. ACC-SW02 (Right) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "acc-sw02" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("acc-sw02")}
            opacity={isNodeVisible(NODES["acc-sw02"]) ? 1 : 0.25}
          >
            <rect
              x="490"
              y="320"
              width="190"
              height="55"
              rx="6"
              fill="url(#accGrad)"
              stroke={selectedId === "acc-sw02" ? "var(--accent)" : "#475569"}
              strokeWidth={selectedId === "acc-sw02" ? "2.5" : "1.5"}
            />
            <text x="505" y="342" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
              ACC-SW02 (Floor 3)
            </text>
            <text x="505" y="358" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="10">
              Access Ports: V30 (Operations)
            </text>
          </g>

          {/* ─── ENDPOINTS / WORKSTATIONS ────────────────────────────────── */}

          {/* ADMIN-PC01 (VLAN 10) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "pc-mgmt" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("pc-mgmt")}
            opacity={isNodeVisible(NODES["pc-mgmt"]) ? 1 : 0.25}
          >
            <rect
              x="70"
              y="420"
              width="145"
              height="50"
              rx="4"
              fill="#181510"
              stroke="#f59e0b"
              strokeWidth={selectedId === "pc-mgmt" ? "2" : "1"}
            />
            <text x="80" y="440" fill="#fcd34d" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
              ADMIN-PC01
            </text>
            <text x="80" y="456" fill="#fde68a" fontFamily="var(--font-mono)" fontSize="9">
              192.168.10.50 (VLAN 10)
            </text>
          </g>

          {/* ENG-WS01 (VLAN 20) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "pc-eng" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("pc-eng")}
            opacity={isNodeVisible(NODES["pc-eng"]) ? 1 : 0.25}
          >
            <rect
              x="250"
              y="420"
              width="145"
              height="50"
              rx="4"
              fill="#081820"
              stroke="#06b6d4"
              strokeWidth={selectedId === "pc-eng" ? "2" : "1"}
            />
            <text x="260" y="440" fill="#67e8f9" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
              ENG-WS01
            </text>
            <text x="260" y="456" fill="#a5f3fc" fontFamily="var(--font-mono)" fontSize="9">
              192.168.20.50 (VLAN 20)
            </text>
          </g>

          {/* OPS-SRV01 (VLAN 30) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "srv-ops" ? styles.nodeSelected : ""}`}
            onClick={() => setSelectedId("srv-ops")}
            opacity={isNodeVisible(NODES["srv-ops"]) ? 1 : 0.25}
          >
            <rect
              x="510"
              y="420"
              width="145"
              height="50"
              rx="4"
              fill="#0a1a14"
              stroke="#10b981"
              strokeWidth={selectedId === "srv-ops" ? "2" : "1"}
            />
            <text x="520" y="440" fill="#6ee7b7" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
              OPS-SRV01
            </text>
            <text x="520" y="456" fill="#a7f3d0" fontFamily="var(--font-mono)" fontSize="9">
              192.168.30.50 (VLAN 30)
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Inspector Panel */}
      <div className={styles.inspector}>
        <div className={styles.inspectorHeader}>
          <div className={styles.inspectorTitleRow}>
            <span className={styles.inspectorTitle}>{selectedNode.name}</span>
            <span className={styles.inspectorTier}>{selectedNode.tier}</span>
          </div>
          <span className={styles.inspectorHint}>Click any node or link in the topology to inspect</span>
        </div>

        <div className={styles.inspectorGrid}>
          <div className={styles.inspectorField}>
            <span className={styles.inspectorLabel}>Role &amp; Responsibilities</span>
            <span className={styles.inspectorVal}>{selectedNode.role}</span>
          </div>
          <div className={styles.inspectorField}>
            <span className={styles.inspectorLabel}>Configured Interfaces &amp; IPs</span>
            <span className={styles.inspectorVal}>{selectedNode.ipInfo}</span>
          </div>
          <div className={styles.inspectorField}>
            <span className={styles.inspectorLabel}>Active Protocols &amp; Standards</span>
            <span className={styles.inspectorVal}>{selectedNode.protocols}</span>
          </div>
        </div>

        {selectedNode.diagnostic && (
          <div className={styles.inspectorDiagnostic}>
            <span className={styles.diagnosticIcon} aria-hidden="true">!</span>
            <span>
              <strong>Diagnostic / Postmortem Note: </strong>
              {selectedNode.diagnostic}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
