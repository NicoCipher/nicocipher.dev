---
type: "research"
title: "Applying STRIDE Threat Modeling to Web Authentication Flows"
slug: "threat-modeling"
date: "2025-05-12"
status: "complete"
domain: "security"
summary: "How to use Microsoft's STRIDE framework to find security holes in a login system before writing code, and how to defend against common authentication attacks."
effort: "3h"
technologies:
  - "Threat Modeling"
  - "STRIDE"
  - "Security Architecture"
tags:
  - "Threat Modeling"
  - "Risk Management"
  - "Security"
  - "Authentication"
featured: false
evidence:
  - id: "stride-mapping"
    type: "snippet"
    title: "STRIDE Element Mapping"
    content: |
      S - Spoofing       -> Authenticity
      T - Tampering       -> Integrity
      R - Repudiation     -> Non-repudiation / Audit Evidence
      I - Info Disclosure -> Confidentiality
      D - Denial of Svc   -> Availability
      E - Elev of Priv    -> Authorization
    language: "text"
  - id: "threat-matrix"
    type: "snippet"
    title: "Authentication Flow Threat Matrix"
    content: |
      Component          Spoofing  Tampering  Repud.  InfoDisc  DoS  EoP
      ─────────────────  ────────  ─────────  ──────  ────────  ───  ───
      Login Form         HIGH      MEDIUM     LOW     MEDIUM    LOW  LOW
      Session Token      MEDIUM    HIGH       MEDIUM  HIGH      LOW  HIGH
      Password Reset     HIGH      MEDIUM     HIGH    MEDIUM    LOW  MEDIUM
      OAuth Callback     MEDIUM    LOW        LOW     HIGH      LOW  HIGH
      Admin Escalation   LOW       MEDIUM     HIGH    LOW       LOW  HIGH
    language: "text"
---

> **Quick Summary for Recruiters & Non-Technical Readers**
> - **The Business Value**: Waiting until software is built before thinking about security leads to costly emergency patches and data breaches. Threat modeling is how engineering teams identify and fix architectural weaknesses *before* writing code.
> - **What I Did**: Applied Microsoft's STRIDE framework (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to a standard web application authentication flow.
> - **The Core Takeaway**: Security is not a checkbox added at the end; it is an architectural discipline. Mapping threats early helps development teams build secure authentication and audit logging from day one.
> - **Key Skills**: STRIDE Threat Modeling, Application Security Architecture, Authentication & Authorization Design, Risk Assessment, CIA Triad Mapping.

---

## 1. Objective

Apply the STRIDE framework to a standard login flow to systematically find security weaknesses and plan defenses early, rather than guessing.

## 2. STRIDE Breakdown

### Spoofing (Pretending to be someone else)

The most common spoofing attack is stolen passwords (from phishing or database leaks). How to prevent it:

- Multi-factor authentication (MFA) so a stolen password alone isn't enough
- Rate limiting on login pages to block automated password guessing
- TLS encryption (HTTPS) so passwords can't be spied on over Wi-Fi

### Tampering (Modifying data in transit or memory)

Session tokens and cookies are the primary target. If an attacker can edit a cookie to change their role from "user" to "admin", they take over the system. How to prevent it:

- Cryptographically signed tokens (like HMAC) that cannot be altered
- `HttpOnly` and `Secure` cookie flags so browser scripts cannot tamper with tokens
- Content Security Policy (CSP) headers to block malicious scripts

### Repudiation (Denying that an action occurred)

Repudiation is about audit logs. If an admin deletes a database, can they claim *"It wasn't me, someone else did it"*? In login flows:

- Failed logins must be logged with time, IP address, and username
- Password resets must be logged and tied to the active session
- Admin permission changes must create unchangeable audit logs

Without good logs, you cannot investigate a breach.

### Information Disclosure (Leaking private data)

Login forms handle credentials. Common ways data leaks:

- Error messages that reveal if an email exists ("Wrong password" vs. "Invalid login details")
- Password reset pages that confirm whether an account exists
- Session IDs exposed in URL links
- Server logs accidentally recording plaintext passwords

### Denial of Service (Taking the service down)

Login endpoints are common targets because checking passwords requires heavy server computation (like hashing). How to prevent it:

- Limit login attempts per IP address and per user account
- Show CAPTCHAs after repeated failed attempts
- Async processing for password reset emails

### Elevation of Privilege (Gaining unauthorized powers)

The most dangerous threat. Common ways it happens:

- Insecure Direct Object References (IDOR) in session management
- JWT tokens with modifiable role claims and insufficient signature verification
- OAuth callback manipulation to obtain tokens with broader scopes than authorized

## 3. Key Insight

STRIDE is most useful as a structured checklist, not a creative guessing game. The value is in systematically checking all six categories for every piece of the login flow, rather than trying to invent wild attack scenarios. Most real-world account breaches exploit well-known weaknesses that a STRIDE checklist easily catches.

## 4. What Went Wrong

- Initially confused Repudiation with Information Disclosure. Repudiation is about audit logs and proof, not secret data. A system with no audit logs has a repudiation problem even if everything is encrypted.
- Underestimated the data leakage risk of helpful error messages. Generic error messages feel inconvenient, but saying "Username not found" gives attackers a list of valid accounts to target.
- Tried to analyze the whole application at once instead of breaking it down into small parts first. The framework works best when applied component by component.

## 5. Permanent Takeaway

STRIDE is a roadmap, not a scanner. It tells you *what categories of threats to look for*, not *whether your code is safe*. The threat matrix (see evidence above) is the practical output—a checklist that maps directly to what developers must build. Every item marked HIGH needs a clear security fix before launch.
