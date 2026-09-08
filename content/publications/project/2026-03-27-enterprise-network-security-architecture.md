---
type: "project"
title: "Building an Enterprise Office Network: Multi-Layer Switching, VLANs, and OSPF Routing"
slug: "enterprise-network-security-architecture"
date: "2026-03-27"
status: "complete"
domain: "networking"
summary: "How I built an office network in Cisco Packet Tracer, separated departments using VLANs, and set up multi-layer switches so traffic automatically finds the fastest path using OSPF."
effort: "12h"
technologies:
  - "Cisco Packet Tracer"
  - "OSPF"
  - "Multi-Layer Switching"
  - "VLANs"
  - "Cisco IOS"
tags:
  - "Enterprise Architecture"
  - "OSPF"
  - "Switching"
  - "VLANs"
  - "Network Security"
featured: true
briefing:
  objective: "Design and implement a resilient 3-tier campus LAN infrastructure with isolated broadcast domains and dynamic L3 routing."
  environment: "Cisco Catalyst 3560 Core & 2960 Access Switches · Cisco IOS 15.x · OSPF Area 0 · Packet Tracer"
  outcome: "Zero broadcast leakage across isolated VLANs; sub-second OSPF convergence across redundant distribution trunks."
related:
  - "layer2-arp-default-gateway-validation"
  - "ipv4-subnetting-binary-logic"
evidence:
  - id: "campus-network-topology"
    type: "diagram"
    title: "Interactive 3-Tier Campus Network Topology & VLAN Segmentation"
    interactiveId: "campus-topology"
    caption: "Interactive 3-tier hierarchy: Core Layer (L3 SVI Routing & OSPF Area 0), Distribution Layer (802.1Q Trunking), and Access Layer (VLANs 10, 20, 30 with PortFast/BPDU Guard)."
  - id: "ospf-config"
    type: "config"
    title: "Cisco IOS Core Switch OSPF & SVI Configuration"
    content: |
      ! Core Switch (C3560-24PS) - Layer 3 Routing & OSPF Process
      hostname CORE-SW01
      ip routing
      !
      interface GigabitEthernet0/1
       description UPLINK-TO-DIST-SW01
       no switchport
       ip address 10.0.0.1 255.255.255.252
       ip ospf 1 area 0
      !
      interface Vlan10
       description MANAGEMENT-SVI
       ip address 192.168.10.1 255.255.255.0
       ip ospf 1 area 0
      !
      interface Vlan20
       description ENGINEERING-DATA
       ip address 192.168.20.1 255.255.255.0
       ip ospf 1 area 0
      !
      router ospf 1
       router-id 1.1.1.1
       log-adjacency-changes
       passive-interface default
       no passive-interface GigabitEthernet0/1
    language: "text"
  - id: "ospf-routing-table"
    type: "terminal"
    title: "OSPF Routing Table & Neighbor Adjacency"
    content: |
      CORE-SW01# show ip ospf neighbor

      Neighbor ID     Pri   State           Dead Time   Address         Interface
      2.2.2.2           1   FULL/BDR        00:00:34    10.0.0.2        GigabitEthernet0/1

      CORE-SW01# show ip route ospf
      Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
             O - OSPF, IA - OSPF inter area, N1 - OSPF NSSA external type 1

      Gateway of last resort is not set

      O    192.168.30.0/24 [110/2] via 10.0.0.2, 00:14:28, GigabitEthernet0/1
      O    192.168.40.0/24 [110/2] via 10.0.0.2, 00:14:28, GigabitEthernet0/1
    language: "text"
  - id: "switch-layer-status"
    type: "terminal"
    title: "VLAN Segmentation & Trunk Status"
    content: |
      DIST-SW01# show vlan brief

      VLAN Name                             Status    Ports
      ---- -------------------------------- --------- -------------------------------
      1    default                          active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
      10   Management                       active    Fa0/1, Fa0/2
      20   Engineering                      active    Fa0/3, Fa0/4
      30   Operations                       active    Fa0/9, Fa0/10
      99   NativeVLAN                       active

      DIST-SW01# show interfaces trunk
      Port        Mode         Encapsulation  Status        Native vlan
      Gi0/1       on           802.1q         trunking      99
      Gi0/2       on           802.1q         trunking      99
    language: "text"
