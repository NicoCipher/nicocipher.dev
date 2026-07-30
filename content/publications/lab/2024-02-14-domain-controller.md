---
type: "lab"
title: "Standing Up a Windows Server 2022 Domain Controller"
slug: "domain-controller"
date: "2024-02-14"
status: "complete"
domain: "infrastructure"
summary: "Provisioning Active Directory DS and DNS services from scratch and resolving client join failures caused by resolver misconfiguration."
effort: "4h"
technologies:
  - "Windows Server 2022"
  - "Active Directory"
  - "DNS"
tags:
  - "Windows Server"
  - "Active Directory"
  - "DNS"
featured: true
evidence:
  - id: "dns-nslookup"
    type: "terminal"
    title: "Domain Controller DNS Verification"
    content: |
      nslookup dc01.lab.local
      Server:  UnKnown
      Address:  192.168.50.10

      Name:    dc01.lab.local
      Address:  192.168.50.10
    language: "cmd"
---

## 1. Objective

Stand up a single Domain Controller from scratch on a clean virtual machine and prove client domain join and DNS record resolution.

## 2. Environment Setup

Windows Server 2022 on a clean VM, static IP assigned (`192.168.50.10`), AD DS role installed, forest promoted, and forward lookup zone configured.

## 3. The Friction Point

A Windows client attempted to join the domain and failed with *"An Active Directory Domain Controller could not be contacted."* Checked firewall rules and service state for 40 minutes before checking the client's DNS resolver settings — it was pointed to the home router gateway instead of the DC.

## 4. Takeaway

Check DNS first. In Active Directory, SRV and A records must be resolved directly against the DC before any downstream authentication can occur.
