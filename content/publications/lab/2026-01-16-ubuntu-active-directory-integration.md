---
type: "lab"
title: "Connecting Ubuntu Linux to Windows Active Directory: SSSD and Authentication Troubleshooting"
slug: "ubuntu-active-directory-integration"
date: "2026-01-16"
status: "complete"
domain: "infrastructure"
summary: "How I joined a headless Ubuntu Linux server to a Windows Server 2022 Active Directory domain, tracked down why domain users couldn't log in, and fixed DNS SRV lookup errors."
effort: "6h"
technologies:
  - "Ubuntu Server"
  - "Windows Server 2022"
  - "Active Directory"
  - "DNS"
  - "SSSD"
  - "PAM"
  - "Kerberos"
tags:
  - "Active Directory"
  - "Linux"
  - "Identity Management"
  - "SSSD"
  - "DNS"
  - "Authentication"
featured: true
related:
  - "domain-controller"
  - "linux-permissions"
evidence:
  - id: "realm-list"
    type: "terminal"
    title: "Realmd Active Directory Enrollment Verification"
    content: |
      $ realm list
      lab.local
        type: kerberos
        realm-name: LAB.LOCAL
        domain-name: lab.local
        configured: kerberos-member
        server-software: active-directory
        client-software: sssd
        required-package: sssd-tools
        required-package: sssd
        required-package: libnss-sss
        required-package: libpam-sss
        required-package: adcli
        required-package: samba-common-bin
        login-formats: %U@lab.local
        login-policy: allow-realm-logins
    language: "bash"
  - id: "sssd-config"
    type: "config"
    title: "SSSD Configuration (/etc/sssd/sssd.conf)"
    content: |
      [sssd]
      domains = lab.local
      config_file_version = 2
      services = nss, pam

      [domain/lab.local]
      default_shell = /bin/bash
      krb5_store_password_if_offline = True
      cache_credentials = True
      krb5_realm = LAB.LOCAL
      realmd_tags = manages-system joined-with-adcli
      id_provider = ad
      fallback_homedir = /home/%u@%d
      ad_domain = lab.local
      use_fully_qualified_names = True
      ldap_id_mapping = True
      access_provider = ad
    language: "ini"
  - id: "ad-auth-test"
    type: "terminal"
    title: "Domain User Lookup & Kerberos Ticket Issuance"
    content: |
      $ id adm-olumide@lab.local
      uid=1844601105(adm-olumide@lab.local) gid=1844600513(domain users@lab.local) groups=1844600513(domain users@lab.local),1844600512(domain admins@lab.local)

      $ kinit adm-olumide@lab.local
      Password for adm-olumide@lab.local:

      $ klist
      Ticket cache: FILE:/tmp/krb5cc_1000
      Default principal: adm-olumide@lab.local

      Valid starting       Expires              Service principal
      01/16/2026 14:22:10  01/17/2026 00:22:10  krbtgt/LAB.LOCAL@LAB.LOCAL
              renew until 01/23/2026 14:22:10
    language: "bash"
  - id: "auth-failure-log"
    type: "log"
    title: "Initial Auth Failure Log (/var/log/auth.log)"
    content: |
      Jan 08 11:14:02 srv-ubu01 sshd[1842]: pam_sss(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=192.168.50.25 user=adm-olumide@lab.local
      Jan 08 11:14:02 srv-ubu01 sshd[1842]: pam_sss(sshd:auth): received for user adm-olumide@lab.local: 4 (System error)
      Jan 08 11:14:02 srv-ubu01 sssd_be[1850]: [be[lab.local]] [fo_resolve_service_send] (0x0020): No available servers for service 'AD'
    language: "text"
---

> **Quick Summary for Recruiters & Non-Technical Readers**
> - **The Business Problem**: In a company with hundreds of employees, you cannot create separate user accounts on 50 different Linux servers. Everyone should log in with their central corporate Windows Active Directory account.
> - **What I Built**: Joined an Ubuntu Linux server to a Windows Server 2022 Active Directory domain so corporate users could log in over SSH with their normal company credentials.
> - **Where It Failed**: The domain join appeared successful, but users were locked out with "System Error". Looking at the logs, Linux had no idea where the Domain Controller lived because it was asking the home Wi-Fi router for DNS instead of the company Domain Controller.
> - **The Solution**: Configured Linux to use the Windows Domain Controller as its authoritative DNS server, enabling SSSD to discover the domain's Kerberos and LDAP services.
> - **Key Skills**: Active Directory, Linux Systems Administration, DNS Troubleshooting, Kerberos Identity Management, SSSD, PAM.

---

## 1. In Plain English: Why Connect Linux to Windows Active Directory?

Think of Active Directory (AD) like a company's **master employee directory and security badge office**. When a company hires an engineer, HR creates their account once in Active Directory. From then on, that single badge unlocks their email, their work laptop, and their internal tools.

However, many backend servers run Linux (Ubuntu, Red Hat), while corporate user accounts live in Microsoft Windows Active Directory.

Without central integration, a systems administrator would have to manually create and manage local passwords for every engineer on every Linux box. If an employee leaves the company, an admin might forget to delete their account on a single server, leaving a massive security backdoor.

By joining Linux to Active Directory using **SSSD (System Security Services Daemon)**:
- Employees log into Linux with their company credentials (`username@company.local`).
- If an account is disabled in Active Directory, their access is revoked everywhere instantly.
- Passwords and security policies are enforced centrally.

## 2. The Lab Setup

I configured a virtual lab environment to mirror a real enterprise IT deployment:

| Machine | Role | Operating System | IP Address |
|---|---|---|---|
| **Domain Controller (`dc01`)** | Central Directory & Identity Provider | Windows Server 2022 | `192.168.50.10` |
| **Linux Server (`srv-ubu01`)** | Application Server | Ubuntu Server 22.04 LTS (Headless) | `192.168.50.30` |
| **Gateway Router** | Network Gateway & Default DHCP | Virtual Router | `192.168.50.1` |

## 3. How I Connected Linux to the Domain

### Step 1: Choosing Minimal Server Over Desktop GUI

Initially, I experimented with Ubuntu Desktop. I quickly discovered that the graphical interface, desktop power savers, and background network managers created unnecessary clutter and configuration overrides. 

I switched to a clean, minimal **Ubuntu Server** installation. In production environments, servers are headless (command-line only)—this minimizes resource usage and shrinks the attack surface.

### Step 2: Installing SSSD & Realmd

On the Ubuntu server, I installed the core identity packages:
- `realmd`: The tool that automates domain enrollment.
- `sssd` & `sssd-tools`: The background service that manages logins and caches credentials so users can still log in if the network dips.
- `krb5-user`: Kerberos authentication client.

I ran the discovery and join commands:
```bash
sudo realm discover lab.local
sudo realm join --user=Administrator lab.local
```

The terminal returned: `Successfully enrolled machine in realm lab.local`.

## 4. Where Things Broke (What Went Wrong)

The machine showed up inside Active Directory on `dc01`. Everything looked great—until I actually tried to log in as a domain user:

```bash
$ su - adm-olumide@lab.local
Password:
su: System error
```

Checking `/var/log/auth.log` revealed:
```text
pam_sss(sshd:auth): received for user adm-olumide@lab.local: 4 (System error)
sssd_be[1850]: No available servers for service 'AD'
```

Even though the server was joined to the domain, SSSD insisted there were *"No available servers for service 'AD'"*.

### The Root Cause: The DNS "Phonebook" Trap

I assumed that because I could ping `dc01.lab.local` by IP address, name resolution was fine.

Here was the mistake: When Windows computers join Active Directory, they don't just ask for an IP address. They query special **DNS SRV (Service Location) records** like `_ldap._tcp.lab.local` and `_kerberos._tcp.lab.local`. These records tell computers: *"The login server is located at port 389 on DC01"*.

My Ubuntu server had received its DNS settings automatically from the lab's internet router (`192.168.50.1`). The router knew how to look up google.com, but had zero knowledge of my private `lab.local` domain. SSSD was dialing the wrong phone operator!

## 5. How I Fixed It & Verified the Solution

### The Fix

I updated Netplan (`/etc/netplan/00-installer-config.yaml`) to explicitly set the Windows Domain Controller (`192.168.50.10`) as the primary DNS server, and applied the changes (`sudo netplan apply`).

Immediately, I tested the DNS SRV query:
```bash
$ nslookup -type=SRV _ldap._tcp.lab.local
_ldap._tcp.lab.local service = 0 100 389 dc01.lab.local.
```

The Domain Controller answered back with the LDAP port.

### Verification Steps

1. **User Identity Lookup**:
   Ran `id adm-olumide@lab.local`. Linux instantly pulled the user information and mapped their Windows security groups (`Domain Admins` and `Domain Users`).
2. **Kerberos Ticket Verification**:
   Ran `kinit adm-olumide@lab.local` followed by `klist`. The ticket cache verified that Windows had granted an encrypted Kerberos ticket (`krbtgt/LAB.LOCAL@LAB.LOCAL`).
3. **Automatic Home Directory Creation**:
   Enabled `pam-auth-update --enable mkhomedir` so that when a domain user logs in for the first time, Linux automatically creates their personal folder (`/home/adm-olumide@lab.local`).
4. **Successful Login**:
   Ran `su - adm-olumide@lab.local`. The session initialized immediately with full terminal access.

## 6. What This Means for Engineering & Operations Teams

- **DNS is 90% of Active Directory Troubleshooting**: When domain joins or logins fail, don't waste hours tweaking authentication files. Check your DNS resolver first. If the client isn't querying the Domain Controller, Active Directory will not work.
- **Centralized Access Improves Security**: Managing credentials through Active Directory ensures that password policies (complexity, expiration) apply to Linux servers just as strictly as Windows workstations.
- **Headless Servers Are the Standard**: Stripping out GUI environments saves gigabytes of RAM and prevents desktop utilities from conflicting with enterprise network services.