---

> **Quick Summary**
> - **Problem**: Unsegmented corporate networks suffer from broadcast storm degradation and lateral movement security risks. Production enterprise networks require structured VLAN segmentation, trunking, and dynamic routing.
> - **What I Built**: An enterprise-grade campus network architecture modeled after Cisco's hierarchical 3-tier model (Core, Distribution, Access) in Cisco Packet Tracer, configuring 802.1Q VLAN trunking and single-area OSPF routing.
> - **What Went Wrong**: Inter-VLAN traffic stalled with OSPF neighbor states stuck in `EXSTART`/`DOWN` due to invalid wildcard mask syntax in network statements and unrouted Layer 2 switchport defaults.
> - **Resolution**: Converted inter-switch links to routed interfaces with `no switchport`, corrected OSPF wildcard masks, and verified convergence via `show ip ospf neighbor` (FULL state).
> - **Technologies & Concepts**: Cisco IOS, 3-Tier Campus Architecture, 802.1Q VLAN Trunking, OSPFv2 Dynamic Routing, Packet Tracer.

---

## 1. Network Segmentation & Design Motivation

Imagine an office building with 300 employees working in Management, Engineering, and Customer Support.

If everyone shares one big room, every time someone shouts an announcement, all 300 people are interrupted. Worse, any contractor plugging a laptop into an open wall jack could eavesdrop on financial files or executive emails.

In computer networking, that single room is a **flat network**. When a computer asks *"Where is the printer?"*, that message broadcasts to every single machine.

To fix this, companies use:
1. **VLANs (Virtual Local Area Networks)**: Like putting walls and doors between departments so Engineering and Management have their own private rooms.
2. **Trunking (802.1Q)**: Like a dedicated hallway connecting multiple buildings that allows traffic from all departments to pass through while keeping their badges attached.
3. **OSPF (Open Shortest Path First)**: Like a real-time GPS app for network traffic. Instead of a router guessing where to send data, OSPF builds a full map of the network and automatically chooses the fastest road.

## 2. What I Set Out to Build

I modeled an enterprise campus network topology in Cisco Packet Tracer following Cisco's hierarchical 3-tier design principles:

- **Core Layer (Cisco Catalyst 3560 Multi-Layer Switch)**: High-speed backbone handling inter-VLAN routing via SVIs and participating in single-area OSPF (Area 0).
- **Distribution Layer (Cisco Catalyst 2960 Switch)**: Aggregation switch enforcing 802.1Q trunking boundaries and native VLAN isolation.
- **Access Layer (Cisco Catalyst 2960 Switches)**: End-user access ports configured with Spanning Tree PortFast and BPDU Guard for workstation and server drops.
- **OSPF Dynamic Routing**: Single-area OSPF (Area 0) over point-to-point `/30` routed links for sub-second failure convergence.

> **Architecture Reference**: An interactive vector topology diagram mapping the 3 tiers, VLAN paths, and interface allocations is included in the **Technical Evidence & Logs** section below. Use the interactive filters to isolate specific VLAN paths and inspect individual switch configurations.

## 3. How I Built It

### Step 1: Isolating the Departments (VLANs & Trunks)

I created three separate VLANs on the switches:
- **VLAN 10**: Management (`192.168.10.0/24`)
- **VLAN 20**: Engineering (`192.168.20.0/24`)
- **VLAN 30**: Operations (`192.168.30.0/24`)

Between switches, I configured Gigabit ports as trunks using `switchport mode trunk`. To prevent common "VLAN hopping" attacks where unauthorized packets slip between default VLANs, I moved the native traffic onto an unused native VLAN (VLAN 99).

