---
type: "lab"
title: "Layer 2 Frame Switching & Boundary Diagnostics: ARP Resolution and the Default Gateway Fallacy"
slug: "layer2-arp-default-gateway-validation"
date: "2026-02-13"
status: "complete"
domain: "networking"
summary: "Empirical validation of Layer 2 Ethernet MAC address forwarding versus Layer 3 IP routing, proving intra-subnet communication operates without a gateway, and diagnosing off-boundary subnet timeouts."
effort: "4h"
technologies:
  - "Cisco Packet Tracer"
  - "ARP"
  - "ICMP"
  - "Ethernet"
  - "Layer 2 Switching"
tags:
  - "Packet Tracer"
  - "ARP"
  - "Switching"
  - "Subnetting"
  - "Troubleshooting"
featured: false
related:
  - "ipv4-subnetting-binary-logic"
  - "enterprise-network-security-architecture"
evidence:
  - id: "intra-subnet-arp"
    type: "terminal"
    title: "Intra-Subnet ARP Table & Ping Validation (No Gateway)"
    content: |
      PC1> ipconfig
      FastEthernet0 IP Address..................: 192.168.1.10
      Subnet Mask...............................: 255.255.255.0
      Default Gateway...........................: 0.0.0.0

      PC1> ping 192.168.1.20
      Pinging 192.168.1.20 with 32 bytes of data:
      Reply from 192.168.1.20: bytes=32 time=1ms TTL=128
      Reply from 192.168.1.20: bytes=32 time=0ms TTL=128
      Reply from 192.168.1.20: bytes=32 time=0ms TTL=128

      PC1> arp -a
      Internet Address      Physical Address      Type
      192.168.1.20          0001.42A3.9B12        dynamic
    language: "text"
  - id: "off-boundary-failure"
    type: "terminal"
    title: "Off-Boundary Subnet Ping Timeout (Host .70 on .48-.63)"
    content: |
      PC1> ipconfig
      FastEthernet0 IP Address..................: 192.168.1.50
      Subnet Mask...............................: 255.255.255.240
      Default Gateway...........................: 0.0.0.0

      PC1> ping 192.168.1.70
      Pinging 192.168.1.70 with 32 bytes of data:
      Request timed out.
      Request timed out.
      Request timed out.
      Request timed out.

      Ping statistics for 192.168.1.70:
          Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)

      PC1> arp -a
      No ARP Entries Found.
    language: "text"
  - id: "frame-packet-flow"
    type: "snippet"
    title: "Host Decision Logic: Local ARP vs. Default Gateway"
    content: |
      Step 1: Host evaluates destination IP against local subnet mask:
              (Destination_IP AND Host_Subnet_Mask) == (Host_IP AND Host_Subnet_Mask)

      Step 2A (MATCH = LOCAL SUB-NETWORK):
              1. Check local ARP cache for Destination_IP MAC address.
              2. If missing, broadcast ARP Request: "Who has Destination_IP? Tell Host_IP"
              3. Encapsulate packet in Ethernet Frame with Destination MAC = Target MAC.
              4. Transmit frame directly via Layer 2 switch. (NO GATEWAY INVOLVED).

      Step 2B (MISMATCH = REMOTE SUB-NETWORK):
              1. Host cannot send direct ARP for remote IP.
              2. Check local configuration for Default Gateway IP.
              3. If Default Gateway is 0.0.0.0 (unconfigured): DISCARD PACKET IMMEDIATELY.
              4. If configured: Send ARP Request for Default Gateway MAC address.
    language: "text"
---

## 1. Objective

Perform an empirical investigation in Cisco Packet Tracer to isolate the boundary between Layer 2 Ethernet frame switching and Layer 3 IP packet forwarding. Specifically, test and disprove the persistent operational misconception that endpoints require a configured default gateway to communicate on a local area network, and diagnose the packet-level mechanics of subnet boundary timeouts.

## 2. Environment Setup

The laboratory environment was constructed inside Cisco Packet Tracer using minimal components to isolate variable behaviors:

| Component | Identifier | Hardware Model | IP Address | Subnet Mask | Default Gateway |
|---|---|---|---|---|---|
| **Host A** | `PC1` | Desktop Workstation | `192.168.1.10` / `192.168.1.50` | `/24` / `/28` | `0.0.0.0` (None) |
| **Host B** | `PC2` | Desktop Workstation | `192.168.1.20` / `192.168.1.70` | `/24` / `/28` | `0.0.0.0` (None) |
| **Switch** | `SW1` | Cisco Catalyst 2960-24TT | Layer 2 Unmanaged Config | Layer 2 Only | N/A |

