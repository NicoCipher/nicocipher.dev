"use client";

import { useState } from "react";
import styles from "./CampusTopology.module.css";

const NODES_DATA = {
  "core-sw01": {
    id: "core-sw01",
    name: "CORE-SW01",
    model: "Cisco Catalyst 3560-24PS",
    tier: "Core Layer",
    role: "L3 Inter-VLAN Routing & OSPF Area 0 Backbone",
    interfaces: "Gi0/1 (10.0.0.1/30 Routed Transit), Vlan10 (.10.1), Vlan20 (.20.1), Vlan30 (.30.1)",
    vlans: ["vlan10", "vlan20", "vlan30", "transit"],
    protocols: "OSPFv2 (Router-ID 1.1.1.1, Area 0), SVI Routing (ip routing)",
    status: "ACTIVE · 3 SVIs UP · OSPF FULL",
    cli: `CORE-SW01(config)# ip routing
CORE-SW01(config)# interface GigabitEthernet0/1
CORE-SW01(config-if)# no switchport
CORE-SW01(config-if)# ip address 10.0.0.1 255.255.255.252
CORE-SW01(config)# router ospf 1
CORE-SW01(config-router)# router-id 1.1.1.1
CORE-SW01(config-router)# network 192.168.30.0 0.0.0.255 area 0`,
    note: "Key Lesson: 'no switchport' is required to convert a Layer 2 switchport to a routed Layer 3 port. OSPF network statements expect inverse wildcard masks (0.0.0.255).",
  },
  "transit-link": {
    id: "transit-link",
    name: "Transit Link (10.0.0.0/30)",
    model: "Point-to-Point /30 Routed Interconnect",
    tier: "Backbone",
    role: "OSPF Adjacency & Inter-Switch Transit Trunk",
    interfaces: "CORE: Gi0/1 (10.0.0.1/30) <---> DIST: Gi0/1 (10.0.0.2/30)",
    vlans: ["transit"],
    protocols: "OSPFv2 Point-to-Point Adjacency (State: FULL/BDR)",
    status: "CONNECTED · 0% PACKET LOSS",
    cli: `CORE-SW01# show ip ospf neighbor
Neighbor ID   Pri   State      Dead Time   Address   Interface
2.2.2.2         1   FULL/BDR   00:00:34    10.0.0.2  Gi0/1

CORE-SW01# show ip route ospf
O   192.168.30.0/24 [110/2] via 10.0.0.2, 00:14:28, Gi0/1`,
    note: "Point-to-point /30 mask wastes no addresses (only 2 host IPs: .1 and .2). Sub-second convergence upon physical link severance.",
  },
  "dist-sw01": {
    id: "dist-sw01",
    name: "DIST-SW01",
    model: "Cisco Catalyst 2960-24TT",
    tier: "Distribution Layer",
    role: "802.1Q Trunk Aggregation & Security Boundary Enforcement",
    interfaces: "Gi0/1 (Uplink to Core), Gi0/2 (Trunk to ACC-01), Gi0/3 (Trunk to ACC-02)",
    vlans: ["vlan10", "vlan20", "vlan30", "transit"],
    protocols: "802.1Q Trunking, Native VLAN 99, DTP Nonegotiate",
    status: "TRUNKING · NATIVE VLAN 99",
    cli: `DIST-SW01(config)# interface range Gi0/1 - 3
DIST-SW01(config-if-range)# switchport mode trunk
DIST-SW01(config-if-range)# switchport trunk native vlan 99
DIST-SW01(config-if-range)# switchport trunk allowed vlan 10,20,30,99
DIST-SW01(config-if-range)# switchport nonegotiate`,
    note: "Security Hardening: Native traffic moved from default VLAN 1 to unused VLAN 99 to prevent VLAN hopping (double-tagging attacks). DTP disabled.",
  },
  "acc-sw01": {
    id: "acc-sw01",
    name: "ACC-SW01",
    model: "Cisco Catalyst 2960",
    tier: "Access Layer",
    role: "Workstation Edge Access (Floors 1 & 2: Mgmt + Engineering)",
    interfaces: "Gi0/1 (Trunk to Dist), Fa0/1-2 (VLAN 10 Mgmt), Fa0/3-4 (VLAN 20 Eng)",
    vlans: ["vlan10", "vlan20"],
    protocols: "Spanning Tree PortFast, BPDU Guard, 802.1Q",
    status: "ACCESS UP · PORTFAST ENABLED",
    cli: `ACC-SW01(config)# interface range Fa0/1 - 4
ACC-SW01(config-if-range)# switchport mode access
ACC-SW01(config-if-range)# spanning-tree portfast
ACC-SW01(config-if-range)# spanning-tree bpduguard enable
ACC-SW01(config)# interface range Fa0/1 - 2
ACC-SW01(config-if-range)# switchport access vlan 10`,
    note: "Edge ports transition to forwarding state immediately via PortFast; BPDU Guard auto-disables ports if an unauthorized switch is plugged in.",
  },
  "acc-sw02": {
    id: "acc-sw02",
    name: "ACC-SW02",
    model: "Cisco Catalyst 2960",
    tier: "Access Layer",
    role: "Server & Operations Edge Access (Floor 3: Operations)",
    interfaces: "Gi0/1 (Trunk to Dist), Fa0/9-10 (VLAN 30 Ops)",
    vlans: ["vlan30"],
    protocols: "Spanning Tree PortFast, BPDU Guard, 802.1Q",
    status: "ACCESS UP · PORTFAST ENABLED",
    cli: `ACC-SW02(config)# interface range Fa0/9 - 10
ACC-SW02(config-if-range)# switchport mode access
ACC-SW02(config-if-range)# switchport access vlan 30
ACC-SW02(config-if-range)# spanning-tree portfast
ACC-SW02(config-if-range)# spanning-tree bpduguard enable`,
    note: "Dedicated access switch isolating high-volume server traffic in VLAN 30 from client desktop broadcast storms.",
  },
  "pc-mgmt": {
    id: "pc-mgmt",
    name: "ADMIN-PC01",
    model: "Management Workstation",
    tier: "Endpoint (VLAN 10)",
    role: "Network Administration & Device Management Station",
    interfaces: "192.168.10.50/24 (Default Gateway: 192.168.10.1)",
    vlans: ["vlan10"],
    protocols: "VLAN 10 Access Port, SSH/HTTPS Management Access",
    status: "CONNECTED · PORT Fa0/1",
    cli: `ADMIN-PC01:~$ ip addr show eth0
inet 192.168.10.50/24 brd 192.168.10.255
ADMIN-PC01:~$ ssh admin@192.168.10.1
Password: ***********
CORE-SW01#`,
    note: "Management network segmented into private VLAN 10 to restrict CLI and SNMP access to authorized administrative devices only.",
  },
  "pc-eng": {
    id: "pc-eng",
    name: "ENG-WS01",
    model: "Engineering Workstation",
    tier: "Endpoint (VLAN 20)",
    role: "Engineering Team Workstation (Source of Ping Validation)",
    interfaces: "192.168.20.50/24 (Default Gateway: 192.168.20.1)",
    vlans: ["vlan20"],
    protocols: "VLAN 20 Access Port, ICMP Echo Diagnostics",
    status: "CONNECTED · PORT Fa0/3",
    cli: `ENG-WS01:~$ ping -c 4 192.168.30.50
PING 192.168.30.50 (192.168.30.50): 56 data bytes
64 bytes from 192.168.30.50: icmp_seq=0 ttl=126 time=0.92 ms
64 bytes from 192.168.30.50: icmp_seq=1 ttl=126 time=0.81 ms
--- 192.168.30.50 ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss`,
    note: "Cross-VLAN test: traffic egresses VLAN 20, routes across CORE-SW01 SVIs, traverses OSPF Area 0, and reaches OPS-SRV01 in VLAN 30.",
  },
  "srv-ops": {
    id: "srv-ops",
    name: "OPS-SRV01",
    model: "Operations Server",
    tier: "Endpoint (VLAN 30)",
    role: "Production Operations & Monitoring Application Server",
    interfaces: "192.168.30.50/24 (Default Gateway: 192.168.30.1)",
    vlans: ["vlan30"],
    protocols: "VLAN 30 Access Port, SVI Gateway Destination",
    status: "ONLINE · PORT Fa0/9",
    cli: `OPS-SRV01:~$ ip route
default via 192.168.30.1 dev eth0
192.168.30.0/24 dev eth0 proto kernel scope link src 192.168.30.50
OPS-SRV01:~$ systemctl status monitoring-agent
● monitoring.service - Active (running)`,
    note: "Server segment isolated in VLAN 30 to limit exposure to broadcast storms originating from desktop segments.",
  },
};

