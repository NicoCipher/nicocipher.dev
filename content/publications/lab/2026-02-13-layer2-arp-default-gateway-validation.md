---
type: "lab"
title: "Why Local Pings Fail: Testing Layer 2 ARP, Subnet Boundaries, and the Default Gateway Myth"
slug: "layer2-arp-default-gateway-validation"
date: "2026-02-13"
status: "complete"
domain: "networking"
summary: "An experiment in Cisco Packet Tracer showing how computers talk on a local network, why you don't need a default gateway for local pings, and why entering an off-boundary IP causes an instant timeout."
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
    title: "How a Computer Decides: Local ARP vs. Default Gateway"
    content: |
      Step 1: Your computer checks: Is destination IP in my subnet?
              Formula: (Destination_IP AND My_Subnet_Mask) == (My_IP AND My_Subnet_Mask)

      Case A (MATCH -> "It's on my local floor"):
              1. Ask the room: "Who has this IP? Tell me your MAC address" (ARP Request)
              2. Neighbor replies with its hardware MAC address.
              3. Send the data directly across the switch. (NO ROUTER NEEDED).

      Case B (MISMATCH -> "It's in another building"):
              1. Your computer cannot talk to other subnets directly.
              2. It looks for a Default Gateway (Router) to forward the message.
              3. If Default Gateway is 0.0.0.0 (unconfigured):
                 -> DROP THE PACKET IMMEDIATELY. DO NOT SEND TO WIRE.
    language: "text"
---

> **Quick Summary**
> - **Context**: Host operating systems determine whether destination traffic is local or remote by performing a bitwise AND on the destination IP and the local subnet mask.
> - **What I Tested**: In Cisco Packet Tracer, connected two endpoints to a Layer 2 switch with no router and no default gateway configured (`0.0.0.0`). Local ICMP pings succeeded via ARP resolution.
> - **Failure Scenario**: Moving the destination IP to `.70` under a `/28` mask caused pings to immediately fail with `Request timed out`, despite physical link status remaining active on the switch.
> - **Core Finding**: Packet drops occurred in the sender's local network stack: because the destination fell outside the local subnet mask and no default gateway was configured, the host dropped packets without sending ARP queries.
> - **Technologies & Concepts**: Layer 2 Ethernet Switching, ARP (Address Resolution Protocol), Subnet Boundary Diagnostics, Packet Analysis.

---

## 1. Local Network Communication vs. Gateway Routing

Think of a local office network like a **single open floor in an office building**:

- Every employee has a physical name tag (their **MAC address**).
- Every employee also has a desk number (their **IP address**).

If Alice wants to deliver a document to Bob at Desk 20 on the same floor:
1. Alice shouts out: *"Who is sitting at Desk 20?"* (This is an **ARP Request**).
2. Bob hears the shout and raises his hand: *"That's me, Bob!"* (An **ARP Reply**).
3. Alice walks over and hands Bob the paper directly through the local hallway (the **Layer 2 Switch**).

Notice what Alice *didn't* do: She didn't walk downstairs to the postal mailroom (the **Default Gateway / Router**). The postal service is only needed if Alice is sending a package to another city!

## 2. Experiment 1: Proving You Don't Need a Router for Local Traffic

To prove this experimentally, I set up a minimal lab in Cisco Packet Tracer:
- **PC1**: IP `192.168.1.10`, Subnet Mask `255.255.255.0`, Gateway `0.0.0.0`
- **PC2**: IP `192.168.1.20`, Subnet Mask `255.255.255.0`, Gateway `0.0.0.0`
- **Switch**: Cisco Catalyst 2960 (Pure Layer 2 switch)

There was no router connected to the switch. The Default Gateway field on both PCs was completely blank (`0.0.0.0`).

### The Result

I typed `ping 192.168.1.20` on PC1.

All 4 pings succeeded in $<1$ millisecond. Running `arp -a` on PC1 showed PC2's physical MAC address (`0001.42A3.9B12`) listed in the local cache.

**The Conclusion**: A switch only cares about MAC addresses. If two devices are on the same subnet, they communicate directly through the switch without touching a router or default gateway.

## 3. Experiment 2: The Deliberate Fault (Why Moving to .70 Broke Everything)

Next, I wanted to see what happens when you deliberately introduce a configuration error.

I reconfigured both computers to use a custom `/28` subnet mask (`255.255.255.240`, which splits networks into small blocks of 16 addresses):
- **PC1**: IP `192.168.1.50`, Mask `255.255.255.240` (Block: `.48` to `.63`)
- **PC2**: IP `192.168.1.70`, Mask `255.255.255.240` (Block: `.64` to `.79`)

Both machines were still plugged into ports 1 and 2 on the same physical switch. Both link lights were solid green.

I ran `ping 192.168.1.70`.

```text
Pinging 192.168.1.70 with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.
```

100% packet loss.

## 4. The Investigation: Why Did It Fail?

My first instinct was: *"Did the switch block the port? Did PC2 not receive the ping?"*

I switched Packet Tracer into **Simulation Mode** and watched the network traffic frame by frame.

To my surprise, **PC1 never sent a single packet out onto the wire**. The cable was completely silent.

### The Root Cause: The Host Operating System's Decision

Before your computer's network card ever touches the physical wire, the operating system performs a mathematical check:

1. PC1 calculated: *"Does 192.168.1.70 belong to my local subnet?"*
   - PC1's subnet: `.48` through `.63`
   - Target IP: `.70` (belongs to block `.64` through `.79`)
2. PC1's operating system concluded: *"192.168.1.70 is on a different network! I cannot deliver this locally."*
3. The rule for remote traffic: *"Hand the packet to the Default Gateway."*
4. PC1 checked its network settings for a Default Gateway. It saw `0.0.0.0` (empty).
5. Having nowhere to send the packet, **PC1 threw it in the trash inside its own memory**. It never even attempted an ARP broadcast!

## 5. The Fix & Verification

The moment I moved PC2 back to an IP address inside PC1's subnet (`192.168.1.60`):
1. PC1's subnet math matched: `192.168.1.60` is local.
2. PC1 immediately broadcasted an ARP request.
3. PC2 replied with its MAC address.
4. The pings succeeded with 0% packet loss.

## 6. Troubleshooting Takeaways

- **Don't Blame the Switch**: When two computers plugged into the same switch cannot talk, it's almost always a host configuration error (mismatched subnet masks or wrong gateway) rather than a hardware failure.
- **Understand the Default Gateway's True Purpose**: A gateway is not a magic requirement for all networking. It is simply the door to the outside world. If you are troubleshooting a closed, local industrial network or isolated lab, you don't need a gateway at all.
- **The "Request Timed Out" Clue**: When a ping times out with zero ARP entries in `arp -a`, it proves the sending machine never even attempted to ask for the target's MAC address because the subnet boundaries prevented it.