The topology contains zero routers, no Layer 3 routing engines, and no Internet uplink.

## 3. Implementation & Fault Injection

### Experiment 1: The Intra-Subnet Pure LAN Validation

Both workstations were configured with static IP addresses in the same `/24` subnet (`192.168.1.0/24`):
- `PC1`: `192.168.1.10`, Mask: `255.255.255.0`, Gateway: `0.0.0.0`
- `PC2`: `192.168.1.20`, Mask: `255.255.255.0`, Gateway: `0.0.0.0`

Initiated an ICMP ping from `PC1` to `PC2` and stepped through Packet Tracer's Simulation Mode to analyze packet headers at each layer:

1. **Host Bitwise Comparison**: `PC1` evaluated `(192.168.1.20 & 255.255.255.0) == (192.168.1.10 & 255.255.255.0)`. Both evaluated to `192.168.1.0`. The host identified `PC2` as local.
2. **ARP Broadcast**: `PC1` generated an Address Resolution Protocol (ARP) broadcast (`FF:FF:FF:FF:FF:FF`) querying the MAC address for `192.168.1.20`.
3. **Layer 2 Switch Forwarding**: Switch `SW1` flooded the broadcast out all ports in the same VLAN. `PC2` replied with a unicast ARP reply containing its MAC (`0001.42A3.9B12`).
4. **ICMP Delivery**: `PC1` cached the MAC address and transmitted ICMP Echo Request frames directly to `PC2`. All pings succeeded with 0% packet loss.

### Experiment 2: Deliberate Off-Boundary Subnet Fault

To observe boundary failure states, both workstations were re-addressed into custom `/28` subnets ($255.255.255.240$, increment 16):
- `PC1`: `192.168.1.50` (Resides in Subnet 3: `192.168.1.48` to `.63`)
- `PC2`: Moved to `192.168.1.70` (Resides in Subnet 4: `192.168.1.64` to `.79`)
- Gateway remained unset (`0.0.0.0`) on both machines.
- Both machines remained physically plugged into adjacent switchports on the exact same Layer 2 switch (`SW1`).

Initiated an ICMP ping from `PC1` to `PC2` (`ping 192.168.1.70`).

## 4. The Friction Point

All four ICMP echo attempts failed with `Request timed out`.

Even though both computers were powered on, linked at FastEthernet wire speed (green link lights), and plugged into the same Layer 2 collision domain, they were utterly incapable of communication.

Executing `arp -a` on `PC1` showed `No ARP Entries Found`. In fact, Packet Tracer's packet capture revealed that `PC1` did not transmit a single frame onto the physical wire.

## 5. What Went Wrong & Root Cause

### Root Cause Analysis

The failure occurred in the TCP/IP network stack on `PC1` before packet serialization took place:

1. `PC1` performed a bitwise logical `AND` between target IP `192.168.1.70` and its local subnet mask `255.255.255.240`:
   - `192.168.1.70 AND 255.255.255.240 = 192.168.1.64`
2. `PC1` compared the result to its own network ID:
   - `192.168.1.50 AND 255.255.255.240 = 192.168.1.48`
3. Because `192.168.1.64 != 192.168.1.48`, the operating system concluded that target host `192.168.1.70` is on a **remote external network**.
4. The host routing logic states: *Remote traffic must be delivered to the Default Gateway*.
5. `PC1` checked its routing table for a default gateway, found `0.0.0.0`, and immediately discarded the ICMP packet in memory. It never attempted to broadcast an ARP request for `.70`.

## 6. Verification

The root cause was validated by returning `PC2` to an in-boundary IP address within `PC1`'s subnet (`192.168.1.60/28`):

1. `PC1` calculated `192.168.1.60 AND 255.255.255.240 = 192.168.1.48` (Exact Match).
2. `PC1` immediately broadcasted an ARP request.
3. `PC2` received the frame, replied with its MAC address, and bidirectional ICMP echo replies completed in $<1$ ms.
4. `arp -a` on `PC1` showed the newly resolved entry for `192.168.1.60`.

## 7. Permanent Takeaway

Layer 2 switches operate exclusively on Ethernet frames and destination MAC addresses—they have no understanding of IP addresses, subnet masks, or gateways. The decision to send an ARP request or forward traffic to a gateway is made **entirely on the sending host** by comparing the destination IP with the local subnet mask. A Default Gateway is never queried for local communication; it exists solely as the fallback Layer 3 hop when a host determines that a packet's destination lies outside its own subnet boundary.
