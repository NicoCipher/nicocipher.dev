---
type: "lab"
title: "Integrating Ubuntu Server into Windows Active Directory: SSSD and Domain Authentication"
slug: "ubuntu-active-directory-integration"
date: "2026-01-16"
status: "complete"
domain: "infrastructure"
summary: "Joining an Ubuntu Server to a Windows Server 2022 Active Directory domain, debugging domain user authentication failures caused by DNS SRV lookup failures, and verifying centralized identity management via SSSD."
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

## 1. Objective

Integrate a headless Ubuntu Server into an existing Windows Server 2022 Active Directory forest (`lab.local`), enabling domain users to authenticate over SSH and local terminal sessions using centralized AD credentials managed by SSSD (System Security Services Daemon) and Pluggable Authentication Modules (PAM).

## 2. Environment Setup

| Node | Operating System | Hostname | IP Address | Roles / Services |
|---|---|---|---|---|
| **Domain Controller** | Windows Server 2022 Std | `dc01.lab.local` | `192.168.50.10/24` | AD DS, AD-Integrated DNS, Kerberos KDC |
| **Linux Client** | Ubuntu Server 22.04 LTS | `srv-ubu01.lab.local` | `192.168.50.30/24` | Headless Member Server, SSSD, Realmd |
| **Gateway / Lab Router** | VyOS / Virtual Router | `gw.lab.local` | `192.168.50.1/24` | DHCP, NAT routing (Non-AD DNS) |

## 3. Implementation

### Initial Identity Strategy & Scope

Initial laboratory testing explored standing up a Samba 4 Active Directory Domain Controller on Linux. However, unresolvable package repository dependency conflicts and broken library bindings on Debian packages demonstrated that for production hybrid enterprise environments, Windows Server provides a more stable primary AD DS root, while Linux excels as an authenticated domain member.

### Headless Server Pruning

Early attempts utilized Ubuntu Desktop. The graphical display managers, power saving timeouts, and background NetworkManager overrides interfered with headless operations. The system was replaced with a minimal Ubuntu Server installation, stripping away desktop overhead and ensuring deterministic configuration through `systemd-resolved` and CLI tooling.

### Domain Enrollment Workflow

1. Installed required packages:
   ```bash
   sudo apt-get update && sudo apt-get install -y realmd sssd sssd-tools libnss-sss libpam-sss adcli samba-common-bin krb5-user
   ```
2. Queried Active Directory service discovery:
   ```bash
   realm discover lab.local
   ```
3. Executed automated domain join using administrative credentials:
   ```bash
   sudo realm join --user=Administrator lab.local
   ```
4. Configured PAM home directory auto-creation so domain users automatically receive standard `/home/<user>@<domain>` directories upon initial login:
   ```bash
   sudo pam-auth-update --enable mkhomedir
   ```

## 4. The Friction Point

Following the initial join command, `realm list` reported `configured: kerberos-member`. However, when attempting to authenticate any domain user via SSH or `su - adm-olumide@lab.local`, authentication failed immediately with:

```text
pam_sss(sshd:auth): received for user adm-olumide@lab.local: 4 (System error)
sssd_be[1850]: No available servers for service 'AD'
```

Running `id adm-olumide@lab.local` returned `no such user`, even though the Ubuntu computer account `SRV-UBU01$` was visible and enabled inside Active Directory Users and Computers on `dc01`.

### Root Cause Analysis

Inspection of `/var/log/sssd/sssd_lab.local.log` revealed that the SSSD back-end was unable to perform DNS SRV queries for `_ldap._tcp.lab.local` and `_kerberos._tcp.lab.local`.

The Linux host's resolver in `/etc/resolv.conf` was pointing to `192.168.50.1` (the laboratory gateway router) rather than `192.168.50.10` (the Active Directory Domain Controller). While the gateway was able to resolve external public internet domains, it had zero awareness of the private `.local` forward lookup zone. SSSD was unable to locate a single LDAP or Kerberos endpoint, resulting in total authentication lockout.

## 5. What Went Wrong

- **Relying on Default DHCP DNS Settings**: The Ubuntu server inherited its DNS server from the hypervisor DHCP pool instead of enforcing the AD Domain Controller as primary nameserver.
- **Treating Hostname Ping as Name Resolution**: Verified that `ping dc01.lab.local` worked via a temporary `/etc/hosts` entry, mistaking static host resolution for functional Active Directory SRV record discovery. Active Directory authentication does not use `/etc/hosts`; it requires dynamic SRV queries over DNS.
- **Samba DC Dependency Pitfall**: Attempted an ambitious Samba-based Domain Controller setup without isolated package sandboxing, which contaminated the initial image's package manager and required a clean OS redeployment.

## 6. Verification

The resolver was corrected by updating Netplan to explicitly define `192.168.50.10` as the authoritative DNS server and applying changes (`netplan apply`):

1. **DNS SRV Record Validation**:
   ```bash
   $ nslookup -type=SRV _ldap._tcp.lab.local
   _ldap._tcp.lab.local service = 0 100 389 dc01.lab.local.
   ```
2. **SSSD User Resolution**:
   `id adm-olumide@lab.local` instantly resolved UID `1844601105` and mapped AD security groups: `Domain Users` and `Domain Admins`.
3. **Kerberos Ticket Granting (TGT)**:
   Executed `kinit adm-olumide@lab.local`. Successfully obtained a ticket granting ticket from `dc01`, verified with `klist`.
4. **Interactive Shell Session**:
   Executed `su - adm-olumide@lab.local`. PAM triggered the `mkhomedir` module, provisioned `/home/adm-olumide@lab.local` with permissions `0700`, and spawned a fully functional interactive Bash session.

## 7. Permanent Takeaway

Linux Active Directory integration is fundamentally a DNS discovery problem. When Linux joins a Windows domain, every identity mechanism—from Kerberos tickets to LDAP search filters—depends on the client's ability to query SRV locator records from the AD-integrated DNS server. Never rely on `/etc/hosts` or generic gateway routers for AD member servers: **set the Domain Controller as the primary nameserver in Netplan before attempting domain enrollment**.