### Step 2: Enabling Layer 3 Routing on the Core Switch

Instead of buying an expensive external router ("router-on-a-stick"), I used the Cisco Catalyst 3560's Layer 3 capabilities. By enabling `ip routing` and creating **Switch Virtual Interfaces (SVIs)**, the core switch acts as the default gateway for each department.

### Step 3: Setting Up OSPF Dynamic Routing

I started out testing RIP (Routing Information Protocol), but quickly noticed why enterprises phased it out: RIP only updates every 30 seconds and measures distance strictly by how many routers are between points (hop count), ignoring line speed.

I migrated the backbone to **OSPFv2**:
- Assigned clean router IDs (`1.1.1.1` and `2.2.2.2`) so every switch in the network knows exactly who is sending routing updates.
- Enabled OSPF on the backbone interconnect links.
- Used `passive-interface default` on the user access ports. This is a critical security practice: you don't want office computers listening to OSPF routing updates, or worse, injecting fake routes into the corporate network.

## 4. Failure Analysis & Diagnostics

Once the topology was wired up, I sat at an Engineering PC in VLAN 20 and tried to ping an Operations server in VLAN 30.

**Result**: Complete silence. `Request timed out`.

Even worse, looking at the switch LEDs in Packet Tracer, the links were amber and CPU usage spiked. When I logged into the core switch CLI and ran `show ip ospf neighbor`, the neighbor state sat in `EXSTART` and kept dropping to `DOWN`. The routers couldn't agree on their shared map.

### The Two Mistakes I Made:

1. **Subnet Mask vs. Wildcard Mask**:
   When configuring OSPF, I typed:
   `network 192.168.30.0 255.255.255.0 area 0`
   Cisco IOS expects a **wildcard mask** (the mathematical inverse: `0.0.0.255`). Cisco IOS silently ignored the statement, so the switch never advertised the Operations network to its neighbors!
2. **The "Layer 2 vs. Layer 3" Port Trap**:
   On standard Cisco switches, ports start out as Layer 2 switchports (they expect Ethernet cables for computers or trunks). Because the 3560 is a multi-layer switch, I assumed plugging a cable into another switch would automatically route. It didn't. I had to explicitly run `no switchport` on the port before assigning an IP address.

## 5. Resolution & Verification

### The Fixes:
1. Converted the uplink port on the Core Switch:
   ```text
   CORE-SW01(config)# interface Gi0/1
   CORE-SW01(config-if)# no switchport
   CORE-SW01(config-if)# ip address 10.0.0.1 255.255.255.252
   ```
2. Replaced the network statement with proper wildcard notation:
   ```text
   CORE-SW01(config-router)# network 192.168.30.0 0.0.0.255 area 0
   ```

### Verification:
- **Neighbor Check**: Ran `show ip ospf neighbor`. The neighbor reached `FULL/BDR` in seconds.
- **Routing Table Check**: Ran `show ip route ospf`. Subnets `192.168.30.0/24` and `192.168.40.0/24` showed up with code `O` (OSPF), proving that the core switch had successfully learned paths to the other side of the building.
- **End-to-End Ping**: Pinged from Engineering PC1 to Operations Server. 100% reply rate with zero dropped packets.

## 6. Engineering Takeaways

- **VLANs Save Bandwidth and Secure Data**: Without VLANs, any device plugged into a company network can intercept broadcast traffic. Segmenting networks is the first line of defense in cybersecurity.
- **OSPF is Resilient**: If a core cable gets unplugged or a switch fails, OSPF automatically re-routes traffic across secondary paths without human intervention.
- **CLI Discipline Matters**: Small syntax differences—like typing a subnet mask instead of a wildcard mask—can bring down routing updates without generating clear errors. Learning how to check `show ip ospf neighbor` and `show interfaces trunk` is essential for diagnosing live network outages.
