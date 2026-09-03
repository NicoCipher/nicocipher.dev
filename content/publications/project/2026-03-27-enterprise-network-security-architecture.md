---
type: "project"
title: "Enterprise Network Security Architecture: Hierarchical 3-Tier Switching & OSPF Routing"
slug: "enterprise-network-security-architecture"
date: "2026-03-27"
status: "complete"
domain: "networking"
summary: "Designing a resilient enterprise campus network using Cisco hierarchical 3-tier switching (Core, Distribution, Access), configuring single-area OSPF routing, and eliminating Layer 2 switching loops."
effort: "16h"
technologies:
  - "Cisco Packet Tracer"
  - "Cisco IOS"
  - "OSPF"
  - "VLANs"
  - "802.1Q Trunking"
  - "Multi-Layer Switching"
tags:
  - "Networking"
  - "Routing"
  - "OSPF"
  - "Campus Architecture"
  - "Cisco IOS"
featured: true
evidence:
  - id: "ospf-routes"
    type: "terminal"
    title: "Core Switch OSPF Routing Table Verification"
    content: |
      Core-SW01# show ip route ospf
      Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
             D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
             N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
             E1 - OSPF external type 1, E2 - OSPF external type 2

      Gateway of last resort is not set

      O    10.10.20.0/24 [110/2] via 10.0.0.2, 00:14:22, GigabitEthernet0/1
      O    10.10.30.0/24 [110/2] via 10.0.0.6, 00:14:22, GigabitEthernet0/2
      O    192.168.100.0/24 [110/11] via 10.0.0.2, 00:08:14, GigabitEthernet0/1
    language: "text"
  - id: "ospf-neighbors"
    type: "terminal"
    title: "OSPF Adjacency & Neighbor State Verification"
    content: |
      Core-SW01# show ip ospf neighbor

      Neighbor ID     Pri   State           Dead Time   Address         Interface
      10.0.0.2          1   FULL/BDR        00:00:34    10.0.0.2        GigabitEthernet0/1
      10.0.0.6          1   FULL/DR         00:00:38    10.0.0.6        GigabitEthernet0/2
    language: "text"
  - id: "core-config"
    type: "config"
    title: "Core Multi-Layer Switch Routing & OSPF Configuration"
    content: |
      ! Core-SW01 Cisco Catalyst 3560 Configuration
      hostname Core-SW01
      !
      ip routing
      !
      interface GigabitEthernet0/1
       no switchport
       ip address 10.0.0.1 255.255.255.252
       no shutdown
      !
      interface GigabitEthernet0/2
       no switchport
       ip address 10.0.0.5 255.255.255.252
       no shutdown
      !
      router ospf 1
       router-id 1.1.1.1
       network 10.0.0.0 0.0.0.3 area 0
       network 10.0.0.4 0.0.0.3 area 0
       passive-interface default
       no passive-interface GigabitEthernet0/1
       no passive-interface GigabitEthernet0/2
    language: "text"
---

## 1. Objective

Design, simulate, and validate an enterprise campus network model adhering to the Cisco 3-tier hierarchical architecture: Core, Distribution, and Access layers. The topology must provide high availability, eliminate Layer 2 broadcast storms, enable inter-VLAN routing, and establish dynamic Layer 3 route convergence using single-area Open Shortest Path First (OSPFv2).

## 2. Architecture & Topology

The topology was engineered inside Cisco Packet Tracer using Catalyst 3560 multi-layer switches and Catalyst 2960 Layer 2 access switches:

| Layer | Device Role | Hardware Model | Primary Function |
|---|---|---|---|
| **Core Layer** | `Core-SW01`, `Core-SW02` | Catalyst 3560-24PS | High-speed backbone transport, dynamic OSPF routing, no packet filtering |
| **Distribution Layer** | `Dist-SW01`, `Dist-SW02` | Catalyst 3560-24PS | Boundary routing, Switched Virtual Interfaces (SVIs), policy enforcement |
| **Access Layer** | `Access-SW01`, `Access-SW02` | Catalyst 2960-24TT | End-user device connectivity, VLAN port membership, 802.1Q trunking |

```
                       +-------------------+
                       |    Core-SW01      |
                       |  (Catalyst 3560)  |
                       +---------+---------+
                                 |
              /------------------+------------------\
             |                                       |
   +---------+---------+                   +---------+---------+
   |    Dist-SW01      |                   |    Dist-SW02      |
   | (SVIs, Routing)   |                   | (SVIs, Routing)   |
   +---------+---------+                   +---------+---------+
             |                                       |
   +---------+---------+                   +---------+---------+
   |   Access-SW01     |                   |   Access-SW02     |
   | (User VLANs 10,20)|                   | (User VLANs 30,40)|
   +---------+---------+                   +---------+---------+
             |                                       |
      [Workstations]                          [Workstations]
```

