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
  - "Networking"
featured: true
evidence:
  - id: "dns-nslookup"
    type: "terminal"
    title: "Domain Controller DNS Verification"
    content: |
      C:\> nslookup dc01.lab.local
      Server:  UnKnown
      Address:  192.168.50.10

      Name:    dc01.lab.local
      Address:  192.168.50.10
    language: "cmd"
  - id: "dcdiag-output"
    type: "terminal"
    title: "DC Diagnostic Test Results"
    content: |
      C:\> dcdiag /test:dns
      Directory Server Diagnosis

      Performing initial setup:
         Trying to find home server...
         Home Server = dc01
         * Identified AD Forest.
         Done gathering initial info.

      Doing initial required tests
         Testing server: Default-First-Site\DC01
            Starting test: Connectivity
               ......................... DC01 passed test Connectivity

      Doing primary tests
         Testing server: Default-First-Site\DC01
            Starting test: DNS
               DNS Tests are running and not hung.
               ......................... DC01 passed test DNS
    language: "cmd"
  - id: "client-join-error"
    type: "log"
    title: "Client Domain Join Error (Before Fix)"
    content: |
      The following error occurred when DNS was queried for the
      service location (SRV) resource record used to locate an
      Active Directory Domain Controller (AD DC) for domain
      "lab.local":

      The error was: "DNS name does not exist."
      (error code 0x0000232B RCODE_NAME_ERROR)
    language: "text"
---

## 1. Objective

Stand up a single Domain Controller from scratch on a clean virtual machine and prove client domain join and DNS record resolution work end-to-end.

## 2. Environment Setup

| Component | Details |
|---|---|
| Hypervisor | VMware Workstation Pro |
| Server OS | Windows Server 2022 Standard |
| Server IP | 192.168.50.10/24 (static) |
| Client OS | Windows 10 Pro |
| Client IP | 192.168.50.20/24 (static) |
| Domain | lab.local |
| Forest Level | Windows Server 2016 |

Server was configured with a static IP, AD DS role installed via Server Manager, and promoted to a Domain Controller with an integrated DNS zone for `lab.local`.

## 3. Implementation

### AD DS Role Installation

Installed via Server Manager → Add Roles and Features. Selected:
- Active Directory Domain Services
- DNS Server (co-installed as AD-integrated)

After installation, promoted the server to a DC via the post-deployment configuration wizard, creating a new forest for `lab.local`.

### DNS Configuration

The forward lookup zone `lab.local` was created automatically during promotion. Verified that the following SRV records were registered:

- `_ldap._tcp.lab.local` — LDAP service location
- `_kerberos._tcp.lab.local` — Kerberos authentication
- `_gc._tcp.lab.local` — Global Catalog

## 4. The Friction Point

The Windows 10 client failed to join the domain with the error: *"DNS name does not exist."* The client could ping `192.168.50.10` by IP — network connectivity was fine — but domain name resolution was failing.

### Root Cause

The client's primary DNS resolver was set to `192.168.50.1` (the default gateway/router) instead of `192.168.50.10` (the Domain Controller). The router's DNS had no knowledge of the `lab.local` zone, so it returned NXDOMAIN for all Active Directory SRV record queries.

### Fix

Changed the client's primary DNS server to `192.168.50.10`. After flushing the DNS cache (`ipconfig /flushdns`), the domain join succeeded on the first attempt.

## 5. What Went Wrong

- Assumed the client would inherit DNS from DHCP — but the lab used static IPs with manually configured DNS, and I pointed it at the router instead of the DC
- Did not verify DNS resolution from the client *before* attempting the domain join
- The error message ("DNS name does not exist") was accurate but didn't explicitly say "you're asking the wrong DNS server," which required manual diagnosis

## 6. Verification

After fixing DNS:
- `nslookup dc01.lab.local` resolved correctly from the client
- Domain join completed with no errors
- `dcdiag /test:dns` passed all tests on the server
- Client appeared in Active Directory Users and Computers under the default Computers OU

## 7. Permanent Takeaway

Active Directory is fundamentally a DNS-dependent system. If clients cannot resolve the DC's SRV records, nothing works — no authentication, no group policy, no domain join. The single most common AD deployment failure is DNS misconfiguration, and the fix is always: **point every domain-joined client's primary DNS at a Domain Controller**.