const FILTERS = [
  { id: "all", label: "Overview", color: "var(--text-secondary)" },
  { id: "vlan10", label: "VLAN 10 (Mgmt)", color: "#f59e0b", subnet: "192.168.10.0/24" },
  { id: "vlan20", label: "VLAN 20 (Eng)", color: "#38bdf8", subnet: "192.168.20.0/24" },
  { id: "vlan30", label: "VLAN 30 (Ops)", color: "#34d399", subnet: "192.168.30.0/24" },
  { id: "transit", label: "OSPF Transit (/30)", color: "#a855f7", subnet: "10.0.0.0/30" },
];

export default function CampusTopology() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("core-sw01");

  const selectedNode = NODES_DATA[selectedId] || NODES_DATA["core-sw01"];

  function isHighlighted(vlans) {
    if (activeFilter === "all") return true;
    return vlans.includes(activeFilter);
  }

  function getLinkOpacity(vlans) {
    if (activeFilter === "all") return 1;
    return vlans.includes(activeFilter) ? 1 : 0.12;
  }

  function getNodeOpacity(node) {
    if (activeFilter === "all") return 1;
    return node.vlans.includes(activeFilter) ? 1 : 0.2;
  }

  return (
    <div className={styles.container}>
      {/* ─── Top Control Bar ────────────────────────────────────────────── */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <span className={styles.topologyTitle}>3-Tier Campus Network Topology</span>
          <span className={styles.statusIndicator}>
            <span className={styles.statusPulse} aria-hidden="true" />
            OSPF Area 0 · Converged
          </span>
        </div>

        <div className={styles.pillGroup} role="tablist" aria-label="Topology Layer and VLAN Filters">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(f.id)}
                className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ""}`}
                style={isActive ? { borderColor: f.color, color: f.color } : undefined}
              >
                {f.id !== "all" && (
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: f.color }}
                  />
                )}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Vector Topology Canvas ─────────────────────────────────────── */}
      <div className={styles.canvasWrapper}>
        <svg
          viewBox="0 0 840 520"
          className={styles.svg}
          role="img"
          aria-label="Cisco 3-Tier Enterprise Network Topology Diagram"
        >
          <defs>
            {/* Subtle Blueprint Dot Grid */}
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#1e2638" />
            </pattern>

            {/* Gradients */}
            <linearGradient id="switchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e2536" />
              <stop offset="100%" stopColor="#111622" />
            </linearGradient>
            <linearGradient id="hostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#161c28" />
              <stop offset="100%" stopColor="#0d1117" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="840" height="520" fill="url(#dotGrid)" />

          {/* ─── TIER ANNOTATIONS (Left Guide Rails) ────────────────────── */}
          <g opacity="0.7">
            {/* Core Tier Header */}
            <line x1="30" y1="20" x2="30" y2="120" stroke="#334155" strokeWidth="1.5" />
            <text x="36" y="32" fill="#64748b" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" letterSpacing="0.08em">
              CORE LAYER (L3)
            </text>
            <text x="36" y="44" fill="#475569" fontFamily="var(--font-mono)" fontSize="8">
              OSPF Backbone &amp; SVI Gateways
            </text>

            {/* Dist Tier Header */}
            <line x1="30" y1="155" x2="30" y2="250" stroke="#334155" strokeWidth="1.5" />
            <text x="36" y="167" fill="#64748b" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" letterSpacing="0.08em">
              DISTRIBUTION LAYER
            </text>
            <text x="36" y="179" fill="#475569" fontFamily="var(--font-mono)" fontSize="8">
              802.1Q Aggregation · Native 99
            </text>

            {/* Access Tier Header */}
            <line x1="30" y1="285" x2="30" y2="495" stroke="#334155" strokeWidth="1.5" />
            <text x="36" y="297" fill="#64748b" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" letterSpacing="0.08em">
              ACCESS &amp; WORKSTATIONS
            </text>
            <text x="36" y="309" fill="#475569" fontFamily="var(--font-mono)" fontSize="8">
              PortFast · BPDU Guard · VLAN Drops
            </text>
          </g>

          {/* Subtle Horizontal Tier Separators */}
          <line x1="18" y1="135" x2="822" y2="135" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="18" y1="268" x2="822" y2="268" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

          {/* ─── CABLING & LINKS ────────────────────────────────────────── */}

          {/* 1. Core-to-Distribution Transit Link (Gi0/1 <-> Gi0/1) */}
          <g
            className={styles.linkLine}
            opacity={getLinkOpacity(["transit", "vlan10", "vlan20", "vlan30"])}
            onClick={() => setSelectedId("transit-link")}
            style={{ cursor: "pointer" }}
          >
            <line
              x1="420"
              y1="96"
              x2="420"
              y2="175"
              stroke={activeFilter === "transit" ? "#c084fc" : "#3b82f6"}
              strokeWidth={activeFilter === "transit" || selectedId === "transit-link" ? "3" : "1.8"}
              strokeDasharray={activeFilter === "transit" ? "6 4" : undefined}
            />
            {/* Core Port Badge */}
            <rect x="388" y="104" width="30" height="13" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <text x="403" y="113" fill="#94a3b8" textAnchor="middle" className={styles.portBadge}>Gi0/1</text>

            {/* Dist Port Badge */}
            <rect x="388" y="152" width="30" height="13" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <text x="403" y="161" fill="#94a3b8" textAnchor="middle" className={styles.portBadge}>Gi0/1</text>

            {/* Transit Link Tag Pill */}
            <rect x="428" y="126" width="112" height="18" rx="3" fill="#131822" stroke="#3b82f6" strokeWidth="0.8" />
            <text x="484" y="138" fill="#93c5fd" fontFamily="var(--font-mono)" fontSize="8.5" textAnchor="middle" fontWeight="500">
              10.0.0.0/30 (OSPF Area 0)
            </text>
          </g>

          {/* 2. Trunk: DIST-SW01 (Gi0/2) to ACC-SW01 (Gi0/1) */}
          <g
            className={styles.linkLine}
            opacity={getLinkOpacity(["vlan10", "vlan20"])}
          >
            <path
              d="M 370 233 L 370 252 L 245 252 L 245 295"
              fill="none"
              stroke={activeFilter === "vlan10" ? "#f59e0b" : activeFilter === "vlan20" ? "#38bdf8" : "#475569"}
              strokeWidth={activeFilter === "vlan10" || activeFilter === "vlan20" ? "2.5" : "1.5"}
            />
            {/* Port Badges */}
            <rect x="348" y="236" width="30" height="13" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <text x="363" y="245" fill="#94a3b8" textAnchor="middle" className={styles.portBadge}>Gi0/2</text>

            <rect x="230" y="278" width="30" height="13" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <text x="245" y="287" fill="#94a3b8" textAnchor="middle" className={styles.portBadge}>Gi0/1</text>

            {/* Trunk Label */}
            <rect x="262" y="244" width="92" height="16" rx="2" fill="#0b0f17" stroke="#334155" strokeWidth="0.7" />
            <text x="308" y="255" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="8" textAnchor="middle">
              Trunk (802.1Q / V99)
            </text>
          </g>

          {/* 3. Trunk: DIST-SW01 (Gi0/3) to ACC-SW02 (Gi0/1) */}
          <g
            className={styles.linkLine}
            opacity={getLinkOpacity(["vlan30"])}
          >
            <path
              d="M 470 233 L 470 252 L 595 252 L 595 295"
              fill="none"
              stroke={activeFilter === "vlan30" ? "#34d399" : "#475569"}
              strokeWidth={activeFilter === "vlan30" ? "2.5" : "1.5"}
            />
            {/* Port Badges */}
            <rect x="462" y="236" width="30" height="13" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <text x="477" y="245" fill="#94a3b8" textAnchor="middle" className={styles.portBadge}>Gi0/3</text>

            <rect x="580" y="278" width="30" height="13" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <text x="595" y="287" fill="#94a3b8" textAnchor="middle" className={styles.portBadge}>Gi0/1</text>

            {/* Trunk Label */}
            <rect x="488" y="244" width="92" height="16" rx="2" fill="#0b0f17" stroke="#334155" strokeWidth="0.7" />
            <text x="534" y="255" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="8" textAnchor="middle">
              Trunk (802.1Q / V99)
            </text>
          </g>

          {/* 4. Drop: ACC-SW01 (Fa0/1) -> ADMIN-PC01 (VLAN 10) */}
          <g className={styles.linkLine} opacity={getLinkOpacity(["vlan10"])}>
            <path
              d="M 195 353 L 195 385 L 140 385 L 140 422"
              fill="none"
              stroke="#f59e0b"
              strokeWidth={activeFilter === "vlan10" ? "2.5" : "1.5"}
            />
            <rect x="180" y="358" width="30" height="13" rx="2" fill="#0f172a" stroke="#f59e0b" strokeWidth="0.8" />
            <text x="195" y="367" fill="#fcd34d" textAnchor="middle" className={styles.portBadge}>Fa0/1</text>
            <text x="145" y="398" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize="8">VLAN 10</text>
          </g>

          {/* 5. Drop: ACC-SW01 (Fa0/3) -> ENG-WS01 (VLAN 20) */}
          <g className={styles.linkLine} opacity={getLinkOpacity(["vlan20"])}>
            <path
              d="M 285 353 L 285 385 L 340 385 L 340 422"
              fill="none"
              stroke="#38bdf8"
              strokeWidth={activeFilter === "vlan20" ? "2.5" : "1.5"}
            />
            <rect x="270" y="358" width="30" height="13" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
            <text x="285" y="367" fill="#7dd3fc" textAnchor="middle" className={styles.portBadge}>Fa0/3</text>
            <text x="315" y="398" fill="#38bdf8" fontFamily="var(--font-mono)" fontSize="8">VLAN 20</text>
          </g>

          {/* 6. Drop: ACC-SW02 (Fa0/9) -> OPS-SRV01 (VLAN 30) */}
          <g className={styles.linkLine} opacity={getLinkOpacity(["vlan30"])}>
            <line
              x1="595"
              y1="353"
              x2="595"
              y2="422"
              stroke="#34d399"
              strokeWidth={activeFilter === "vlan30" ? "2.5" : "1.5"}
            />
            <rect x="580" y="362" width="30" height="13" rx="2" fill="#0f172a" stroke="#34d399" strokeWidth="0.8" />
            <text x="595" y="371" fill="#6ee7b7" textAnchor="middle" className={styles.portBadge}>Fa0/9</text>
            <text x="605" y="398" fill="#34d399" fontFamily="var(--font-mono)" fontSize="8">VLAN 30</text>
          </g>

          {/* ─── HARDWARE DEVICES & WORKSTATIONS ─────────────────────────── */}

          {/* 1. CORE-SW01 (Cisco 3560) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "core-sw01" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["core-sw01"])}
            onClick={() => setSelectedId("core-sw01")}
          >
            <rect
              x="300"
              y="38"
              width="240"
              height="58"
              rx="4"
              className={styles.nodeCard}
              fill="url(#switchGrad)"
              stroke="#2e3d56"
              strokeWidth="1"
            />
            {/* Cisco L3 Routing Badge Icon */}
            <g transform="translate(312, 53)">
              <circle cx="14" cy="14" r="13" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
              {/* Crossed bidirectional arrows */}
              <path d="M 6 14 L 22 14 M 14 6 L 14 22" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 9 11 L 6 14 L 9 17 M 19 11 L 22 14 L 19 17 M 11 9 L 14 6 L 17 9 M 11 19 L 14 22 L 17 19" fill="none" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="350" y="57" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
              CORE-SW01
            </text>
            <text x="350" y="70" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">
              Cisco Catalyst 3560-24PS · RID: 1.1.1.1
            </text>
            <text x="350" y="83" fill="#60a5fa" fontFamily="var(--font-mono)" fontSize="8.5">
              SVIs: 192.168.10.1 · .20.1 · .30.1
            </text>
          </g>

          {/* 2. DIST-SW01 (Cisco 2960) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "dist-sw01" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["dist-sw01"])}
            onClick={() => setSelectedId("dist-sw01")}
          >
            <rect
              x="310"
              y="175"
              width="220"
              height="58"
              rx="4"
              className={styles.nodeCard}
              fill="url(#switchGrad)"
              stroke="#2e3d56"
              strokeWidth="1"
            />
            {/* Cisco L2 Switching Badge Icon */}
            <g transform="translate(322, 190)">
              <rect x="1" y="4" width="24" height="20" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <path d="M 5 11 L 21 11 M 21 17 L 5 17" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 8 9 L 5 11 L 8 13 M 18 15 L 21 17 L 18 19" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="356" y="195" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
              DIST-SW01
            </text>
            <text x="356" y="208" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">
              Cisco Catalyst 2960-24TT
            </text>
            <text x="356" y="221" fill="#cbd5e1" fontFamily="var(--font-mono)" fontSize="8.5">
              802.1Q Aggregation · Native VLAN 99
            </text>
          </g>

          {/* 3. ACC-SW01 (Access Floors 1-2) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "acc-sw01" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["acc-sw01"])}
            onClick={() => setSelectedId("acc-sw01")}
          >
            <rect
              x="145"
              y="295"
              width="200"
              height="58"
              rx="4"
              className={styles.nodeCard}
              fill="url(#switchGrad)"
              stroke="#2e3d56"
              strokeWidth="1"
            />
            <g transform="translate(155, 310)">
              <rect x="1" y="4" width="22" height="20" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <path d="M 5 11 L 19 11 M 19 17 L 5 17" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <text x="186" y="315" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
              ACC-SW01
            </text>
            <text x="186" y="328" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">
              Floors 1 &amp; 2 (Mgmt + Eng)
            </text>
            <text x="186" y="341" fill="#cbd5e1" fontFamily="var(--font-mono)" fontSize="8.5">
              PortFast &amp; BPDU Guard Enabled
            </text>
          </g>

          {/* 4. ACC-SW02 (Access Floor 3 - Operations) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "acc-sw02" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["acc-sw02"])}
            onClick={() => setSelectedId("acc-sw02")}
          >
            <rect
              x="495"
              y="295"
              width="200"
              height="58"
              rx="4"
              className={styles.nodeCard}
              fill="url(#switchGrad)"
              stroke="#2e3d56"
              strokeWidth="1"
            />
            <g transform="translate(505, 310)">
              <rect x="1" y="4" width="22" height="20" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <path d="M 5 11 L 19 11 M 19 17 L 5 17" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <text x="536" y="315" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
              ACC-SW02
            </text>
            <text x="536" y="328" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">
              Floor 3 (Operations Server Farm)
            </text>
            <text x="536" y="341" fill="#cbd5e1" fontFamily="var(--font-mono)" fontSize="8.5">
              Isolated Server Segment (VLAN 30)
            </text>
          </g>

          {/* ─── ENDPOINT HOSTS ─────────────────────────────────────────── */}

          {/* 5. ADMIN-PC01 (VLAN 10) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "pc-mgmt" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["pc-mgmt"])}
            onClick={() => setSelectedId("pc-mgmt")}
          >
            <rect
              x="65"
              y="422"
              width="150"
              height="54"
              rx="4"
              className={styles.nodeCard}
              fill="url(#hostGrad)"
              stroke={activeFilter === "vlan10" || selectedId === "pc-mgmt" ? "#f59e0b" : "#334155"}
              strokeWidth="1"
            />
            {/* Terminal Monitor Icon */}
            <g transform="translate(75, 434)">
              <rect x="1" y="1" width="18" height="14" rx="2" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <line x1="6" y1="18" x2="14" y2="18" stroke="#f59e0b" strokeWidth="1" />
              <line x1="10" y1="15" x2="10" y2="18" stroke="#f59e0b" strokeWidth="1" />
              <text x="4" y="10" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize="7" fontWeight="bold">&gt;_</text>
            </g>
            <text x="104" y="441" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
              ADMIN-PC01
            </text>
            <text x="104" y="454" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize="9">
              192.168.10.50
            </text>
            <text x="104" y="466" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="8">
              GW: 192.168.10.1 (SVI)
            </text>
          </g>

          {/* 6. ENG-WS01 (VLAN 20) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "pc-eng" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["pc-eng"])}
            onClick={() => setSelectedId("pc-eng")}
          >
            <rect
              x="265"
              y="422"
              width="150"
              height="54"
              rx="4"
              className={styles.nodeCard}
              fill="url(#hostGrad)"
              stroke={activeFilter === "vlan20" || selectedId === "pc-eng" ? "#38bdf8" : "#334155"}
              strokeWidth="1"
            />
            <g transform="translate(275, 434)">
              <rect x="1" y="1" width="18" height="14" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <line x1="6" y1="18" x2="14" y2="18" stroke="#38bdf8" strokeWidth="1" />
              <line x1="10" y1="15" x2="10" y2="18" stroke="#38bdf8" strokeWidth="1" />
              <text x="4" y="10" fill="#38bdf8" fontFamily="var(--font-mono)" fontSize="7" fontWeight="bold">&gt;_</text>
            </g>
            <text x="304" y="441" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
              ENG-WS01
            </text>
            <text x="304" y="454" fill="#38bdf8" fontFamily="var(--font-mono)" fontSize="9">
              192.168.20.50
            </text>
            <text x="304" y="466" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="8">
              GW: 192.168.20.1 (SVI)
            </text>
          </g>

          {/* 7. OPS-SRV01 (VLAN 30) */}
          <g
            className={`${styles.nodeGroup} ${selectedId === "srv-ops" ? styles.nodeGroupSelected : ""}`}
            opacity={getNodeOpacity(NODES_DATA["srv-ops"])}
            onClick={() => setSelectedId("srv-ops")}
          >
            <rect
              x="520"
              y="422"
              width="150"
              height="54"
              rx="4"
              className={styles.nodeCard}
              fill="url(#hostGrad)"
              stroke={activeFilter === "vlan30" || selectedId === "srv-ops" ? "#34d399" : "#334155"}
              strokeWidth="1"
            />
            {/* Server Rack Unit Icon */}
            <g transform="translate(530, 434)">
              <rect x="1" y="1" width="18" height="6" rx="1" fill="#0f172a" stroke="#34d399" strokeWidth="0.8" />
              <circle cx="5" cy="4" r="1" fill="#34d399" />
              <circle cx="8" cy="4" r="1" fill="#34d399" />
              <rect x="1" y="9" width="18" height="6" rx="1" fill="#0f172a" stroke="#34d399" strokeWidth="0.8" />
              <circle cx="5" cy="12" r="1" fill="#34d399" />
              <circle cx="8" cy="12" r="1" fill="#34d399" />
            </g>
            <text x="559" y="441" fill="#f8fafc" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
              OPS-SRV01
            </text>
            <text x="559" y="454" fill="#34d399" fontFamily="var(--font-mono)" fontSize="9">
              192.168.30.50
            </text>
            <text x="559" y="466" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="8">
              GW: 192.168.30.1 (SVI)
            </text>
          </g>
        </svg>
      </div>

      {/* ─── Operational Device & CLI Inspector ─────────────────────────── */}
      <div className={styles.inspector}>
        <div className={styles.inspectorTop}>
          <div className={styles.inspectorDevice}>
            <span className={styles.inspectorDeviceName}>{selectedNode.name}</span>
            <span className={styles.inspectorTierBadge}>{selectedNode.tier}</span>
            {selectedNode.model && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-tertiary)" }}>
                ({selectedNode.model})
              </span>
            )}
          </div>
          <span className={styles.inspectorStatus}>
            <span className={styles.statusPulse} style={{ width: "5px", height: "5px" }} />
            {selectedNode.status}
          </span>
        </div>

        <div className={styles.inspectorBody}>
          {/* Specifications Column */}
          <div className={styles.specsColumn}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Architectural Role</span>
              <span className={styles.specVal}>{selectedNode.role}</span>
            </div>

            <div className={styles.specRow}>
              <span className={styles.specLabel}>Interface &amp; IP Addressing</span>
              <span className={styles.specVal}>{selectedNode.interfaces}</span>
            </div>

            <div className={styles.specRow}>
              <span className={styles.specLabel}>Protocols &amp; Standards</span>
              <span className={styles.specVal}>{selectedNode.protocols}</span>
            </div>

            {selectedNode.note && (
              <div className={styles.specRow} style={{ marginTop: "4px" }}>
                <span className={styles.specLabel}>Engineering Postmortem Diagnostic</span>
                <span className={styles.specVal} style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                  {selectedNode.note}
                </span>
              </div>
            )}
          </div>

          {/* Cisco CLI Running-Config Snippet */}
          <div className={styles.cliColumn}>
            <div className={styles.cliHeader}>
              <span>Running-Config / Verification Log</span>
              <span>Cisco IOS</span>
            </div>
            <pre className={styles.cliContent}>
              <code>{selectedNode.cli}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
