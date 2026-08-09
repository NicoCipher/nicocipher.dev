---
type: "research"
title: "Applying STRIDE Threat Modeling to Web Authentication Flows"
slug: "threat-modeling"
date: "2025-05-12"
status: "complete"
domain: "security"
summary: "Evaluating authentication attack vectors, repudiation evidence requirements, and CIA triad mappings using the STRIDE framework."
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

## 1. Objective

Apply the STRIDE framework to a standard web application authentication flow to systematically identify threat boundaries and mitigation requirements, rather than relying on ad-hoc security thinking.

## 2. STRIDE Breakdown

### Spoofing (Authenticity)

The primary spoofing vector is credential theft — an attacker presenting valid credentials obtained through phishing, credential stuffing, or database breach. Mitigations:

- Multi-factor authentication eliminates single-credential spoofing
- Rate limiting on login endpoints prevents automated credential stuffing
- TLS 1.3 prevents man-in-the-middle credential interception

### Tampering (Integrity)

Session tokens and cookies are the primary tampering surface. If an attacker can modify a session token to change the user ID or role, they gain unauthorized access. Mitigations:

- HMAC-signed or encrypted session tokens prevent modification
- `HttpOnly` and `Secure` cookie flags prevent client-side access
- Content Security Policy headers prevent injection attacks that could modify in-flight data

### Repudiation (Non-repudiation)

This is the most misunderstood STRIDE element. Repudiation is not about data theft — it's about whether an actor can deny performing an action. In authentication flows:

- Failed login attempts must be logged with timestamp, source IP, and target account
- Password reset requests must be logged and linked to the requesting session
- Administrative privilege changes must produce immutable audit records

Without these logs, a compromised account cannot be forensically investigated.

### Information Disclosure (Confidentiality)

Authentication flows handle the most sensitive data in any application — credentials. Disclosure vectors:

- Error messages that reveal whether a username exists ("Invalid password" vs. "Invalid credentials")
- Password reset flows that confirm email registration status
- Session tokens exposed in URL parameters or referrer headers
- Server-side logs that store plaintext credentials

### Denial of Service (Availability)

Authentication endpoints are natural DoS targets because they involve expensive operations (password hashing, database lookups). Mitigations:

- Rate limiting per IP and per account
- CAPTCHA on repeated failures
- Separate authentication infrastructure from application serving

### Elevation of Privilege (Authorization)

The most dangerous authentication threat. Vectors include:

- Insecure Direct Object References (IDOR) in session management
- JWT tokens with modifiable role claims and insufficient signature verification
- OAuth callback manipulation to obtain tokens with broader scopes than authorized

## 3. Key Insight

STRIDE is most useful as a structured checklist, not a creative exercise. The value is in systematically covering all six categories for every component in the authentication flow, rather than trying to imagine novel attacks. Most real-world authentication breaches exploit well-known vectors that a STRIDE analysis would have identified.

## 4. What Went Wrong

- Initially confused Repudiation with Information Disclosure. Repudiation is about auditability and evidence, not data secrecy. A system with no audit logs has a repudiation problem even if all data is encrypted.
- Underestimated the Information Disclosure risk of error messages. Generic error messages feel like bad UX, but they eliminate a significant enumeration vector.
- Tried to apply STRIDE to the entire application at once instead of decomposing into components first. The framework works best at the component level.

## 5. Permanent Takeaway

STRIDE is a classification tool, not a detection tool. It tells you *what categories of threats to look for*, not *whether your system is vulnerable*. The threat matrix (see evidence) is the practical output — a per-component assessment that maps directly to implementation requirements. Every cell marked HIGH needs a concrete mitigation before deployment.