## 3. Implementation

### Layer 2 Boundary Definition & Trunking

Access switches were isolated from direct Layer 3 responsibilities. Uplinks from `Access-SW01` to `Dist-SW01` were configured as IEEE 802.1Q dot1q trunks:

```text
Access-SW01(config)# interface range FastEthernet0/1 - 2
Access-SW01(config-if-range)# switchport mode trunk
Access-SW01(config-if-range)# switchport trunk allowed vlan 10,20,99
Access-SW01(config-if-range)# no shutdown
```

### Multi-Layer Routing & SVI Gateways

At the Distribution layer, `ip routing` was enabled. Default gateways for campus subnets were hosted as Switched Virtual Interfaces (SVIs):
- VLAN 10 (Engineering): `10.10.10.1/24`
- VLAN 20 (Operations): `10.10.20.1/24`
- VLAN 99 (Management): `10.10.99.1/24`

### Dynamic Routing with OSPFv2

To replace legacy distance-vector protocols like RIP, single-area OSPF (`area 0`) was deployed on routed point-to-point `/30` transit links between Distribution and Core switches using `no switchport`.

## 4. The Friction Point

During initial interconnectivity testing between the Core and Distribution switches, two critical failures occurred:

1. **Routing Logic Loops & Neighbor Dropouts:** Inter-switch links kept dropping OSPF neighbor relationships (`INIT/DROTHER` instead of reaching `FULL`).
2. **Subnet Overlaps in VLAN Trunking:** Access switches could not resolve default gateways on newly provisioned VLANs.

### Root Cause Analysis

- **MTU & Hello Timer Discrepancy:** One transit link had an MTU mismatch due to interface encapsulation defaults, causing OSPF database descriptor (DBD) exchange to stall in the `EXSTART` state.
- **Missing `ip routing` Command:** The Catalyst 3560 acts as a standard Layer 2 switch out-of-the-box. Without executing `ip routing` in global configuration mode, SVIs were brought up but the switch kernel refused to forward packets across subnets.
- **Trunk Native VLAN Mismatch:** `Access-SW01` had Native VLAN set to 1 while `Dist-SW01` had Native VLAN set to 99, triggering CDP warning loops and dropping untagged management frames.

### The Fix

```text
Dist-SW01(config)# ip routing
Dist-SW01(config)# interface GigabitEthernet0/1
Dist-SW01(config-if)# switchport trunk native vlan 99
Dist-SW01(config-if)# exit
Dist-SW01(config)# router ospf 1
Dist-SW01(config-router)# passive-interface default
Dist-SW01(config-router)# no passive-interface GigabitEthernet0/1
```

Enabling global IP routing activated Layer 3 forwarding. Harmonizing the native VLAN on both sides of the trunk eliminated CDP error broadcasts. Explicitly configuring point-to-point transit interfaces as non-passive allowed OSPF Hello packets (multicast `224.0.0.5`) to establish bidirectional `FULL` adjacency.

## 5. What Went Wrong

- **Assumed Layer 3 Switches Route by Default:** Assumed assigning an IP address to an SVI automatically turned on Layer 3 packet switching. On Cisco Catalyst switches, SVIs remain purely accessible for management until `ip routing` is toggled globally.
- **Passive Interface Oversite:** Applied `passive-interface default` for security hardening to prevent OSPF Hello broadcasts into user access VLANs, but initially forgot to negate it on uplink interfaces (`no passive-interface Gi0/1`), which silently killed route advertisements.
- **Spanning-Tree Complexity:** Connecting multi-layer switches without pruning unused VLANs led to Spanning-Tree topology recalculations whenever access ports bounced.

## 6. Verification

1. **Adjacency Table Inspection:** Executed `show ip ospf neighbor` on `Core-SW01` and confirmed neighbors reached state `FULL/BDR` and `FULL/DR`.
2. **Routing Table Validation:** `show ip route ospf` confirmed dynamic learning of remote distribution subnets `10.10.20.0/24` and `10.10.30.0/24` with metric `[110/2]`.
3. **End-to-End ICMP Connectivity:** Workstations in VLAN 10 (`10.10.10.50`) successfully pinged servers in VLAN 30 (`10.10.30.50`) across the core backbone with 0% packet loss.
4. **Trunk Pruning Verification:** `show interface trunk` confirmed only tagged traffic for VLANs 10, 20, and 99 crossed the distribution uplinks.

## 7. Permanent Takeaway

In an enterprise campus, separation of concerns is structural. The Access layer enforces physical port security and VLAN tagging; the Distribution layer aggregates traffic, terminates Layer 2 domains, and applies policy; the Core layer moves packets at wire-speed without inspection. Mixing Layer 2 spanning-tree links with Layer 3 routed uplinks creates brittle topologies; routing as close to the distribution layer as possible shrinks broadcast domains and delivers deterministic OSPF convergence.
